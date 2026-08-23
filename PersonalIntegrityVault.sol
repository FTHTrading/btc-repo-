// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PersonalIntegrityVault
 * @notice Self-Sovereign, First-Person Focus Accounting & Non-Transferable Personal Integrity Credit ($VTIME).
 * @dev Strict first-person invariants:
 *      1. NON-TRANSFERABLE closed-loop internal utility credit (transfers strictly blocked).
 *      2. Participant ALONE initiates, commits, and self-finalizes their sessions.
 *      3. Anti-replay protection: sessionCommitment, localProofHash, and score commitments can only be used once.
 *      4. Strict session timing bounds (5 minutes minimum, 24 hours maximum).
 *      5. Strict event caps (100 VTIME max per event) and daily mint caps (300 VTIME max per day).
 *      6. Non-monetary internal utility credit with voluntary burns/closure rituals.
 */
contract PersonalIntegrityVault {
    string public name = "Personal Integrity Credit";
    string public symbol = "VTIME";
    uint8 public decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // Daily and per-event credit limits (in whole token units with 18 decimals)
    uint256 public constant MAX_CREDITS_PER_EVENT = 100 * 1e18; // 100 units max per event
    uint256 public constant DAILY_CREDIT_CAP = 300 * 1e18;      // 300 units max per day
    uint64 public constant MIN_SESSION_DURATION = 5 minutes;
    uint64 public constant MAX_SESSION_DURATION = 24 hours;

    enum SessionStatus { None, Committed, SelfFinalized, VoluntarilyBurned, Cancelled }

    struct PersonalSession {
        address participant;
        bytes32 sessionCommitment;
        bytes32 localProofHash;
        bytes32 rulesetHash;
        uint64 startedAt;
        uint64 finalizedAt;
        uint128 voluntaryStake;
        uint128 creditsMinted;
        SessionStatus status;
    }

    address public protocolAdmin;
    bool public paused;

    mapping(bytes32 => PersonalSession) public sessions;
    mapping(bytes32 => bool) public usedSessionCommitments;
    mapping(bytes32 => bool) public usedProofs;
    mapping(address => mapping(uint256 => uint256)) public dailyMinted; // participant => dayIndex => amount

    event PersonalSessionCommitted(
        bytes32 indexed sessionId,
        address indexed participant,
        bytes32 indexed sessionCommitment,
        uint128 voluntaryStake,
        bytes32 rulesetHash
    );
    event PersonalCreditMinted(
        bytes32 indexed sessionId,
        address indexed participant,
        bytes32 localProofHash,
        uint128 amountMinted,
        bytes32 rulesetHash
    );
    event VoluntaryClosureBurn(
        bytes32 indexed sessionId,
        address indexed participant,
        uint256 burnedAmount,
        string reason
    );
    event StakeReleased(address indexed participant, uint256 amount);
    event ProtocolPaused(bool isPaused);
    event Transfer(address indexed from, address indexed to, uint256 value);

    modifier onlyAdmin() {
        require(msg.sender == protocolAdmin, "not admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "protocol is paused");
        _;
    }

    constructor() {
        protocolAdmin = msg.sender;
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit ProtocolPaused(_paused);
    }

    /// @notice 1. Participant starts and commits to an opt-in focus session with one-time session commitment
    function commitPersonalSession(
        bytes32 sessionId,
        bytes32 sessionCommitment,
        bytes32 rulesetHash,
        uint128 voluntaryStake
    ) external whenNotPaused {
        require(sessionId != bytes32(0), "invalid session ID");
        require(sessionCommitment != bytes32(0), "invalid session commitment");
        require(!usedSessionCommitments[sessionCommitment], "session commitment already used");
        require(sessions[sessionId].status == SessionStatus.None, "session already exists");

        usedSessionCommitments[sessionCommitment] = true;

        if (voluntaryStake > 0) {
            require(balanceOf[msg.sender] >= voluntaryStake, "insufficient balance for voluntary stake");
            balanceOf[msg.sender] -= voluntaryStake;
            balanceOf[address(this)] += voluntaryStake;
            emit Transfer(msg.sender, address(this), voluntaryStake);
        }

        sessions[sessionId] = PersonalSession({
            participant: msg.sender,
            sessionCommitment: sessionCommitment,
            localProofHash: bytes32(0),
            rulesetHash: rulesetHash,
            startedAt: uint64(block.timestamp),
            finalizedAt: 0,
            voluntaryStake: voluntaryStake,
            creditsMinted: 0,
            status: SessionStatus.Committed
        });

        emit PersonalSessionCommitted(sessionId, msg.sender, sessionCommitment, voluntaryStake, rulesetHash);
    }

    /// @notice 2. Participant ALONE self-finalizes their session within timing bounds
    function finalizePersonalSession(
        bytes32 sessionId,
        bytes32 localProofHash,
        uint128 requestedCredits
    ) external whenNotPaused {
        PersonalSession storage session = sessions[sessionId];
        require(session.participant == msg.sender, "participant only: first-person invariant");
        require(session.status == SessionStatus.Committed, "session not committable");
        require(localProofHash != bytes32(0), "missing local proof hash");
        require(!usedProofs[localProofHash], "proof hash already used");
        require(requestedCredits > 0, "zero credit request");

        uint64 duration = uint64(block.timestamp) - session.startedAt;
        require(duration >= MIN_SESSION_DURATION, "session duration below minimum");
        require(duration <= MAX_SESSION_DURATION, "session duration above maximum");

        // Enforce event cap and daily cap: C = min(requested, 100 VTIME, C_daily_remaining)
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentDayTotal = dailyMinted[msg.sender][currentDay];
        require(currentDayTotal < DAILY_CREDIT_CAP, "daily mint cap reached");

        uint128 boundedCredits = requestedCredits;
        if (boundedCredits > MAX_CREDITS_PER_EVENT) {
            boundedCredits = uint128(MAX_CREDITS_PER_EVENT);
        }

        uint256 remainingDaily = DAILY_CREDIT_CAP - currentDayTotal;
        if (boundedCredits > remainingDaily) {
            boundedCredits = uint128(remainingDaily);
        }

        usedProofs[localProofHash] = true;
        session.localProofHash = localProofHash;
        session.creditsMinted = boundedCredits;
        session.finalizedAt = uint64(block.timestamp);
        session.status = SessionStatus.SelfFinalized;

        dailyMinted[msg.sender][currentDay] += boundedCredits;
        totalSupply += boundedCredits;
        balanceOf[msg.sender] += boundedCredits;

        // Return voluntary stake to participant
        if (session.voluntaryStake > 0) {
            uint256 stake = session.voluntaryStake;
            session.voluntaryStake = 0;
            balanceOf[address(this)] -= stake;
            balanceOf[msg.sender] += stake;
            emit Transfer(address(this), msg.sender, stake);
            emit StakeReleased(msg.sender, stake);
        }

        emit PersonalCreditMinted(sessionId, msg.sender, localProofHash, boundedCredits, session.rulesetHash);
        emit Transfer(address(0), msg.sender, boundedCredits);
    }

    /// @notice 3. Voluntary Closure Ritual: Participant chooses to burn stake/credits to seal closure
    function executeVoluntaryClosureBurn(
        bytes32 sessionId,
        uint256 burnAmount,
        string calldata reason
    ) external whenNotPaused {
        PersonalSession storage session = sessions[sessionId];
        require(session.participant == msg.sender, "participant only");
        require(session.status == SessionStatus.Committed, "session not active");

        session.status = SessionStatus.VoluntarilyBurned;
        session.finalizedAt = uint64(block.timestamp);

        uint256 actualBurn = burnAmount;
        if (actualBurn > session.voluntaryStake) {
            actualBurn = session.voluntaryStake;
        }

        if (actualBurn > 0) {
            session.voluntaryStake -= uint128(actualBurn);
            balanceOf[address(this)] -= actualBurn;
            totalSupply -= actualBurn;
            emit VoluntaryClosureBurn(sessionId, msg.sender, actualBurn, reason);
            emit Transfer(address(this), address(0), actualBurn);
        }

        // Return any remaining unburned stake
        if (session.voluntaryStake > 0) {
            uint256 remainder = session.voluntaryStake;
            session.voluntaryStake = 0;
            balanceOf[address(this)] -= remainder;
            balanceOf[msg.sender] += remainder;
            emit Transfer(address(this), msg.sender, remainder);
            emit StakeReleased(msg.sender, remainder);
        }
    }

    // Explicit Non-Transferability Invariants (Closed-Loop Personal Utility Only)
    function transfer(address, uint256) external pure returns (bool) {
        revert("VTIME is a non-transferable personal integrity credit");
    }

    function approve(address, uint256) external pure returns (bool) {
        revert("VTIME is a non-transferable personal integrity credit");
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert("VTIME is a non-transferable personal integrity credit");
    }
}
