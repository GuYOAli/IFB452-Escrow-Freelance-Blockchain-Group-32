// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Per-job escrow contract: holds ETH and enforces the state machine.
contract EscrowAgreement {
    // Lifecycle states for one job.
    enum State {
        CREATED,
        FUNDED,
        SUBMITTED,
        RELEASED,
        DISPUTED,
        RESOLVED,
        REFUNDED
    }

    // Roles (set in constructor, immutable thereafter in practice).
    address public client;
    address public freelancer;
    address public arbitrator;

    // Escrow amount and off-chain references (hashes / URIs only).
    uint256 public amount;
    string public jobHash;
    string public deliverableHash;
    string public disputeReasonHash;

    State public state;
    bool public freelancerPaid;

    // Events form the audit trail consumed by the frontend timeline.
    event AgreementFunded(address indexed client, uint256 amount);
    event WorkSubmitted(address indexed freelancer, string deliverableHash);
    event DisputeRaised(address indexed raisedBy, string disputeReasonHash);
    event DisputeResolved(address indexed arbitrator, bool payFreelancer);
    event FundsReleased(address indexed freelancer, uint256 amount);
    event ClientRefunded(address indexed client, uint256 amount);

    // Role + state gatekeepers.
    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }

    modifier onlyFreelancer() {
        require(msg.sender == freelancer, "Only freelancer can call this");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator can call this");
        _;
    }

    modifier inState(State expectedState) {
        require(state == expectedState, "Invalid state");
        _;
    }

    // Initialises parties + amount; called by the factory.
    constructor(
        address _client,
        address _freelancer,
        address _arbitrator,
        uint256 _amount,
        string memory _jobHash
    ) {
        require(_client != address(0), "Invalid client");
        require(_freelancer != address(0), "Invalid freelancer");
        require(_arbitrator != address(0), "Invalid arbitrator");
        require(_amount >= 0, "Amount must be > 0");

        client = _client;
        freelancer = _freelancer;
        arbitrator = _arbitrator;
        amount = _amount;
        jobHash = _jobHash;
        state = State.CREATED;
    }

    // Client deposits the exact escrow amount.
    function fundAgreement() external payable onlyClient inState(State.CREATED) {
        require(msg.value == amount, "Must fund exact amount");
        state = State.FUNDED;
        emit AgreementFunded(msg.sender, msg.value);
    }

    // Freelancer submits a deliverable hash/URI.
    function submitWork(string memory _deliverableHash)
        external
        onlyFreelancer
        inState(State.FUNDED)
    {
        deliverableHash = _deliverableHash;
        state = State.SUBMITTED;
        emit WorkSubmitted(msg.sender, _deliverableHash);
    }

    // Client approves and the contract pays the freelancer.
    function approveRelease() external onlyClient inState(State.SUBMITTED) {
        state = State.RELEASED;
        freelancerPaid = true;

        (bool success, ) = payable(freelancer).call{value: address(this).balance}("");
        require(success, "Transfer to freelancer failed");

        emit FundsReleased(freelancer, amount);
    }

    // Either party can raise a dispute while funded or after submission.
    function raiseDispute(string memory _reasonHash) external {
        require(
            msg.sender == client || msg.sender == freelancer,
            "Only client or freelancer can dispute"
        );
        require(
            state == State.FUNDED || state == State.SUBMITTED,
            "Dispute not allowed now"
        );

        disputeReasonHash = _reasonHash;
        state = State.DISPUTED;
        emit DisputeRaised(msg.sender, _reasonHash);
    }

    // Arbitrator settles the dispute: pay freelancer or refund client.
    function resolveDispute(bool payFreelancer)
        external
        onlyArbitrator
        inState(State.DISPUTED)
    {
        state = State.RESOLVED;

        if (payFreelancer) {
            freelancerPaid = true;
            (bool success, ) = payable(freelancer).call{value: address(this).balance}("");
            require(success, "Transfer to freelancer failed");
            emit FundsReleased(freelancer, amount);
        } else {
            (bool success, ) = payable(client).call{value: address(this).balance}("");
            require(success, "Refund to client failed");
            emit ClientRefunded(client, amount);
        }

        emit DisputeResolved(msg.sender, payFreelancer);
    }

    // Client escape hatch when freelancer never submits.
    function refundClient() external onlyClient inState(State.FUNDED) {
        state = State.REFUNDED;

        (bool success, ) = payable(client).call{value: address(this).balance}("");
        require(success, "Refund failed");

        emit ClientRefunded(client, amount);
    }

    // View helper for the frontend.
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
