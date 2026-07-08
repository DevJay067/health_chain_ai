// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";

/**
 * @title EmergencyAccess
 * @dev Allows authorized first responders to break-glass and access EHR in emergencies.
 */
contract EmergencyAccess is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESPONDER_ROLE = keccak256("RESPONDER_ROLE");

    HealthChainRoles public rolesContract;

    struct EmergencyEvent {
        address responder;
        uint256 timestamp;
        string locationOrReason;
    }

    // patient => EmergencyEvent[]
    mapping(address => EmergencyEvent[]) public emergencyLogs;

    event EmergencyAccessTriggered(address indexed patient, address indexed responder, string reason);

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
     * @dev Trigger break-glass access
     */
    function triggerEmergencyAccess(address _patient, string memory _reason) external onlyRole(RESPONDER_ROLE) {
        require(rolesContract.isPatient(_patient), "Invalid patient");

        emergencyLogs[_patient].push(EmergencyEvent({
            responder: msg.sender,
            timestamp: block.timestamp,
            locationOrReason: _reason
        }));

        emit EmergencyAccessTriggered(_patient, msg.sender, _reason);
    }
}
