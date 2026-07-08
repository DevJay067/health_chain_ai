// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";
import "./DoctorManagement.sol";

/**
 * @title AccessRequest
 * @dev Manages doctors requesting access to a patient's records and patients approving them.
 */
contract AccessRequest is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    HealthChainRoles public rolesContract;
    DoctorManagement public doctorContract;

    enum RequestState { None, Pending, Approved, Denied, Revoked, Expired }

    struct AccessPermission {
        address doctor;
        address patient;
        string reason;
        uint256 requestedAt;
        uint256 expiresAt;
        RequestState state;
    }

    uint256 public nextRequestId;
    mapping(uint256 => AccessPermission) public accessRequests;
    
    // patient => doctor => valid access request ID
    mapping(address => mapping(address => uint256)) public activeAccess;

    event AccessRequested(uint256 indexed requestId, address indexed doctor, address indexed patient, string reason);
    event AccessApproved(uint256 indexed requestId, address indexed patient, address indexed doctor, uint256 expiresAt);
    event AccessDenied(uint256 indexed requestId, address indexed patient, address indexed doctor);
    event AccessRevoked(uint256 indexed requestId, address indexed patient, address indexed doctor);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin, address _rolesContract, address _doctorContract) initializer public {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);
        
        rolesContract = HealthChainRoles(_rolesContract);
        doctorContract = DoctorManagement(_doctorContract);
        nextRequestId = 1;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(ADMIN_ROLE)
        override
    {}

    /**
     * @dev Doctor requests access to a patient's records
     */
    function requestAccess(address _patient, string memory _reason) external {
        require(doctorContract.isDoctor(msg.sender), "Caller is not an active verified doctor");
        require(rolesContract.isPatient(_patient), "Target is not a registered patient");
        
        uint256 reqId = nextRequestId++;
        accessRequests[reqId] = AccessPermission({
            doctor: msg.sender,
            patient: _patient,
            reason: _reason,
            requestedAt: block.timestamp,
            expiresAt: 0,
            state: RequestState.Pending
        });

        emit AccessRequested(reqId, msg.sender, _patient, _reason);
    }

    /**
     * @dev Patient approves a doctor's access request
     */
    function approveAccess(uint256 _requestId, uint256 _durationInSeconds) external {
        AccessPermission storage req = accessRequests[_requestId];
        require(req.patient == msg.sender, "Not your request");
        require(req.state == RequestState.Pending, "Request not pending");

        req.state = RequestState.Approved;
        req.expiresAt = block.timestamp + _durationInSeconds;
        activeAccess[msg.sender][req.doctor] = _requestId;

        emit AccessApproved(_requestId, msg.sender, req.doctor, req.expiresAt);
    }

    /**
     * @dev Patient denies a doctor's access request
     */
    function denyAccess(uint256 _requestId) external {
        AccessPermission storage req = accessRequests[_requestId];
        require(req.patient == msg.sender, "Not your request");
        require(req.state == RequestState.Pending, "Request not pending");

        req.state = RequestState.Denied;

        emit AccessDenied(_requestId, msg.sender, req.doctor);
    }

    /**
     * @dev Patient revokes an already approved access
     */
    function revokeAccess(address _doctor) external {
        uint256 reqId = activeAccess[msg.sender][_doctor];
        require(reqId != 0, "No active access");

        AccessPermission storage req = accessRequests[reqId];
        req.state = RequestState.Revoked;
        req.expiresAt = block.timestamp;
        activeAccess[msg.sender][_doctor] = 0;

        emit AccessRevoked(reqId, msg.sender, _doctor);
    }

    /**
     * @dev Check if a doctor has valid access to a patient's records
     */
    function hasAccess(address _patient, address _doctor) public view returns (bool) {
        uint256 reqId = activeAccess[_patient][_doctor];
        if (reqId == 0) return false;
        
        AccessPermission memory req = accessRequests[reqId];
        return (req.state == RequestState.Approved && block.timestamp <= req.expiresAt);
    }
}
