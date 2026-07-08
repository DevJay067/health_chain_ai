import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ABIs } from '../lib/web3';

// Hardhat default account #0 private key (pre-funded with 10,000 ETH)
const FUNDER_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export function useWeb3(userEmail?: string) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);

  useEffect(() => {
    if (!userEmail) return;

    const setupBurnerWallet = async () => {
      setIsConnecting(true);
      try {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        
        // Generate a deterministic private key from the user's email so they always get the same wallet
        const privateKey = ethers.id(userEmail + "_healthchain_salt");
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        
        // If balance is very low (e.g., < 0.1 ETH), fund it from the Hardhat funder account
        if (balance < ethers.parseEther("0.1")) {
           console.log(`Funding burner wallet for ${userEmail}...`);
           const funder = new ethers.Wallet(FUNDER_PK, provider);
           const tx = await funder.sendTransaction({
             to: wallet.address,
             value: ethers.parseEther("10.0")
           });
           await tx.wait();
           console.log("Wallet funded!");
        }

        setSigner(wallet);
        setAccount(wallet.address);
        console.log(`Auto-connected burner wallet for ${userEmail}: ${wallet.address}`);
      } catch (err: any) {
        console.error("Burner wallet setup failed", err);
        setError(err.message || "Failed to setup wallet");
      } finally {
        setIsConnecting(false);
      }
    };

    setupBurnerWallet();
  }, [userEmail]);

  // Keep this for backwards compatibility with the UI button, though it's now automatic
  const connectWallet = useCallback(async () => {
    // Already connected automatically!
    if (account) return;
  }, [account]);

  const getContract = useCallback(async (contractName: keyof typeof CONTRACT_ADDRESSES) => {
    if (!signer) throw new Error("Wallet not initialized yet");
    return new ethers.Contract(CONTRACT_ADDRESSES[contractName], ABIs[contractName], signer);
  }, [signer]);

  return { account, isConnecting, error, connectWallet, getContract };
}
