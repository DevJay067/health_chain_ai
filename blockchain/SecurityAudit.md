# Security Audit Checklist & Known Limitations

This document outlines the security considerations, audit checklists, and known limitations of the HealthChain.AI smart contracts.

## 1. Upgradeability (UUPS) Security
- **Proxy Pattern**: Uses UUPS. Upgrade logic resides in the implementation contract, which reduces proxy overhead.
- **Authorization**: `_authorizeUpgrade` is strictly limited to the `ADMIN_ROLE`.
- **Initialization**: `_disableInitializers()` is called in all constructors to prevent the implementation contract itself from being initialized and maliciously hijacked.

## 2. Access Control & Role Management
- **Centralized Verification**: `RecordAccessControl.sol` serves as the single source of truth for doctor-patient permissions.
- **Role Isolation**: Only `ADMIN_ROLE` can register doctors, preventing malicious users from giving themselves doctor privileges. 
- **Time-bound Access**: Access tokens use `block.timestamp` to enforce expiration. Note that miners have minor control over `block.timestamp` (up to ~15 seconds), which is acceptable for hours/days-long medical permissions.

## 3. Data Privacy (HIPAA / DISHA Compliance)
- **Off-chain Encryption**: NO raw medical data is stored on-chain. Only CIDs of AES-256 encrypted payloads are stored.
- **Anonymization**: The `HealthAnalytics.sol` contract only increments counters and does not leak identity markers.
- **DTBV Security**: Biometric polynomial commitments (Shamir VSS) are stored as irreversible `keccak256` hashes, preventing biometric recreation from chain data alone.

## 4. Reentrancy & Front-running
- `HealthRecord.sol` state-changing functions use `nonReentrant` modifiers.
- Oracle callbacks in `IoTData.sol` only push data to an array and emit events, minimizing complex external calls.

## Known Limitations & Future Work
1. **Chainlink Oracle Decentralization**: The `IoTData` contract currently assumes the `ORACLE_ROLE` is trusted. In production, this must be a decentralized Chainlink DON (Decentralized Oracle Network).
2. **Emergency Access Abuse**: `EmergencyAccess.sol` allows a `RESPONDER_ROLE` to break glass instantly. Future iterations should implement a multisig (e.g., 2 out of 3 responders) or a delayed lock to prevent a single compromised responder key from accessing records.
3. **DTBV Off-chain Dependency**: The on-chain contracts rely heavily on the TEE (Trusted Execution Environment) securely communicating the Shamir shares. The blockchain layer cannot independently verify the physical biometric scan.
