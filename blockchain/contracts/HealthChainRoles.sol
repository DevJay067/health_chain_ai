// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title HealthChainRoles
 * @dev Identity & Profile Management for HealthChain.AI.
 * Manages DIDs, core roles (Patient, Admin).
 */
contract HealthChainRoles is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct UserProfile {
        string did; // Decentralized Identifier
        bytes32 biometricCommitment; // Hash of Shamir VSS polynomial commitment for DTBV
        bool isRegistered;
        bool isActive;
    }

    mapping(address => UserProfile) public patientProfiles;
    mapping(address => UserProfile) public adminProfiles;

    event PatientRegistered(address indexed patient, string did);
    event AdminRegistered(address indexed admin, string did);
    event BiometricCommitmentUpdated(address indexed user, bytes32 commitment);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin) initializer public {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        
        _setRoleAdmin(DOCTOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PATIENT_ROLE, ADMIN_ROLE);
        
        adminProfiles[defaultAdmin] = UserProfile({
            did: "did:healthchain:admin:genesis",
            biometricCommitment: bytes32(0),
            isRegistered: true,
            isActive: true
        });
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(ADMIN_ROLE)
        override
    {}

    /**
     * @dev Register a new patient
     * @param _did Decentralized Identifier string
     * @param _biometricCommitment DTBV (3,5) Shamir VSS polynomial commitment hash
     */
    function registerPatient(string memory _did, bytes32 _biometricCommitment) external {
        require(!patientProfiles[msg.sender].isRegistered, "Patient already registered");
        require(!hasRole(DOCTOR_ROLE, msg.sender), "Address registered as doctor");

        patientProfiles[msg.sender] = UserProfile({
            did: _did,
            biometricCommitment: _biometricCommitment,
            isRegistered: true,
            isActive: true
        });

        _grantRole(PATIENT_ROLE, msg.sender);
        emit PatientRegistered(msg.sender, _did);
        emit BiometricCommitmentUpdated(msg.sender, _biometricCommitment);
    }

    /**
     * @dev Check if address is a registered patient
     */
    function isPatient(address _user) external view returns (bool) {
        return patientProfiles[_user].isRegistered && patientProfiles[_user].isActive;
    }
}
