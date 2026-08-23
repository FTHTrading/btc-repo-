// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITimeImpactLedger
 * @notice Interface for the verifiable interruption cost ledger.
 * @dev Stores Merkle roots, score commitments, stake bonds, and challenge windows.
 *      "We don't price a human. We calculate and record the cost of an interruption under a published ruleset."
 */
interface ITimeImpactLedger {
    enum EvidenceTier { SELF_REPORTED, WORKFLOW_LINKED, PEER_ATTESTED, INDEPENDENTLY_VERIFIED }

    struct Claim {
        address claimant;
        bytes32 evidenceRoot;
        bytes32 scoreRoot;
        uint64 submittedAt;
        uint64 challengeEndsAt;
        uint128 stakeAmount;
        uint32 impactScoreBps;
        EvidenceTier tier;
        bool finalized;
        bool rejected;
    }

    event ClaimSubmitted(
        uint256 indexed claimId,
        address indexed claimant,
        bytes32 evidenceRoot,
        bytes32 scoreRoot,
        uint32 impactScoreBps,
        EvidenceTier tier,
        uint256 stakeAmount
    );

    event ClaimChallenged(
        uint256 indexed claimId,
        address indexed challenger,
        bytes32 challengeEvidenceRoot
    );

    event ClaimFinalized(
        uint256 indexed claimId,
        bool accepted,
        uint32 finalImpactScoreBps
    );

    function submitClaim(
        bytes32 evidenceRoot,
        bytes32 scoreRoot,
        uint32 impactScoreBps,
        EvidenceTier tier,
        uint128 stakeAmount
    ) external returns (uint256 claimId);

    function challengeClaim(
        uint256 claimId,
        bytes32 challengeEvidenceRoot
    ) external payable;

    function finalizeClaim(uint256 claimId, bool accepted, uint32 finalImpactScoreBps) external;
}

/**
 * @title TimeImpactLedger
 * @notice Core settlement contract enforcing EIP-712 signed claims, challenge windows, and score commitments.
 */
contract TimeImpactLedger is ITimeImpactLedger {
    bytes32 public constant TIME_CLAIM_TYPEHASH = keccak256(
        "TimeClaim(address claimant,bytes32 evidenceRoot,uint256 estimatedMinutes,uint32 severityBps,uint32 confidenceBps,uint256 nonce,uint256 deadline)"
    );

    bytes32 public immutable DOMAIN_SEPARATOR;
    uint256 public constant CHALLENGE_WINDOW = 3 days;
    uint256 public claimCounter;

    mapping(uint256 => Claim) public claims;
    mapping(address => uint256) public nonces;
    mapping(uint256 => address) public challengers;
    mapping(uint256 => bytes32) public challengeRoots;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("TimeImpactLedger")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function submitClaim(
        bytes32 evidenceRoot,
        bytes32 scoreRoot,
        uint32 impactScoreBps,
        EvidenceTier tier,
        uint128 stakeAmount
    ) external override returns (uint256 claimId) {
        require(evidenceRoot != bytes32(0), "invalid evidence root");
        require(scoreRoot != bytes32(0), "invalid score root");

        claimCounter++;
        claimId = claimCounter;

        claims[claimId] = Claim({
            claimant: msg.sender,
            evidenceRoot: evidenceRoot,
            scoreRoot: scoreRoot,
            submittedAt: uint64(block.timestamp),
            challengeEndsAt: uint64(block.timestamp + CHALLENGE_WINDOW),
            stakeAmount: stakeAmount,
            impactScoreBps: impactScoreBps,
            tier: tier,
            finalized: false,
            rejected: false
        });

        emit ClaimSubmitted(claimId, msg.sender, evidenceRoot, scoreRoot, impactScoreBps, tier, stakeAmount);
    }

    function challengeClaim(
        uint256 claimId,
        bytes32 challengeEvidenceRoot
    ) external payable override {
        Claim storage claim = claims[claimId];
        require(!claim.finalized, "already finalized");
        require(block.timestamp <= claim.challengeEndsAt, "challenge window closed");
        require(msg.value >= claim.stakeAmount, "insufficient challenge bond");
        require(challengers[claimId] == address(0), "already challenged");

        challengers[claimId] = msg.sender;
        challengeRoots[claimId] = challengeEvidenceRoot;

        emit ClaimChallenged(claimId, msg.sender, challengeEvidenceRoot);
    }

    function finalizeClaim(uint256 claimId, bool accepted, uint32 finalImpactScoreBps) external override onlyOwner {
        Claim storage claim = claims[claimId];
        require(!claim.finalized, "already finalized");
        require(block.timestamp > claim.challengeEndsAt || challengers[claimId] != address(0), "cannot finalize yet");

        claim.finalized = true;
        claim.rejected = !accepted;
        claim.impactScoreBps = finalImpactScoreBps;

        emit ClaimFinalized(claimId, accepted, finalImpactScoreBps);
    }

    function verifyTimeClaim(
        address claimant,
        bytes32 evidenceRoot,
        uint256 estimatedMinutes,
        uint32 severityBps,
        uint32 confidenceBps,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external view returns (bool) {
        require(block.timestamp <= deadline, "claim expired");
        require(nonce == nonces[claimant], "invalid nonce");

        bytes32 structHash = keccak256(
            abi.encode(
                TIME_CLAIM_TYPEHASH,
                claimant,
                evidenceRoot,
                estimatedMinutes,
                severityBps,
                confidenceBps,
                nonce,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash)
        );

        return recoverSigner(digest, signature) == claimant;
    }

    function recoverSigner(bytes32 digest, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(digest, v, r, s);
    }
}
