# Gas Optimization Report

Gas optimization is highly prioritized due to the frequency of IoT updates and record access logs. The following optimizations have been applied to the smart contract architecture.

## 1. UUPS Over Transparent Proxies
- **Impact**: UUPS saves deployment and runtime gas compared to Transparent Upgradeable Proxies because the upgrade logic is in the implementation contract rather than a proxy that checks admin status on every call.

## 2. Struct Packing
- **`Record` Struct**:
  ```solidity
  struct Record {
      uint256 id;               // 32 bytes
      string encryptedCid;      // dynamic
      string metadataHash;      // dynamic
      uint256 timestamp;        // 32 bytes
      address author;           // 20 bytes
      bool exists;              // 1 byte
  }
  ```
  *Optimization*: `author` and `exists` are packed together, saving a storage slot (20,000 gas per creation).

## 3. Off-chain Logging via Events
- **Audit Trails**: Extensive historical access logs are not stored in contract state variables if they are not needed by other smart contracts.
- In `IoTData.sol`, historical vitals are kept minimally, but the primary long-term storage is handled by Graph Indexers listening to the `VitalsLogged` event. Emitting an event costs ~2,000 gas, whereas writing to a new state array slot costs 20,000 gas.

## 4. Base L2 Network
- Deploying to Base immediately reduces gas fees by ~90-95% compared to Ethereum Mainnet, making high-frequency EHR additions and IoT vitals tracking economically viable.

## 5. View Functions
- Read-heavy operations (checking access, viewing audit trails) are marked `view` and cost zero gas when queried by the frontend.

## Next Steps for Extreme Optimization
- **EIP-4844 (Proto-Danksharding)**: Base utilizes EIP-4844 blobs. If we need to store raw ML training metadata on-chain, we can utilize blob-carrying transactions instead of standard `calldata` for a fraction of the cost.
