// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";
import "./AccessRequest.sol";
import "./DoctorManagement.sol";

/**
 * @title HealthRecord
 * @dev Core EHR contract storing IPFS CIDs. Uses UUPS Upgradeability.
 */
contract HealthRecord is Initializable, AccessControlUpgradeable, ReentrancyGuard, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EHR_WRITER_ROLE = keccak256("EHR_WRITER_ROLE"); // For EmergencyAccess or verified oracles

    HealthChainRoles public rolesContract;
    AccessRequest public accessRequestContract;
    DoctorManagement public doctorContract;

    struct Record {
        uint256 id;
        string encryptedCid;     // IPFS Content Identifier (encrypted off-chain with AES-256)
        string metadataHash;     // Hash of the metadata for integrity check
        uint256 timestamp;
        address author;
        bool exists;
    }

    struct AuditLog {
        address accessor;
        uint256 timestamp;
        string action; // "CREATE_RECORD", "VIEW_RECORD", "EMERGENCY_ACCESS"
        string reason;
    }

    // patient => recordId => Record
    mapping(address => mapping(uint256 => Record)) private patientRecords;
    // patient => total records
    mapping(address => uint256) public patientRecordCounts;
    
    // patient => recordId => AuditLog[]
    mapping(address => mapping(uint256 => AuditLog[])) private recordAudits;

    event RecordAdded(address indexed patient, uint256 indexed recordId, address indexed author);
    event AuditLogged(address indexed patient, address indexed accessor, uint256 recordId, string action);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address defaultAdmin, 
        address _rolesContract,
        address _accessRequestContract,
        address _doctorContract
    ) initializer public {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);

        rolesContract = HealthChainRoles(_rolesContract);
        accessRequestContract = AccessRequest(_accessRequestContract);
        doctorContract = DoctorManagement(_doctorContract);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(ADMIN_ROLE)
        override
    {}

    /**
     * @dev Add a new health record for a patient. Must be an authorized doctor or the patient themselves.
     */
    function addRecord(address _patient, string memory _encryptedCid, string memory _metadataHash) external nonReentrant {
        require(rolesContract.isPatient(_patient), "Invalid patient");
        
        bool isSelf = (msg.sender == _patient);
        bool isAuthorizedDoctor = accessRequestContract.hasAccess(_patient, msg.sender);
        bool isSystemWriter = hasRole(EHR_WRITER_ROLE, msg.sender);

        require(isSelf || isAuthorizedDoctor || isSystemWriter, "Unauthorized to add record");

        uint256 recordId = patientRecordCounts[_patient]++;
        
        patientRecords[_patient][recordId] = Record({
            id: recordId,
            encryptedCid: _encryptedCid,
            metadataHash: _metadataHash,
            timestamp: block.timestamp,
            author: msg.sender,
            exists: true
        });

        _logAccess(_patient, msg.sender, recordId, "CREATE_RECORD", "Uploaded new medical record");
        emit RecordAdded(_patient, recordId, msg.sender);
    }

    /**
     * @dev View a specific health record.
     */
    function viewRecord(address _patient, uint256 _recordId) external nonReentrant returns (string memory, string memory, uint256, address) {
        Record memory rec = patientRecords[_patient][_recordId];
        require(rec.exists, "Record does not exist");

        bool isSelf = (msg.sender == _patient);
        bool isAuthorizedDoctor = accessRequestContract.hasAccess(_patient, msg.sender);
        bool isEmergencyOverride = hasRole(EHR_WRITER_ROLE, msg.sender); // Allow emergency contract to read
        require(isSelf || isAuthorizedDoctor || isEmergencyOverride, "Unauthorized to view record");

        _logAccess(_patient, msg.sender, _recordId, "VIEW_RECORD", "Accessed EHR data");

        return (rec.encryptedCid, rec.metadataHash, rec.timestamp, rec.author);
    }

    /**
     * @dev Internal function to log audit trails
     */
    function _logAccess(address _patient, address _accessor, uint256 _recordId, string memory _action, string memory _reason) internal {
        recordAudits[_patient][_recordId].push(AuditLog({
            accessor: _accessor,
            timestamp: block.timestamp,
            action: _action,
            reason: _reason
        }));
        emit AuditLogged(_patient, _accessor, _recordId, _action);
    }

    /**
     * @dev Get audit trail for a specific record. Only the patient or the admin can view the logs.
     */
    function getAuditTrail(address _patient, uint256 _recordId) external view returns (AuditLog[] memory) {
        require(msg.sender == _patient || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized to view audit trail");
        return recordAudits[_patient][_recordId];
    }
}
