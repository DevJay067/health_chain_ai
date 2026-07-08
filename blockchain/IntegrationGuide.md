# HealthChain.AI Integration Guide

This guide explains how the React frontend interacts with the HealthChain.AI smart contracts, focusing on standard flows like connection, uploading records, and biometric verification.

## 1. Setup ethers.js

Install ethers.js in the React project:
```bash
npm install ethers
```

Import and initialize the provider:
```typescript
import { ethers } from "ethers";

export const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error("MetaMask is not installed");
};
```

## 2. Connecting a User (Patient/Doctor)
When a user connects, their DTBV biometric commitment (generated off-chain via TEE) must be registered on-chain.

```typescript
import HealthChainUserABI from "./abis/HealthChainUser.json";

const registerPatient = async (did, biometricCommitment) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    
    const userContract = new ethers.Contract(
        CONTRACT_ADDRESSES.HealthChainUser,
        HealthChainUserABI,
        signer
    );
    
    // Send transaction
    const tx = await userContract.registerPatient(did, biometricCommitment);
    await tx.wait();
    console.log("Patient Registered!");
};
```

## 3. Uploading an Encrypted Record to IPFS
The system requires data to be encrypted off-chain *before* uploading to IPFS.

**Flow**:
1. AES-256 encrypt the medical JSON data using the Patient's public key (or a shared symmetric key).
2. Upload the encrypted blob to IPFS/Filecoin via Pinata/Web3.Storage.
3. Obtain the CID.
4. Hash the raw metadata (for integrity).
5. Submit to `HealthRecord.sol`.

```typescript
import HealthRecordABI from "./abis/HealthRecord.json";

const addMedicalRecord = async (patientAddress, ipfsCid, metadataHash) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    
    const healthRecord = new ethers.Contract(
        CONTRACT_ADDRESSES.HealthRecord,
        HealthRecordABI,
        signer
    );
    
    const tx = await healthRecord.addRecord(patientAddress, ipfsCid, metadataHash);
    await tx.wait();
    console.log("Record added successfully!");
};
```

## 4. Granting Access to a Doctor
Patients own their data. They grant time-bound access.

```typescript
import RecordAccessControlABI from "./abis/RecordAccessControl.json";

const grantDoctorAccess = async (doctorAddress, durationInSeconds) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    
    const accessControl = new ethers.Contract(
        CONTRACT_ADDRESSES.RecordAccessControl,
        RecordAccessControlABI,
        signer
    );
    
    const tx = await accessControl.grantAccess(doctorAddress, durationInSeconds);
    await tx.wait();
};
```

## 5. Emergency Break-Glass
This allows an authorized responder to bypass normal access controls in critical situations. The frontend should have a dedicated "Red Button" component.

```typescript
import EmergencyAccessABI from "./abis/EmergencyAccess.json";

const triggerEmergency = async (patientAddress) => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    
    const emergencyContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EmergencyAccess,
        EmergencyAccessABI,
        signer
    );
    
    const tx = await emergencyContract.triggerEmergencyAccess(patientAddress);
    await tx.wait();
    console.log("Emergency Access Triggered. Audit log generated.");
};
```
