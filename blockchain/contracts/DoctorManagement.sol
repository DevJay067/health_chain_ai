// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";

/**
 * @title DoctorManagement
 * @dev Manages Doctor registration requests and Admin approvals.
 */
contract DoctorManagement is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    HealthChainRoles public rolesContract;

    enum RequestStatus { None, Pending, Approved, Rejected }

    struct DoctorProfile {
        string did; // Decentralized Identifier
        bytes32 biometricCommitment; // Hash of Shamir VSS polynomial commitment
        string credentialsHash; // IPFS CID of medical license/credentials
        RequestStatus status;
        bool isActive;
    }

    mapping(address => DoctorProfile) public doctorProfiles;
    address[] public allDoctors;

    event DoctorRegistrationRequested(address indexed doctor, string did);
    event DoctorRequestApproved(address indexed doctor);
    event DoctorRequestRejected(address indexed doctor, string reason);
    event DoctorSuspended(address indexed doctor);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin, address _rolesContract) initializer public {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        
        rolesContract = HealthChainRoles(_rolesContract);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(ADMIN_ROLE)
        override
    {}

    /**
     * @dev Doctor requests registration
     */
    function requestRegistration(string memory _did, bytes32 _biometricCommitment, string memory _credentialsHash) external {
        require(doctorProfiles[msg.sender].status == RequestStatus.None || doctorProfiles[msg.sender].status == RequestStatus.Rejected, "Request already exists");
        require(!rolesContract.isPatient(msg.sender), "Address registered as patient");

        doctorProfiles[msg.sender] = DoctorProfile({
            did: _did,
            biometricCommitment: _biometricCommitment,
            credentialsHash: _credentialsHash,
            status: RequestStatus.Pending,
            isActive: false
        });

        if (doctorProfiles[msg.sender].status == RequestStatus.None) {
            allDoctors.push(msg.sender);
        }

        emit DoctorRegistrationRequested(msg.sender, _did);
    }

    /**
     * @dev Admin approves doctor registration
     */
    function approveDoctor(address _doctor) external onlyRole(ADMIN_ROLE) {
        require(doctorProfiles[_doctor].status == RequestStatus.Pending, "Request not pending");

        doctorProfiles[_doctor].status = RequestStatus.Approved;
        doctorProfiles[_doctor].isActive = true;

        // In a real scenario, this contract needs ADMIN_ROLE on rolesContract to do this.
        rolesContract.grantRole(rolesContract.DOCTOR_ROLE(), _doctor);

        emit DoctorRequestApproved(_doctor);
    }

    /**
     * @dev Admin rejects doctor registration
     */
    function rejectDoctor(address _doctor, string memory _reason) external onlyRole(ADMIN_ROLE) {
        require(doctorProfiles[_doctor].status == RequestStatus.Pending, "Request not pending");

        doctorProfiles[_doctor].status = RequestStatus.Rejected;
        
        emit DoctorRequestRejected(_doctor, _reason);
    }

    /**
     * @dev Check if address is a verified active doctor
     */
    function isDoctor(address _user) external view returns (bool) {
        return doctorProfiles[_user].status == RequestStatus.Approved && doctorProfiles[_user].isActive;
    }
}
