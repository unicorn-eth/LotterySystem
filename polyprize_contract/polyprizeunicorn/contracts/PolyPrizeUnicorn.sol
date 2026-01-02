// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Use OpenZeppelin for core security features, manual pause implementation
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

// Interface for Thirdweb AccountFactory to check if address is a registered smart account
interface IAccountFactory {
    function isRegistered(address account) external view returns (bool);
}

// Coded lovingly by @cryptowampum and Claude AI
contract PolyPrizeUnicorn is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10000;

    // Manual Pausable Implementation (avoiding problematic import)
    bool private _paused = false;

    // Allow minting after drawing date (for continued engagement/campaign segmentation)
    bool public allowMintingAfterDrawing = false;

    // Soulbound configuration
    bool public immutable isSoulbound;

    // Account factory for free minting (smart accounts from this factory mint free)
    address public immutable accountFactory;

    // Mint price for direct minters (not from factory)
    uint256 public mintPrice;

    // Collection metadata
    string private _collectionName;
    string private _collectionDescription;

    uint256 public drawingDate;
    uint256 private _nextTokenId = 1;
    string private baseImageURI;      // Static image (PNG/JPG)
    string private baseAnimationURI;  // MP4 video
    mapping(address => bool) public hasMinted;
    mapping(uint256 => address) public minters;

    // Events
    event DrawingDateUpdated(uint256 oldDate, uint256 newDate);
    event BaseImageURIUpdated(string oldURI, string newURI);
    event BaseAnimationURIUpdated(string oldURI, string newURI);
    event Minted(address indexed to, uint256 indexed tokenId, bool paidMint);
    event AllowMintingAfterDrawingUpdated(bool oldValue, bool newValue);
    event CollectionDescriptionUpdated(string oldDescription, string newDescription);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    // Manual Pausable Events
    event Paused(address account);
    event Unpaused(address account);

    constructor(
        string memory collectionName_,     // ERC721 name (e.g., "My NFT Collection")
        string memory symbol_,             // ERC721 symbol (e.g., "MNFT")
        string memory collectionDescription_, // Description for tokenURI
        string memory baseImageURI_,       // The IPFS static image URI
        string memory baseAnimationURI_,   // The IPFS MP4 video URI
        uint256 drawingDate_,              // Unix timestamp
        bool isSoulbound_,                 // Whether transfers are blocked
        address accountFactory_,           // Thirdweb AccountFactory address (for free mints)
        uint256 mintPrice_                 // Price for direct mints (in wei, 0 = free for all)
    )
        ERC721(collectionName_, symbol_)
        Ownable(msg.sender)
    {
        require(bytes(collectionName_).length > 0, "Collection name cannot be empty");
        require(bytes(symbol_).length > 0, "Symbol cannot be empty");
        require(bytes(baseImageURI_).length > 0, "Base image URI cannot be empty");
        require(bytes(baseAnimationURI_).length > 0, "Base animation URI cannot be empty");
        require(drawingDate_ > block.timestamp, "Drawing date must be in future");

        _collectionName = collectionName_;
        _collectionDescription = collectionDescription_;
        baseImageURI = baseImageURI_;
        baseAnimationURI = baseAnimationURI_;
        drawingDate = drawingDate_;
        isSoulbound = isSoulbound_;
        accountFactory = accountFactory_;
        mintPrice = mintPrice_;
    }

    // Manual Pausable Implementation
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() public onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    // Helper function to check if token exists (compatible across OpenZeppelin versions)
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < _nextTokenId;
    }

    // Check if caller is a registered smart account from the factory
    function _isFromFactory(address account) internal view returns (bool) {
        if (accountFactory == address(0)) {
            return false;
        }
        try IAccountFactory(accountFactory).isRegistered(account) returns (bool registered) {
            return registered;
        } catch {
            return false;
        }
    }

    // Main contract modifiers and functions
    modifier beforeDrawing() {
        require(
            block.timestamp < drawingDate || allowMintingAfterDrawing,
            "Minting period is over"
        );
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        _;
    }

    function mint() external payable beforeDrawing whenNotPaused {
        require(!hasMinted[msg.sender], "Already minted");

        // Check if payment is required
        bool isFactoryAccount = _isFromFactory(msg.sender);
        bool paidMint = false;

        if (!isFactoryAccount && mintPrice > 0) {
            require(msg.value >= mintPrice, "Insufficient payment for direct mint");
            paidMint = true;
        }

        hasMinted[msg.sender] = true;
        uint256 tokenId = _nextTokenId++;
        minters[tokenId] = msg.sender;
        emit Minted(msg.sender, tokenId, paidMint);
        _safeMint(msg.sender, tokenId);
    }

    // Required overrides for OpenZeppelin v5 compatibility
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        // SOULBOUND: Block transfers except mints and burns (if enabled)
        if (isSoulbound) {
            address from = _ownerOf(tokenId);
            if (from != address(0) && to != address(0)) {
                revert("Soulbound: transfers disabled");
            }
        }

        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    // SOULBOUND: Block all approvals if soulbound (specify both overridden contracts)
    function approve(address to, uint256 tokenId) public override(ERC721, IERC721) {
        if (isSoulbound) {
            revert("Soulbound: approvals disabled");
        }
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC721) {
        if (isSoulbound) {
            revert("Soulbound: approvals disabled");
        }
        super.setApprovalForAll(operator, approved);
    }

    // On-chain metadata with Base64 encoding for proper JSON handling
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_tokenExists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) != address(0), "Token was burned or never minted");

        address minter = minters[tokenId];
        string memory walletStr = Strings.toHexString(uint160(minter), 20);

        // Build description based on soulbound status
        string memory description = bytes(_collectionDescription).length > 0
            ? _collectionDescription
            : string(abi.encodePacked(
                isSoulbound ? "Soulbound NFT" : "NFT",
                " minted to wallet ",
                walletStr
            ));

        // Build JSON metadata
        bytes memory json = abi.encodePacked(
            '{"name":"', _collectionName, ' #', tokenId.toString(), '",',
            '"description":"', description, '",',
            '"image":"', baseImageURI, '",',
            '"animation_url":"', baseAnimationURI, '",',
            '"attributes":[',
                '{"trait_type":"Wallet","value":"', walletStr, '"},',
                '{"trait_type":"Drawing Date","display_type":"date","value":', drawingDate.toString(), '},',
                '{"trait_type":"Soulbound","value":"', isSoulbound ? "Yes" : "No", '"}',
            ']}'
        );

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(json)
        ));
    }

    // Drawing Date management (can only extend the window)
    function setDrawingDate(uint256 newDate) external onlyOwner {
        require(newDate > drawingDate, "Can only extend drawing date");
        require(newDate > block.timestamp, "Drawing date must be in future");

        uint256 oldDate = drawingDate;
        drawingDate = newDate;
        emit DrawingDateUpdated(oldDate, newDate);
    }

    // Set mint price for direct minters
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    // Utility functions
    function isMintingActive() external view returns (bool) {
        return (block.timestamp < drawingDate || allowMintingAfterDrawing) && !_paused;
    }

    // Check if an address would mint for free
    function isFreeForAddress(address account) external view returns (bool) {
        return _isFromFactory(account) || mintPrice == 0;
    }

    // Toggle allow minting after drawing date
    function setAllowMintingAfterDrawing(bool _allow) external onlyOwner {
        bool oldValue = allowMintingAfterDrawing;
        allowMintingAfterDrawing = _allow;
        emit AllowMintingAfterDrawingUpdated(oldValue, _allow);
    }

    function timeUntilDrawing() external view returns (uint256) {
        return block.timestamp < drawingDate ? drawingDate - block.timestamp : 0;
    }

    function withdrawETH() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "ETH withdrawal failed");
    }

    // Update collection description
    function updateCollectionDescription(string memory newDescription) external onlyOwner {
        string memory oldDescription = _collectionDescription;
        _collectionDescription = newDescription;
        emit CollectionDescriptionUpdated(oldDescription, newDescription);
    }

    // Update static image URI
    function updateBaseImageURI(string memory newBaseImageURI) external onlyOwner {
        require(bytes(newBaseImageURI).length > 0, "Base image URI cannot be empty");
        string memory oldURI = baseImageURI;
        baseImageURI = newBaseImageURI;
        emit BaseImageURIUpdated(oldURI, newBaseImageURI);
    }

    // Update animation/video URI
    function updateBaseAnimationURI(string memory newBaseAnimationURI) external onlyOwner {
        require(bytes(newBaseAnimationURI).length > 0, "Base animation URI cannot be empty");
        string memory oldURI = baseAnimationURI;
        baseAnimationURI = newBaseAnimationURI;
        emit BaseAnimationURIUpdated(oldURI, newBaseAnimationURI);
    }

    // View functions
    function getBaseImageURI() external view returns (string memory) {
        return baseImageURI;
    }

    function getBaseAnimationURI() external view returns (string memory) {
        return baseAnimationURI;
    }

    function getCollectionDescription() external view returns (string memory) {
        return _collectionDescription;
    }

    // Required override for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
