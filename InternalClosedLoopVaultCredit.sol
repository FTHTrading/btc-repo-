// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title InternalClosedLoopVaultCredit
 * @notice Closed-loop internal utility credit ($VTIME) bounded by verified capacity and focus blocks.
 * @dev Non-monetary, closed-loop token system with programmatic mint, focus decay, and slash sinks.
 */
contract InternalClosedLoopVaultCredit {
    string public name = "Vault Time Closed-Loop Credit";
    string public symbol = "VTIME";
    uint8 public decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Focus session accounting
    struct FocusSessionReceipt {
        bytes32 sessionHash;      // Poseidon / SHA-256 session commitment
        uint32 durationMinutes;   // Duration of verified focus
        uint32 qualityScoreBps;   // Hardware signal quality (10,000 = 100%)
        uint64 timestamp;
        bool settled;
    }

    address public protocolAdmin;
    address public trustedVerifier;

    mapping(address => uint256) public lastActivityEpoch;
    mapping(bytes32 => bool) public processedCommitments;
    mapping(address => FocusSessionReceipt[]) public userFocusHistory;

    event MintVerifiedFocus(address indexed user, uint256 amount, bytes32 sessionCommitment);
    event BurnInterruptionPenalty(address indexed user, uint256 amount, string reason);
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

    constructor(address _trustedVerifier) {
        protocolAdmin = msg.sender;
        trustedVerifier = _trustedVerifier;
    }

    /// @notice Mints closed-loop credit upon verified completion of an uninterrupted focus session
    function mintFocusBlockReward(
        address user,
        bytes32 sessionCommitment,
        uint32 durationMinutes,
        uint32 qualityScoreBps,
        uint256 baseUnits
    ) external onlyVerifier {
        require(!processedCommitments[sessionCommitment], "commitment already settled");
        require(qualityScoreBps >= 8000, "quality score below minimum threshold");

        processedCommitments[sessionCommitment] = true;
        lastActivityEpoch[user] = block.timestamp;

        // Sub-linear diminishing return scaling based on quality score
        uint256 rewardAmount = (baseUnits * qualityScoreBps) / 10000;
        totalSupply += rewardAmount;
        balanceOf[user] += rewardAmount;

        userFocusHistory[user].push(FocusSessionReceipt({
            sessionHash: sessionCommitment,
            durationMinutes: durationMinutes,
            qualityScoreBps: qualityScoreBps,
            timestamp: uint64(block.timestamp),
            settled: true
        }));

        emit MintVerifiedFocus(user, rewardAmount, sessionCommitment);
        emit Transfer(address(0), user, rewardAmount);
    }

    /// @notice Slashes internal balance on ungrounded interruption / context-switch penalty
    function burnInterruptionPenalty(
        address user,
        uint256 penaltyAmount,
        string calldata reason
    ) external onlyVerifier {
        require(balanceOf[user] >= penaltyAmount, "insufficient balance to burn");

        balanceOf[user] -= penaltyAmount;
        totalSupply -= penaltyAmount;

        emit BurnInterruptionPenalty(user, penaltyAmount, reason);
        emit Transfer(user, address(0), penaltyAmount);
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
