// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./EscrowAgreement.sol";

// Registry contract: whitelists arbitrators and deploys EscrowAgreement instances per job.
contract EscrowFactory {
    address public owner;

    uint256 public agreementCount;
    mapping(uint256 => address) public agreements;

    mapping(address => bool) public approvedArbitrators;

    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed agreementAddress,
        address indexed client,
        address freelancer,
        address arbitrator,
        uint256 amount,
        string jobHash
    );
    event ArbitratorApproved(address indexed arbitrator);
    event ArbitratorRevoked(address indexed arbitrator);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Deployer becomes the platform owner.
    constructor() {
        owner = msg.sender;
    }

    // Whitelist an arbitrator (admin).
    function approveArbitrator(address _arbitrator) external onlyOwner {
        require(_arbitrator != address(0), "Invalid arbitrator");
        approvedArbitrators[_arbitrator] = true;
        emit ArbitratorApproved(_arbitrator);
    }

    // Remove an arbitrator from the whitelist (admin).
    function revokeArbitrator(address _arbitrator) external onlyOwner {
        approvedArbitrators[_arbitrator] = false;
        emit ArbitratorRevoked(_arbitrator);
    }

    // Client opens a new escrow; deploys a fresh EscrowAgreement and registers it.
    function createAgreement(
        address _freelancer,
        address _arbitrator,
        uint256 _amount,
        string memory _jobHash
    ) external returns (uint256 agreementId, address agreementAddress) {
        require(approvedArbitrators[_arbitrator], "Arbitrator not approved");

        EscrowAgreement agreement = new EscrowAgreement(
            msg.sender,
            _freelancer,
            _arbitrator,
            _amount,
            _jobHash
        );

        agreementId = agreementCount;
        agreements[agreementId] = address(agreement);
        agreementCount = agreementCount + 1;

        emit AgreementCreated(
            agreementId,
            address(agreement),
            msg.sender,
            _freelancer,
            _arbitrator,
            _amount,
            _jobHash
        );

        return (agreementId, address(agreement));
    }

    // View helper used by the Admin page.
    function isArbitratorApproved(address _arbitrator) external view returns (bool) {
        return approvedArbitrators[_arbitrator];
    }
}
