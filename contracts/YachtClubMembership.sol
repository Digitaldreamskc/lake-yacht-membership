// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Lake Stockton Yacht Club Membership NFT
 * @dev ERC-721 contract with ERC-2981 royalty support for yacht club memberships
 */
contract YachtClubMembership is ERC721, ERC721URIStorage, IERC2981, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Royalty info
    address private _royaltyRecipient;
    uint96 private _royaltyFraction; // basis points (e.g., 1000 = 10%)
    
    // Authorized minter (backend service)
    address public authorizedMinter;
    
    // Transfer restrictions
    bool public transfersRestricted = true;
    mapping(address => bool) public approvedMarketplaces;
    
    // Member tiers
    enum MemberTier { Standard, Premium, Elite, Lifetime }
    
    // Member info
    struct MemberInfo {
        MemberTier tier;
        uint256 mintedAt;
        string email; // For admin reference
        bool active;
    }
    
    mapping(uint256 => MemberInfo) public memberInfo;
    mapping(address => uint256) public memberTokenId; // One token per address
    
    // Events
    event MembershipMinted(uint256 indexed tokenId, address indexed member, MemberTier tier, string email);
    event MemberTierUpdated(uint256 indexed tokenId, MemberTier oldTier, MemberTier newTier);
    event TransferRestrictionUpdated(bool restricted);
    event MarketplaceApprovalUpdated(address indexed marketplace, bool approved);
    event AuthorizedMinterUpdated(address indexed oldMinter, address indexed newMinter);
    
    modifier onlyAuthorizedMinter() {
        require(msg.sender == authorizedMinter || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(
        address _authorizedMinter,
        address _royaltyRecipient,
        uint96 _royaltyFraction
    ) ERC721("Lake Stockton Yacht Club Membership", "LSYCM") {
        authorizedMinter = _authorizedMinter;
        _royaltyRecipient = _royaltyRecipient;
        _royaltyFraction = _royaltyFraction; // e.g., 1000 for 10%
        
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }
    
    /**
     * @dev Mint membership NFT to a member
     * @param to Member address
     * @param tier Member tier
     * @param email Member email for admin reference
     * @param tokenURI Metadata URI
     */
    function mintMembership(
        address to,
        MemberTier tier,
        string memory email,
        string memory tokenURI
    ) external onlyAuthorizedMinter nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(memberTokenId[to] == 0, "Member already has a token");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        memberInfo[tokenId] = MemberInfo({
            tier: tier,
            mintedAt: block.timestamp,
            email: email,
            active: true
        });
        
        memberTokenId[to] = tokenId;
        
        emit MembershipMinted(tokenId, to, tier, email);
        
        return tokenId;
    }
    
    /**
     * @dev Update member tier (admin only)
     */
    function updateMemberTier(uint256 tokenId, MemberTier newTier) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        MemberTier oldTier = memberInfo[tokenId].tier;
        memberInfo[tokenId].tier = newTier;
        
        emit MemberTierUpdated(tokenId, oldTier, newTier);
    }
    
    /**
     * @dev Deactivate membership (admin only)
     */
    function deactivateMembership(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        memberInfo[tokenId].active = false;
    }
    
    /**
     * @dev Reactivate membership (admin only)
     */
    function reactivateMembership(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        memberInfo[tokenId].active = true;
    }
    
    /**
     * @dev Set authorized minter address
     */
    function setAuthorizedMinter(address _authorizedMinter) external onlyOwner {
        address oldMinter = authorizedMinter;
        authorizedMinter = _authorizedMinter;
        emit AuthorizedMinterUpdated(oldMinter, _authorizedMinter);
    }
    
    /**
     * @dev Set transfer restrictions
     */
    function setTransferRestricted(bool _restricted) external onlyOwner {
        transfersRestricted = _restricted;
        emit TransferRestrictionUpdated(_restricted);
    }
    
    /**
     * @dev Approve/disapprove marketplace for transfers
     */
    function setMarketplaceApproval(address marketplace, bool approved) external onlyOwner {
        approvedMarketplaces[marketplace] = approved;
        emit MarketplaceApprovalUpdated(marketplace, approved);
    }
    
    /**
     * @dev Override transfer to implement restrictions
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Check transfer restrictions
        if (transfersRestricted) {
            require(
                approvedMarketplaces[msg.sender] || 
                msg.sender == owner() ||
                msg.sender == from, 
                "Transfers restricted to approved marketplaces"
            );
        }
        
        // Update member token mapping
        if (from != address(0)) {
            memberTokenId[from] = 0;
        }
        if (to != address(0)) {
            require(memberTokenId[to] == 0, "Recipient already has a membership");
            memberTokenId[to] = tokenId;
        }
    }
    
    /**
     * @dev Set royalty info
     */
    function setRoyaltyInfo(address recipient, uint96 fraction) external onlyOwner {
        _royaltyRecipient = recipient;
        _royaltyFraction = fraction;
    }
    
    /**
     * @dev ERC-2981 royalty info
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(tokenId), "Token does not exist");
        
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * _royaltyFraction) / 10000;
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
    
    /**
     * @dev Get member info by token ID
     */
    function getMemberInfo(uint256 tokenId) external view returns (MemberInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return memberInfo[tokenId];
    }
    
    /**
     * @dev Get token ID by member address
     */
    function getTokenIdByMember(address member) external view returns (uint256) {
        return memberTokenId[member];
    }
    
    /**
     * @dev Check if address is a member
     */
    function isMember(address account) external view returns (bool) {
        uint256 tokenId = memberTokenId[account];
        return tokenId != 0 && memberInfo[tokenId].active;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}