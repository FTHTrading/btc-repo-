// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DaliInvariantAssetNFT
 * @notice ERC-721 collection for the 15 Salvador Dali Invariant visual protocol artifacts.
 * @dev Enforces immutable evidence binding:
 *      1. Valid token ID range (1 to 15).
 *      2. Non-zero evidence SHA-256 seal.
 *      3. Unique evidence enforcement (no seal re-use).
 *      4. Standard ERC-721 event emission and queryable metadata.
 */
contract DaliInvariantAssetNFT {
    string public name = "All Couch No Cage - Dali Invariant Collection";
    string public symbol = "DALI";

    struct AssetMetadata {
        uint256 tokenId;
        bytes32 evidenceSha256;   // SHA-256 evidence root hash
        string ipfsMetadataUri;   // ipfs://Qm...
        uint64 mintedAt;
        address initialOwner;
    }

    address public contractOwner;
    uint256 public constant MAX_SUPPLY = 15;

    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => AssetMetadata) public tokenMetadata;
    mapping(address => uint256) public balanceOf;
    mapping(bytes32 => bool) private _usedEvidence;

    event InvariantAssetMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        bytes32 indexed evidenceSha256,
        string tokenURI,
        uint256 mintedAt
    );
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "not contract owner");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    /// @notice Mints an indisputable visual artifact with its cryptographic evidence seal
    function mintInvariantAsset(
        uint256 tokenId,
        address recipient,
        bytes32 evidenceSha256,
        string calldata ipfsMetadataUri
    ) external onlyOwner {
        require(tokenId >= 1 && tokenId <= MAX_SUPPLY, "invalid token id");
        require(ownerOf[tokenId] == address(0), "already minted");
        require(recipient != address(0), "invalid recipient");
        require(bytes(ipfsMetadataUri).length > 0, "missing metadata");
        require(evidenceSha256 != bytes32(0), "missing seal");
        require(!_usedEvidence[evidenceSha256], "evidence already used");

        _usedEvidence[evidenceSha256] = true;
        ownerOf[tokenId] = recipient;
        balanceOf[recipient]++;

        tokenMetadata[tokenId] = AssetMetadata({
            tokenId: tokenId,
            evidenceSha256: evidenceSha256,
            ipfsMetadataUri: ipfsMetadataUri,
            mintedAt: uint64(block.timestamp),
            initialOwner: recipient
        });

        emit InvariantAssetMinted(tokenId, recipient, evidenceSha256, ipfsMetadataUri, block.timestamp);
        emit Transfer(address(0), recipient, tokenId);
    }

    /// @notice Returns the full verification receipt for any token ID
    function getAssetVerification(uint256 tokenId)
        external
        view
        returns (
            address owner,
            bytes32 evidenceSha256,
            string memory ipfsMetadataUri,
            uint64 mintedAt
        )
    {
        require(ownerOf[tokenId] != address(0), "token does not exist");
        AssetMetadata memory meta = tokenMetadata[tokenId];
        return (ownerOf[tokenId], meta.evidenceSha256, meta.ipfsMetadataUri, meta.mintedAt);
    }
}
