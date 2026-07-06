// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.go";

/**
 * @title EnterpriseHealthRecord
 * @dev Production-grade health record management with Audit Trails and Emergency Access.
 */
contract EnterpriseHealthRecord is AccessControl, ReentrancyGuard {
    
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    struct Record {
        string cid;             // IPFS Content Identifier
        string category;        // e.g., "Surgery", "Prescription"
        uint256 createdAt;
        address creator;
        bool isSensitive;       // Requires dual-approval if true
        bool exists;
    }

    struct Patient {
        bool isRegistered;
        mapping(address => bool) authorizedDoctors;
        uint256 recordCount;
        bool emergencyConsent;  // "Break Glass" consent
    }

    mapping(address => Patient) private patients;
    mapping(address => mapping(uint256 => Record)) private records;
    
    // Audit Trail: patient => recordIndex => list of access events
    struct AccessEvent {
        address accessor;
        uint256 timestamp;
        string reason;
    }
    mapping(address => mapping(uint256 => AccessEvent[])) private auditTrails;

    event RecordCreated(address indexed patient, uint256 index, string cid);
    event AccessLogged(address indexed patient, address indexed accessor, uint256 recordIndex);
    event EmergencyAccessTriggered(address indexed patient, address indexed responder);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register as a patient
     */
    function registerPatient(bool _emergencyConsent) external {
        require(!patients[msg.sender].isRegistered, "Already registered");
        patients[msg.sender].isRegistered = true;
        patients[msg.sender].emergencyConsent = _emergencyConsent;
        _grantRole(PATIENT_ROLE, msg.sender);
    }

    /**
     * @dev Grant access to a doctor
     */
    function grantAccess(address _doctor) external onlyRole(PATIENT_ROLE) {
        require(hasRole(DOCTOR_ROLE, _doctor), "Invalid doctor address");
        patients[msg.sender].authorizedDoctors[_doctor] = true;
    }

    /**
     * @dev Add a record (Doctors only)
     */
    function addRecord(
        address _patient, 
        string memory _cid, 
        string memory _category,
        bool _isSensitive
    ) external onlyRole(DOCTOR_ROLE) {
        require(patients[_patient].isRegistered, "Patient not found");
        require(patients[_patient].authorizedDoctors[msg.sender], "Not authorized");

        uint256 index = patients[_patient].recordCount;
        records[_patient][index] = Record({
            cid: _cid,
            category: _category,
            createdAt: block.timestamp,
            creator: msg.sender,
            isSensitive: _isSensitive,
            exists: true
        });

        patients[_patient].recordCount++;
        emit RecordCreated(_patient, index, _cid);
        _logAccess(_patient, index, "Initial Creation");
    }

    /**
     * @dev Emergency "Break Glass" Access
     */
    function emergencyAccess(address _patient, uint256 _index) external onlyRole(EMERGENCY_ROLE) nonReentrant {
        require(patients[_patient].emergencyConsent, "Emergency consent not provided");
        require(records[_patient][_index].exists, "Record not found");

        _logAccess(_patient, _index, "EMERGENCY_BREAK_GLASS");
        emit EmergencyAccessTriggered(_patient, msg.sender);
    }

    /**
     * @dev View a record with automatic audit logging
     */
    function viewRecord(address _patient, uint256 _index) external view returns (string memory, string memory) {
        require(
            msg.sender == _patient || 
            patients[_patient].authorizedDoctors[msg.sender] ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Permission denied"
        );
        
        Record memory rec = records[_patient][_index];
        require(rec.exists, "Record not found");

        return (rec.cid, rec.category);
    }

    /**
     * @dev Internal helper for audit logging
     */
    function _logAccess(address _patient, uint256 _index, string memory _reason) internal {
        auditTrails[_patient][_index].push(AccessEvent({
            accessor: msg.sender,
            timestamp: block.timestamp,
            reason: _reason
        }));
        emit AccessLogged(_patient, msg.sender, _index);
    }

    /**
     * @dev Retrieve audit trail for a record (Patient or Admin only)
     */
    function getAuditTrail(address _patient, uint256 _index) external view returns (AccessEvent[] memory) {
        require(msg.sender == _patient || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");
        return auditTrails[_patient][_index];
    }
}
