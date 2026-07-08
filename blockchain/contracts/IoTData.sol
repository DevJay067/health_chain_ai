// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";

/**
 * @title IoTData
 * @dev Manages incoming IoT health data from verified oracles (e.g., Chainlink) and triggers alerts.
 */
contract IoTData is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    HealthChainRoles public rolesContract;

    struct VitalsBatch {
        bytes32 dataHash; // Hash of the raw vitals (e.g. HR, SpO2) stored off-chain
        uint256 timestamp;
    }

    // patient => VitalsBatch[]
    mapping(address => VitalsBatch[]) public patientVitals;

    event VitalsLogged(address indexed patient, bytes32 dataHash, uint256 timestamp);
    event AnomalyDetected(address indexed patient, string description, uint256 timestamp);

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
     * @dev Log periodic vitals. Restricted to recognized Chainlink Oracles.
     */
    function logVitals(address _patient, bytes32 _dataHash) external onlyRole(ORACLE_ROLE) {
        require(rolesContract.isPatient(_patient), "Invalid patient");

        patientVitals[_patient].push(VitalsBatch({
            dataHash: _dataHash,
            timestamp: block.timestamp
        }));

        emit VitalsLogged(_patient, _dataHash, block.timestamp);
    }

    /**
     * @dev Triggered by Oracle when off-chain analysis detects an anomaly (e.g., severe bradycardia).
     */
    function reportAnomaly(address _patient, string memory _description) external onlyRole(ORACLE_ROLE) {
        require(rolesContract.isPatient(_patient), "Invalid patient");
        
        emit AnomalyDetected(_patient, _description, block.timestamp);
        // Can be hooked into EmergencyAccess.sol to automatically notify responders
    }

    function getVitalsCount(address _patient) external view returns (uint256) {
        return patientVitals[_patient].length;
    }
}
