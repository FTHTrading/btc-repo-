// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DaliInvariantAssetNFT
 * @notice ERC-721 collection for the 15 Salvador Dali Invariant visual protocol artifacts.
 * @dev Binds SHA-256 evidence seals and IPFS metadata CIDs directly to immutable on-chain token IDs.
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
    uint256 public nextTokenId = 1;
    uint256 public constant MAX_SUPPLY = 15;

    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => AssetMetadata) public tokenMetadata;
    mapping(address => uint256) public balanceOf;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 evidenceSha256,
        string ipfsMetadataUri,
        uint64 mintedAt
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
        address recipient,
        bytes32 evidenceSha256,
        string calldata ipfsMetadataUri
    ) external onlyOwner returns (uint256 tokenId) {
        require(nextTokenId <= MAX_SUPPLY, "max supply reached");
        tokenId = nextTokenId++;

        ownerOf[tokenId] = recipient;
        balanceOf[recipient]++;

        tokenMetadata[tokenId] = AssetMetadata({
            tokenId: tokenId,
            evidenceSha256: evidenceSha256,
            ipfsMetadataUri: ipfsMetadataUri,
            mintedAt: uint64(block.timestamp),
            initialOwner: recipient
        });

        emit AssetMinted(tokenId, recipient, evidenceSha256, ipfsMetadataUri, uint64(block.timestamp));
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
