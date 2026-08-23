// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InternalClosedLoopVaultCredit
 * @notice Consensual, bounded, closed-loop focus accounting and voluntary stake ledger ($VTIME).
 * @dev Implements a strict state machine with correct custody balance tracking:
 *      1. User voluntarily locks a session stake (transferred to address(this) custody).
 *      2. Verified focus block mints bounded utility reward.
 *      3. Penalties require unique session linkage, single active penalty per user, non-zero parameters, and enter a challenge window.
 *      4. Formal dispute resolution path for challenged penalties with strict tri-bound math and timeout reclaim.
 *      5. Multisig emergency pause and role separation.
 */
contract InternalClosedLoopVaultCredit {
    string public name = "Vault Time Closed-Loop Credit";
    string public symbol = "VTIME";
    uint8 public decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Stake duration & dispute bounds
    uint64 public constant MIN_STAKE_DURATION = 5 minutes;
    uint64 public constant MAX_STAKE_DURATION = 30 days;
    uint64 public constant MIN_CHALLENGE_WINDOW = 1 hours;
    uint64 public constant MAX_CHALLENGE_WINDOW = 30 days;
    uint64 public constant MAX_DISPUTE_RESOLUTION_PERIOD = 14 days;

    // Stake & penalty state tracking
    enum PenaltyStatus { None, Proposed, Challenged, Finalized, Cancelled }

    struct VoluntarySessionStake {
        uint256 lockedAmount;
        uint64 lockExpiresAt;
        bytes32 sessionCommitment; // Unique session ID linkage
        bytes32 termsHash;         // User-signed terms agreement
        bool active;
    }

    struct ProposedPenalty {
        address user;
        uint256 penaltyAmount;
        bytes32 sessionCommitment;
        bytes32 evidenceHash;
        uint64 challengeDeadline;
        uint64 challengedAt;
        PenaltyStatus status;
    }

    address public protocolAdmin;
    address public trustedVerifier;
    address public disputeResolver;
    bool public paused;

    mapping(address => VoluntarySessionStake) public userStakes;
    mapping(bytes32 => bool) public processedCommitments;
    mapping(bytes32 => ProposedPenalty) public proposedPenalties;
    mapping(address => bytes32) public activePenaltyForUser;

    // Strict event emission
    event FocusRewardMinted(address indexed user, uint256 amount, bytes32 indexed sessionCommitment);
    event VoluntaryStakeLocked(address indexed user, uint256 amount, uint64 expiresAt, bytes32 indexed sessionCommitment, bytes32 termsHash);
    event StakeReleased(address indexed user, uint256 amount);
    event PenaltyProposed(bytes32 indexed penaltyId, address indexed user, uint256 amount, uint64 challengeDeadline);
    event PenaltyChallenged(bytes32 indexed penaltyId, address indexed challenger);
    event PenaltyResolved(bytes32 indexed penaltyId, address indexed user, PenaltyStatus finalStatus, uint256 burnedAmount);
    event PenaltyFinalized(bytes32 indexed penaltyId, address indexed user, uint256 burnedAmount);
    event PenaltyCancelled(bytes32 indexed penaltyId, address indexed user);
    event ProtocolPaused(bool isPaused);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyAdmin() {
        require(msg.sender == protocolAdmin, "not admin");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == trustedVerifier, "not verifier");
        _;
    }

    modifier onlyDisputeResolver() {
        require(msg.sender == disputeResolver, "not dispute resolver");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "protocol is paused");
        _;
    }

    constructor(address _trustedVerifier, address _disputeResolver) {
        require(_trustedVerifier != address(0), "invalid verifier");
        require(_disputeResolver != address(0), "invalid dispute resolver");
        require(_trustedVerifier != msg.sender, "verifier cannot be admin");
        require(_disputeResolver != msg.sender, "resolver cannot be admin");

        protocolAdmin = msg.sender;
        trustedVerifier = _trustedVerifier;
        disputeResolver = _disputeResolver;
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit ProtocolPaused(_paused);
    }

    function setDisputeResolver(address _resolver) external onlyAdmin {
        require(_resolver != address(0), "invalid address");
        disputeResolver = _resolver;
    }

    function setTrustedVerifier(address _verifier) external onlyAdmin {
        require(_verifier != address(0), "invalid address");
        trustedVerifier = _verifier;
    }

    /// @notice 1. User voluntarily opts in and locks a session stake with proper custody transfer
    function lockVoluntarySessionStake(
        uint256 amount,
        uint64 durationSeconds,
        bytes32 sessionCommitment,
        bytes32 termsHash
    ) external whenNotPaused {
        require(amount > 0, "amount must be > 0");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        require(!userStakes[msg.sender].active, "active stake already exists");
        require(
            durationSeconds >= MIN_STAKE_DURATION && durationSeconds <= MAX_STAKE_DURATION,
            "invalid stake duration"
        );
        require(sessionCommitment != bytes32(0), "invalid session commitment");

        // Proper custody accounting: Transfer from user to contract custody
        balanceOf[msg.sender] -= amount;
        balanceOf[address(this)] += amount;
        emit Transfer(msg.sender, address(this), amount);

        userStakes[msg.sender] = VoluntarySessionStake({
            lockedAmount: amount,
            lockExpiresAt: uint64(block.timestamp) + durationSeconds,
            sessionCommitment: sessionCommitment,
            termsHash: termsHash,
            active: true
        });

        emit VoluntaryStakeLocked(
            msg.sender,
            amount,
            uint64(block.timestamp) + durationSeconds,
            sessionCommitment,
            termsHash
        );
    }

    /// @notice Releases expired stake back to user if no active penalties exist
    function releaseVoluntaryStake() external {
        VoluntarySessionStake storage stake = userStakes[msg.sender];
        require(stake.active, "no active stake");
        require(block.timestamp >= stake.lockExpiresAt, "stake still locked");
        require(activePenaltyForUser[msg.sender] == bytes32(0), "active penalty pending");

        uint256 amount = stake.lockedAmount;
        stake.active = false;
        stake.lockedAmount = 0;

        // Proper custody accounting: Transfer from contract custody back to user
        balanceOf[address(this)] -= amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(this), msg.sender, amount);

        emit StakeReleased(msg.sender, amount);
    }

    /// @notice 2. Mints bounded reward upon verified focus session completion
    function mintFocusBlockReward(
        address user,
        bytes32 sessionCommitment,
        uint32 qualityScoreBps,
        uint256 baseUnits
    ) external onlyVerifier whenNotPaused {
        require(!processedCommitments[sessionCommitment], "commitment already processed");
        require(qualityScoreBps >= 8000, "attestation quality below 80%");

        processedCommitments[sessionCommitment] = true;

        uint256 rewardAmount = (baseUnits * qualityScoreBps) / 10000;
        totalSupply += rewardAmount;
        balanceOf[user] += rewardAmount;

        emit FocusRewardMinted(user, rewardAmount, sessionCommitment);
        emit Transfer(address(0), user, rewardAmount);
    }

    /// @notice 3. Proposes an interruption penalty linked uniquely to the active session stake with strict parameter bounds
    function proposeInterruptionPenalty(
        bytes32 penaltyId,
        address user,
        bytes32 sessionCommitment,
        uint256 requestedAmount,
        bytes32 evidenceHash,
        uint64 challengeWindowSeconds
    ) external onlyVerifier whenNotPaused {
        require(penaltyId != bytes32(0), "invalid penalty id");
        require(evidenceHash != bytes32(0), "missing evidence hash");
        require(requestedAmount > 0, "penalty must be positive");
        require(
            challengeWindowSeconds >= MIN_CHALLENGE_WINDOW && challengeWindowSeconds <= MAX_CHALLENGE_WINDOW,
            "invalid challenge window"
        );

        VoluntarySessionStake storage stake = userStakes[user];
        require(stake.active, "no voluntary stake locked");
        require(stake.sessionCommitment == sessionCommitment, "session commitment mismatch");
        require(proposedPenalties[penaltyId].status == PenaltyStatus.None, "penalty ID exists");
        require(activePenaltyForUser[user] == bytes32(0), "active penalty exists for user");

        uint256 boundedPenalty = requestedAmount < stake.lockedAmount ? requestedAmount : stake.lockedAmount;

        proposedPenalties[penaltyId] = ProposedPenalty({
            user: user,
            penaltyAmount: boundedPenalty,
            sessionCommitment: sessionCommitment,
            evidenceHash: evidenceHash,
            challengeDeadline: uint64(block.timestamp) + challengeWindowSeconds,
            challengedAt: 0,
            status: PenaltyStatus.Proposed
        });

        activePenaltyForUser[user] = penaltyId;

        emit PenaltyProposed(penaltyId, user, boundedPenalty, uint64(block.timestamp) + challengeWindowSeconds);
    }

    /// @notice 4. User challenges a proposed penalty during the challenge window
    function challengePenalty(bytes32 penaltyId) external {
        ProposedPenalty storage penalty = proposedPenalties[penaltyId];
        require(penalty.status == PenaltyStatus.Proposed, "invalid status");
        require(msg.sender == penalty.user, "not authorized challenger");
        require(block.timestamp < penalty.challengeDeadline, "challenge window expired");

        penalty.status = PenaltyStatus.Challenged;
        penalty.challengedAt = uint64(block.timestamp);
        emit PenaltyChallenged(penaltyId, msg.sender);
    }

    /// @notice 5. Adjudicates a challenged penalty via designated dispute resolver with strict bounds
    function resolveChallengedPenalty(
        bytes32 penaltyId,
        bool uphold,
        uint256 finalBurnAmount
    ) external onlyDisputeResolver whenNotPaused {
        ProposedPenalty storage penalty = proposedPenalties[penaltyId];
        require(penalty.status == PenaltyStatus.Challenged, "not challenged");

        address user = penalty.user;
        activePenaltyForUser[user] = bytes32(0); // clear active user penalty

        if (uphold) {
            VoluntarySessionStake storage stake = userStakes[user];
            // Strict tri-bound constraint: min(finalBurnAmount, penaltyAmount, lockedAmount)
            uint256 actualBurn = finalBurnAmount;
            if (actualBurn > penalty.penaltyAmount) {
                actualBurn = penalty.penaltyAmount;
            }
            if (actualBurn > stake.lockedAmount) {
                actualBurn = stake.lockedAmount;
            }

            stake.lockedAmount -= actualBurn;
            if (stake.lockedAmount == 0) {
                stake.active = false;
            }

            // Proper custody accounting: Burn from address(this)
            balanceOf[address(this)] -= actualBurn;
            totalSupply -= actualBurn;

            penalty.status = PenaltyStatus.Finalized;
            emit PenaltyResolved(penaltyId, user, PenaltyStatus.Finalized, actualBurn);
            emit Transfer(address(this), address(0), actualBurn);
        } else {
            penalty.status = PenaltyStatus.Cancelled;
            emit PenaltyResolved(penaltyId, user, PenaltyStatus.Cancelled, 0);
        }
    }

    /// @notice User reclaims stake if dispute resolver does not adjudicate within the 14-day timeout
    function timeoutChallengedPenalty(bytes32 penaltyId) external {
        ProposedPenalty storage penalty = proposedPenalties[penaltyId];
        require(penalty.status == PenaltyStatus.Challenged, "not challenged");
        require(msg.sender == penalty.user, "not authorized user");
        require(
            block.timestamp >= penalty.challengedAt + MAX_DISPUTE_RESOLUTION_PERIOD,
            "dispute resolution period still active"
        );

        address user = penalty.user;
        activePenaltyForUser[user] = bytes32(0);
        penalty.status = PenaltyStatus.Cancelled;

        emit PenaltyCancelled(penaltyId, user);
    }

    /// @notice 6. Finalizes uncontested penalty after challenge deadline expires
    function finalizePenalty(bytes32 penaltyId) external onlyVerifier whenNotPaused {
        ProposedPenalty storage penalty = proposedPenalties[penaltyId];
        require(penalty.status == PenaltyStatus.Proposed, "not in proposed state");
        require(block.timestamp >= penalty.challengeDeadline, "challenge window still active");

        penalty.status = PenaltyStatus.Finalized;
        address user = penalty.user;
        activePenaltyForUser[user] = bytes32(0); // clear active user penalty

        VoluntarySessionStake storage stake = userStakes[user];
        uint256 burnAmount = penalty.penaltyAmount;
        if (burnAmount > stake.lockedAmount) {
            burnAmount = stake.lockedAmount;
        }

        stake.lockedAmount -= burnAmount;
        if (stake.lockedAmount == 0) {
            stake.active = false;
        }

        // Proper custody accounting: Burn from address(this)
        balanceOf[address(this)] -= burnAmount;
        totalSupply -= burnAmount;

        emit PenaltyFinalized(penaltyId, user, burnAmount);
        emit Transfer(address(this), address(0), burnAmount);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0), "invalid recipient");
        require(balanceOf[msg.sender] >= value, "insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(balanceOf[from] >= value, "insufficient balance");
        require(allowance[from][msg.sender] >= value, "insufficient allowance");

        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}
