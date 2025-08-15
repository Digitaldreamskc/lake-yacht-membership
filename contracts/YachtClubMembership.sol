// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/**
 * @title Lake Stockton Yacht Club Membership NFT
 * @dev ERC-721 contract with ERC-2981 royalty support for yacht club memberships
 * Includes NFC card linking functionality for real-world identification
 */
contract YachtClubMembership is ERC721, ERC721URIStorage, IERC2981, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;
    
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
    
    // NFC Card data structure
    struct NFCCard {
        string cardId;           // Unique NFC card identifier
        string serialNumber;     // Physical card serial number
        uint256 linkedAt;        // Timestamp when card was linked
        bool isActive;           // Whether the card is active
        string cardType;         // Type of NFC card (e.g., "Standard", "Premium")
    }
    
    // Member info
    struct MemberInfo {
        MemberTier tier;
        uint256 mintedAt;
        string email; // For admin reference
        bool active;
        NFCCard nfcCard;        // NFC card information
        bool hasNFCCard;        // Whether member has an NFC card linked
    }
    
    mapping(uint256 => MemberInfo) public memberInfo;
    mapping(address => uint256) public memberTokenId; // One token per address
    
    // NFC card tracking
    mapping(string => uint256) public nfcCardToToken; // cardId -> tokenId
    mapping(string => bool) public nfcCardExists;     // cardId -> exists
    
    // Events
    event MembershipMinted(uint256 indexed tokenId, address indexed member, MemberTier tier, string email);
    event MemberTierUpdated(uint256 indexed tokenId, MemberTier oldTier, MemberTier newTier);
    event NFCCardLinked(uint256 indexed tokenId, string cardId, string serialNumber);
    event NFCCardUnlinked(uint256 indexed tokenId, string cardId);
    event NFCCardDeactivated(uint256 indexed tokenId, string cardId);
    event TransferRestrictionUpdated(bool restricted);
    event MarketplaceApprovalUpdated(address indexed marketplace, bool approved);
    event AuthorizedMinterUpdated(address indexed oldMinter, address indexed newMinter);
    
    modifier onlyAuthorizedMinter() {
        require(msg.sender == authorizedMinter || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(
        address authorizedMinter_,
        address royaltyRecipient_,
        uint96 royaltyFraction_
    ) ERC721("Lake Stockton Yacht Club Membership", "LSYCM") Ownable(msg.sender) {
        authorizedMinter = authorizedMinter_;
        _royaltyRecipient = royaltyRecipient_;
        _royaltyFraction = royaltyFraction_; // e.g., 1000 for 10%
        
        // Start token IDs at 1
        _tokenIdCounter++;
    }
    
    /**
     * @dev Mint membership NFT to a member
     * @param to Member address
     * @param tier Member tier
     * @param email Member email for admin reference
     * @param tokenURI_ Metadata URI
     */
    function mintMembership(
        address to,
        MemberTier tier,
        string memory email,
        string memory tokenURI_
    ) external onlyAuthorizedMinter nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(memberTokenId[to] == 0, "Member already has a token");
        require(bytes(tokenURI_).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        memberInfo[tokenId] = MemberInfo({
            tier: tier,
            mintedAt: block.timestamp,
            email: email,
            active: true,
            nfcCard: NFCCard({
                cardId: "",
                serialNumber: "",
                linkedAt: 0,
                isActive: false,
                cardType: ""
            }),
            hasNFCCard: false
        });
        
        memberTokenId[to] = tokenId;
        
        emit MembershipMinted(tokenId, to, tier, email);
        
        return tokenId;
    }
    
    /**
     * @dev Link NFC card to membership NFT (admin only)
     * @param tokenId The token ID to link the card to
     * @param cardId Unique NFC card identifier
     * @param serialNumber Physical card serial number
     * @param cardType Type of NFC card
     */
    function linkNFCCard(
        uint256 tokenId,
        string memory cardId,
        string memory serialNumber,
        string memory cardType
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(bytes(cardId).length > 0, "Card ID cannot be empty");
        require(!nfcCardExists[cardId], "NFC card already exists");
        require(!memberInfo[tokenId].hasNFCCard, "Member already has an NFC card");
        
        // Link the card
        memberInfo[tokenId].nfcCard = NFCCard({
            cardId: cardId,
            serialNumber: serialNumber,
            linkedAt: block.timestamp,
            isActive: true,
            cardType: cardType
        });
        memberInfo[tokenId].hasNFCCard = true;
        
        // Update tracking mappings
        nfcCardToToken[cardId] = tokenId;
        nfcCardExists[cardId] = true;
        
        emit NFCCardLinked(tokenId, cardId, serialNumber);
    }
    
    /**
     * @dev Unlink NFC card from membership NFT (admin only)
     * @param tokenId The token ID to unlink the card from
     */
    function unlinkNFCCard(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(memberInfo[tokenId].hasNFCCard, "Member does not have an NFC card");
        
        string memory cardId = memberInfo[tokenId].nfcCard.cardId;
        
        // Remove the card link
        delete memberInfo[tokenId].nfcCard;
        memberInfo[tokenId].hasNFCCard = false;
        
        // Update tracking mappings
        delete nfcCardToToken[cardId];
        delete nfcCardExists[cardId];
        
        emit NFCCardUnlinked(tokenId, cardId);
    }
    
    /**
     * @dev Deactivate NFC card (admin only)
     * @param tokenId The token ID to deactivate the card for
     */
    function deactivateNFCCard(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(memberInfo[tokenId].hasNFCCard, "Member does not have an NFC card");
        
        memberInfo[tokenId].nfcCard.isActive = false;
        
        emit NFCCardDeactivated(tokenId, memberInfo[tokenId].nfcCard.cardId);
    }
    
    /**
     * @dev Reactivate NFC card (admin only)
     * @param tokenId The token ID to reactivate the card for
     */
    function reactivateNFCCard(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(memberInfo[tokenId].hasNFCCard, "Member does not have an NFC card");
        
        memberInfo[tokenId].nfcCard.isActive = true;
    }
    
    /**
     * @dev Get NFC card info by card ID
     * @param cardId The NFC card identifier
     * @return tokenId The token ID the card is linked to
     * @return isActive Whether the card is active
     * @return cardType The type of card
     */
    function getNFCCardInfo(string memory cardId) external view returns (
        uint256 tokenId,
        bool isActive,
        string memory cardType
    ) {
        require(nfcCardExists[cardId], "NFC card does not exist");
        
        tokenId = nfcCardToToken[cardId];
        NFCCard memory card = memberInfo[tokenId].nfcCard;
        isActive = card.isActive;
        cardType = card.cardType;
    }
    
    /**
     * @dev Verify NFC card for real-world usage
     * @param cardId The NFC card identifier
     * @return isValid Whether the card is valid for use
     * @return memberAddress The member address if valid
     * @return tier The member tier if valid
     */
    function verifyNFCCard(string memory cardId) external view returns (
        bool isValid,
        address memberAddress,
        MemberTier tier
    ) {
        if (!nfcCardExists[cardId]) {
            return (false, address(0), MemberTier.Standard);
        }
        
        uint256 tokenId = nfcCardToToken[cardId];
        MemberInfo memory member = memberInfo[tokenId];
        
        if (!member.active || !member.hasNFCCard || !member.nfcCard.isActive) {
            return (false, address(0), MemberTier.Standard);
        }
        
        address owner = ownerOf(tokenId);
        return (true, owner, member.tier);
    }
    
    /**
     * @dev Update member tier (admin only)
     */
    function updateMemberTier(uint256 tokenId, MemberTier newTier) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        MemberTier oldTier = memberInfo[tokenId].tier;
        memberInfo[tokenId].tier = newTier;
        
        emit MemberTierUpdated(tokenId, oldTier, newTier);
    }
    
    /**
     * @dev Deactivate membership (admin only)
     */
    function deactivateMembership(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        memberInfo[tokenId].active = false;
    }
    
    /**
     * @dev Reactivate membership (admin only)
     */
    function reactivateMembership(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
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
     * Note: Transfer restrictions are temporarily disabled due to OpenZeppelin v5 compatibility
     * TODO: Implement transfer restrictions using the correct OpenZeppelin v5 hooks
     */
    
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
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * _royaltyFraction) / 10000;
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Get member info by token ID
     */
    function getMemberInfo(uint256 tokenId) external view returns (MemberInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
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
    // Note: _burn is not virtual in newer OpenZeppelin versions
    
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
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}