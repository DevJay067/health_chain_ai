// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./HealthChainRoles.sol";

/**
 * @title HealthAnalytics
 * @dev Handles zero-knowledge proofs and anonymized aggregated data for B-MAX AI and researchers.
 */
contract HealthAnalytics is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");

    HealthChainRoles public rolesContract;

    struct AnonymizedData {
        bytes32 dataHash;
        uint256 timestamp;
        string dataCategory;
    }

    // A pool of anonymized data submitted by patients who opted-in
    AnonymizedData[] public analyticsPool;

    // patient => optedIn
    mapping(address => bool) public patientOptIn;

    event DataDonated(bytes32 indexed dataHash, string category);
    event OptInStatusChanged(address indexed patient, bool status);

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
     * @dev Patient toggles their opt-in status for anonymized data donation
     */
    function toggleOptIn(bool _status) external {
        require(rolesContract.isPatient(msg.sender), "Invalid patient");
        patientOptIn[msg.sender] = _status;
        emit OptInStatusChanged(msg.sender, _status);
    }

    /**
     * @dev Submit anonymized data to the pool (zk-proof verified off-chain before calling this, or integrated here)
     */
    function donateData(bytes32 _dataHash, string memory _category) external {
        require(rolesContract.isPatient(msg.sender), "Invalid patient");
        require(patientOptIn[msg.sender], "Patient has not opted in");

        analyticsPool.push(AnonymizedData({
            dataHash: _dataHash,
            timestamp: block.timestamp,
            dataCategory: _category
        }));

        emit DataDonated(_dataHash, _category);
    }

    function getTotalDonatedData() external view returns (uint256) {
        return analyticsPool.length;
    }
}
