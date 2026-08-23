// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InfrastructureReserveLedger
 * @notice Enforces verifiable resource accounting and bounded utility credit limits.
 * @dev M_max = sum(Q_i * P_i * H_i) - L
 */
contract InfrastructureReserveLedger {
    struct Resource {
        bytes32 resourceType;     // e.g., keccak256("COMPUTE_GPU_HOUR"), keccak256("ENERGY_KWH")
        uint64 quantityUnits;     // Q_i: verified available units
        uint32 conversionRateBps; // P_i: published conversion factor (10,000 = 1.0)
        uint32 haircutBps;        // H_i: risk & availability discount (e.g. 8,500 = 0.85)
        uint64 lastVerifiedAt;    // Timestamp of oracle / meter attestation
        bool active;
    }

    struct ContributionRewardPool {
        uint128 totalBudget;      // B: total allocated pool cap
        uint128 distributedAmount;// currently claimed units
        uint32 baseRewardRateBps; // r: base reward multiplier
        bool active;
    }

    address public owner;
    address public oracleVerifier;

    mapping(bytes32 => Resource) public resources;
    bytes32[] public resourceKeys;

    uint128 public totalSystemLiabilities; // L: open settlement obligations
    mapping(uint256 => ContributionRewardPool) public rewardPools;

    event ResourceAttested(bytes32 indexed resourceType, uint64 quantity, uint32 haircutBps, uint64 timestamp);
    event LiabilitiesAdjusted(uint128 newTotalLiabilities);
    event ContributionRewarded(uint256 indexed poolId, address indexed contributor, uint128 rewardUnits);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleVerifier || msg.sender == owner, "not authorized verifier");
        _;
    }

    constructor(address _oracleVerifier) {
        owner = msg.sender;
        oracleVerifier = _oracleVerifier;
    }

    /// @notice Update verified infrastructure capacity with conservative haircuts
    function attestResourceCapacity(
        bytes32 resourceType,
        uint64 quantityUnits,
        uint32 conversionRateBps,
        uint32 haircutBps
    ) external onlyOracle {
        require(haircutBps <= 10000, "invalid haircut");

        if (!resources[resourceType].active) {
            resourceKeys.push(resourceType);
        }

        resources[resourceType] = Resource({
            resourceType: resourceType,
            quantityUnits: quantityUnits,
            conversionRateBps: conversionRateBps,
            haircutBps: haircutBps,
            lastVerifiedAt: uint64(block.timestamp),
            active: true
        });

        emit ResourceAttested(resourceType, quantityUnits, haircutBps, uint64(block.timestamp));
    }

    /// @notice Calculates maximum allowable credit issuance based on verified reserves:
    /// M_max = sum(Q_i * P_i * H_i) - L
    function calculateMaxIssuanceCapacity() public view returns (uint256 maxCapacity) {
        uint256 grossCapacity = 0;

        for (uint256 i = 0; i < resourceKeys.length; i++) {
            Resource memory res = resources[resourceKeys[i]];
            if (res.active) {
                uint256 baseVal = (uint256(res.quantityUnits) * res.conversionRateBps) / 10000;
                uint256 riskAdjusted = (baseVal * res.haircutBps) / 10000;
                grossCapacity += riskAdjusted;
            }
        }

        if (grossCapacity > totalSystemLiabilities) {
            maxCapacity = grossCapacity - totalSystemLiabilities;
        } else {
            maxCapacity = 0;
        }
    }

    /// @notice Distributes bounded contribution rewards under published pool budget:
    /// R = min(B - distributed, q * r * a)
    function claimContributionReward(
        uint256 poolId,
        address contributor,
        uint64 quantityDelivered,
        uint32 qualityAdjustmentBps
    ) external onlyOracle returns (uint128 rewardUnits) {
        ContributionRewardPool storage pool = rewardPools[poolId];
        require(pool.active, "pool inactive");
        require(pool.distributedAmount < pool.totalBudget, "budget exhausted");

        uint256 baseReward = (uint256(quantityDelivered) * pool.baseRewardRateBps) / 10000;
        uint256 adjustedReward = (baseReward * qualityAdjustmentBps) / 10000;

        uint128 remainingBudget = pool.totalBudget - pool.distributedAmount;
        rewardUnits = uint128(adjustedReward < remainingBudget ? adjustedReward : remainingBudget);

        pool.distributedAmount += rewardUnits;
        emit ContributionRewarded(poolId, contributor, rewardUnits);
    }
}
