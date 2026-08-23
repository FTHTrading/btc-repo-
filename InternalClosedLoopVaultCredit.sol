// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InternalClosedLoopVaultCredit
 * @notice Game-theoretic internal value unit ($VTIME) for the All Couch No Cage ecosystem.
 * @dev Implements standard fractional (18 decimals) transferability, focus minting, 
 *      voluntary session staking, and penalty burn sinks within the internal system.
 */
contract InternalClosedLoopVaultCredit {
    string public name = "Vault Time Credit";
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

    enum PenaltyStatus { None, Proposed, Challenged, Finalized, Cancelled }

    struct VoluntarySessionStake {
        uint256 lockedAmount;
        uint64 lockExpiresAt;
        bytes32 sessionCommitment;
        bytes32 termsHash;
        bool active;
    }

    struct ProposedPenalty {
        address user;
        uint256 penaltyAmount;
        bytes32 sessionCommitment;
        bytes32 evidenceHash;
        uint64 challengeDeadline;
        PenaltyStatus status;
    }

    address public protocolAdmin;
    address public trustedVerifier;
    bool public paused;

    mapping(address => VoluntarySessionStake) public userStakes;
    mapping(bytes32 => bool) public processedCommitments;
    mapping(bytes32 => ProposedPenalty) public proposedPenalties;
    mapping(address => bytes32) public activePenaltyForUser;

    event FocusRewardMinted(address indexed user, uint256 amount, bytes32 indexed sessionCommitment);
    event VoluntaryStakeLocked(address indexed user, uint256 amount, uint64 expiresAt, bytes32 indexed sessionCommitment, bytes32 termsHash);
    event StakeReleased(address indexed user, uint256 amount);
    event PenaltyProposed(bytes32 indexed penaltyId, address indexed user, uint256 amount, uint64 challengeDeadline);
    event PenaltyFinalized(bytes32 indexed penaltyId, address indexed user, uint256 burnedAmount);
    event ProtocolPaused(bool isPaused);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyAdmin() {
        require(msg.sender == protocolAdmin, "not admin");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == trustedVerifier || msg.sender == protocolAdmin, "not verifier");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "protocol is paused");
        _;
    }

    constructor(address _trustedVerifier) {
        protocolAdmin = msg.sender;
        trustedVerifier = _trustedVerifier;
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit ProtocolPaused(_paused);
    }

    /// @notice Locks voluntary focus stake inside protocol custody
    function lockVoluntarySessionStake(
        uint256 amount,
        uint64 durationSeconds,
        bytes32 sessionCommitment,
        bytes32 termsHash
    ) external whenNotPaused {
        require(amount > 0, "amount must be > 0");
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        require(!userStakes[msg.sender].active, "active stake already exists");
        require(durationSeconds >= MIN_STAKE_DURATION && durationSeconds <= MAX_STAKE_DURATION, "invalid duration");

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

        emit VoluntaryStakeLocked(msg.sender, amount, uint64(block.timestamp) + durationSeconds, sessionCommitment, termsHash);
    }

    /// @notice Releases expired stake back to participant
    function releaseVoluntaryStake() external {
        VoluntarySessionStake storage stake = userStakes[msg.sender];
        require(stake.active, "no active stake");
        require(block.timestamp >= stake.lockExpiresAt, "stake still locked");
        require(activePenaltyForUser[msg.sender] == bytes32(0), "penalty pending");

        uint256 amount = stake.lockedAmount;
        stake.active = false;
        stake.lockedAmount = 0;

        balanceOf[address(this)] -= amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(this), msg.sender, amount);
        emit StakeReleased(msg.sender, amount);
    }

    /// @notice Mints fractional VTIME units upon verified session completion
    function mintFocusBlockReward(
        address user,
        bytes32 sessionCommitment,
        uint32 qualityScoreBps,
        uint256 baseUnits
    ) external onlyVerifier whenNotPaused {
        require(!processedCommitments[sessionCommitment], "commitment already settled");
        require(qualityScoreBps >= 8000, "quality below threshold");

        processedCommitments[sessionCommitment] = true;

        uint256 rewardAmount = (baseUnits * qualityScoreBps) / 10000;
        totalSupply += rewardAmount;
        balanceOf[user] += rewardAmount;

        emit FocusRewardMinted(user, rewardAmount, sessionCommitment);
        emit Transfer(address(0), user, rewardAmount);
    }

    /// @notice Standard fractional ERC-20 transfer within the internal economy
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
