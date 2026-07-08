import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("HealthChain.AI Roles & Records", function () {
  let admin: SignerWithAddress;
  let patient: SignerWithAddress;
  let doctor: SignerWithAddress;
  
  let rolesContract: any;
  let doctorContract: any;
  let accessRequest: any;
  let healthRecord: any;

  before(async function () {
    [admin, patient, doctor] = await ethers.getSigners();

    const HealthChainRoles = await ethers.getContractFactory("HealthChainRoles");
    rolesContract = await upgrades.deployProxy(HealthChainRoles, [admin.address], { kind: 'uups' });

    const DoctorManagement = await ethers.getContractFactory("DoctorManagement");
    doctorContract = await upgrades.deployProxy(DoctorManagement, [admin.address, await rolesContract.getAddress()], { kind: 'uups' });

    const AccessRequest = await ethers.getContractFactory("AccessRequest");
    accessRequest = await upgrades.deployProxy(AccessRequest, [admin.address, await rolesContract.getAddress(), await doctorContract.getAddress()], { kind: 'uups' });

    const HealthRecord = await ethers.getContractFactory("HealthRecord");
    healthRecord = await upgrades.deployProxy(HealthRecord, [admin.address, await rolesContract.getAddress(), await accessRequest.getAddress(), await doctorContract.getAddress()], { kind: 'uups', unsafeAllow: ['constructor'] });
  });

  describe("Role Management", function () {
    it("Should register a patient", async function () {
      const commitment = ethers.id("biometric_seed_patient");
      await rolesContract.connect(patient).registerPatient("did:health:patient123", commitment);
      expect(await rolesContract.isPatient(patient.address)).to.be.true;
    });

    it("Should allow a doctor to request registration and admin to approve", async function () {
      const commitment = ethers.id("biometric_seed_doctor");
      
      // Request
      await doctorContract.connect(doctor).requestRegistration("did:health:doctor456", commitment, "ipfs://credentials_hash");
      let isDoc = await doctorContract.isDoctor(doctor.address);
      expect(isDoc).to.be.false;

      // Admin approves
      // Note: Admin needs ADMIN_ROLE on rolesContract to grant DOCTOR_ROLE, but currently DoctorManagement 
      // calls rolesContract.grantRole. For this to work, DoctorManagement must have ADMIN_ROLE on HealthChainRoles.
      // Let's grant it here for the test.
      const ADMIN_ROLE = await rolesContract.ADMIN_ROLE();
      await rolesContract.connect(admin).grantRole(ADMIN_ROLE, await doctorContract.getAddress());

      await doctorContract.connect(admin).approveDoctor(doctor.address);
      
      isDoc = await doctorContract.isDoctor(doctor.address);
      expect(isDoc).to.be.true;
    });
  });

  describe("Access Requests", function () {
    it("Doctor can request access, patient approves, and doctor can read record", async function () {
      // Patient adds a record
      await healthRecord.connect(patient).addRecord(patient.address, "enc_cid_123", "meta_hash_123");
      
      // Doctor attempts to read - should fail
      await expect(healthRecord.connect(doctor).viewRecord(patient.address, 0)).to.be.revertedWith("Unauthorized to view record");

      // Doctor requests access
      await accessRequest.connect(doctor).requestAccess(patient.address, "Need for consultation");
      
      // Patient approves request ID 1 for 1 hour
      await accessRequest.connect(patient).approveAccess(1, 3600);

      // Doctor reads record (use staticCall to get return values since function modifies state)
      const result = await healthRecord.connect(doctor).viewRecord.staticCall(patient.address, 0);
      expect(result[0]).to.equal("enc_cid_123");
    });
  });
});
