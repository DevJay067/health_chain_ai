import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy HealthChainRoles
  console.log("Deploying HealthChainRoles...");
  const HealthChainRoles = await ethers.getContractFactory("HealthChainRoles");
  const rolesContract = await upgrades.deployProxy(HealthChainRoles, [deployer.address], { kind: 'uups' });
  await rolesContract.waitForDeployment();
  const rolesAddress = await rolesContract.getAddress();
  console.log("HealthChainRoles deployed to:", rolesAddress);

  // 2. Deploy DoctorManagement
  console.log("Deploying DoctorManagement...");
  const DoctorManagement = await ethers.getContractFactory("DoctorManagement");
  const doctorContract = await upgrades.deployProxy(DoctorManagement, [deployer.address, rolesAddress], { kind: 'uups' });
  await doctorContract.waitForDeployment();
  const doctorAddress = await doctorContract.getAddress();
  console.log("DoctorManagement deployed to:", doctorAddress);

  // 3. Deploy AccessRequest
  console.log("Deploying AccessRequest...");
  const AccessRequest = await ethers.getContractFactory("AccessRequest");
  const accessRequest = await upgrades.deployProxy(AccessRequest, [deployer.address, rolesAddress, doctorAddress], { kind: 'uups' });
  await accessRequest.waitForDeployment();
  const accessAddress = await accessRequest.getAddress();
  console.log("AccessRequest deployed to:", accessAddress);

  // 4. Deploy HealthRecord
  console.log("Deploying HealthRecord...");
  const HealthRecord = await ethers.getContractFactory("HealthRecord");
  const healthRecord = await upgrades.deployProxy(HealthRecord, [deployer.address, rolesAddress, accessAddress, doctorAddress], { kind: 'uups', unsafeAllow: ['constructor'] });
  await healthRecord.waitForDeployment();
  console.log("HealthRecord deployed to:", await healthRecord.getAddress());

  // 5. Deploy IoTData
  console.log("Deploying IoTData...");
  const IoTData = await ethers.getContractFactory("IoTData");
  const iotData = await upgrades.deployProxy(IoTData, [deployer.address, rolesAddress], { kind: 'uups' });
  await iotData.waitForDeployment();
  console.log("IoTData deployed to:", await iotData.getAddress());

  // 6. Deploy EmergencyAccess
  console.log("Deploying EmergencyAccess...");
  const EmergencyAccess = await ethers.getContractFactory("EmergencyAccess");
  const emergencyAccess = await upgrades.deployProxy(EmergencyAccess, [deployer.address, rolesAddress], { kind: 'uups' });
  await emergencyAccess.waitForDeployment();
  console.log("EmergencyAccess deployed to:", await emergencyAccess.getAddress());

  // 7. Deploy HealthAnalytics
  console.log("Deploying HealthAnalytics...");
  const HealthAnalytics = await ethers.getContractFactory("HealthAnalytics");
  const healthAnalytics = await upgrades.deployProxy(HealthAnalytics, [deployer.address, rolesAddress], { kind: 'uups' });
  await healthAnalytics.waitForDeployment();
  console.log("HealthAnalytics deployed to:", await healthAnalytics.getAddress());

  console.log("All contracts deployed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
