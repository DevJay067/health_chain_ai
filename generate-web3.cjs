const fs = require('fs');
const roles = require('./blockchain/artifacts/contracts/HealthChainRoles.sol/HealthChainRoles.json').abi;
const access = require('./blockchain/artifacts/contracts/AccessRequest.sol/AccessRequest.json').abi;
const record = require('./blockchain/artifacts/contracts/HealthRecord.sol/HealthRecord.json').abi;

const content = `import { ethers } from 'ethers';

export const CONTRACT_ADDRESSES = {
  HealthChainRoles: '0x0000000000000000000000000000000000000000',
  AccessRequest: '0x0000000000000000000000000000000000000000',
  HealthRecord: '0x0000000000000000000000000000000000000000'
};

export const ABIs = {
  HealthChainRoles: ${JSON.stringify(roles)},
  AccessRequest: ${JSON.stringify(access)},
  HealthRecord: ${JSON.stringify(record)}
};

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum as any);
  }
  return null;
};
`;

fs.writeFileSync('./src/lib/web3.ts', content);
console.log('web3.ts generated!');
