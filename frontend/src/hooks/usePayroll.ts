import { useState, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { PAYROLL_MANAGER_ABI, CONTRACT_ADDRESS } from '@/lib/contractABI';
import { initializeFHE, encryptPayrollData, hashAddress } from '@/lib/fhe';
import { ethers } from 'ethers';

export const usePayroll = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  // Create Organization
  const createOrganization = useCallback(async (
    organizationName: string
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      // Generate unique organization ID
      const organizationId = ethers.keccak256(
        ethers.toUtf8Bytes(`${organizationName}-${Date.now()}-${address}`)
      );

      toast.info('Creating organization...');
      const tx = await contract.createOrganization(organizationId, organizationName);

      toast.info('Waiting for confirmation...');
      await tx.wait();

      toast.success('Organization created successfully!');
      return organizationId;
    } catch (error: any) {
      console.error('Create organization error:', error);
      toast.error(error.message || 'Failed to create organization');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Add Team Member
  const addTeamMember = useCallback(async (
    organizationId: string,
    memberAddress: string,
    memberName: string,
    role: string
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      toast.info('Adding team member...');
      const tx = await contract.addTeamMember(
        organizationId,
        memberAddress,
        memberName,
        role
      );

      toast.info('Waiting for confirmation...');
      await tx.wait();

      toast.success(`${memberName} added successfully!`);
    } catch (error: any) {
      console.error('Add member error:', error);
      toast.error(error.message || 'Failed to add team member');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Create Payroll Distribution (with FHE encryption)
  const createPayrollDistribution = useCallback(async (
    organizationId: string,
    recipientAddress: string,
    memberIndex: number,
    amount: string, // in ETH/tokens
    currency: number, // 1=USD, 2=EUR, etc.
    period: number // YYYYMM format
  ) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      // Initialize FHE
      toast.info('Initializing encryption...');
      await initializeFHE();

      // Hash recipient address for privacy
      const recipientHash = hashAddress(recipientAddress);

      // Amount is already in cents (e.g., 500000 cents = $5000.00)
      // This avoids overflow issues with parseEther
      const amountValue = BigInt(amount);

      // Encrypt all payroll data together
      toast.info('Encrypting payroll data...');
      const encrypted = await encryptPayrollData(
        recipientHash,
        memberIndex,
        amountValue,
        currency,
        period,
        CONTRACT_ADDRESS,
        address
      );

      // Generate distribution ID
      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`${organizationId}-${Date.now()}-${address}`)
      );

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      toast.info('Creating encrypted payroll distribution...');
      const tx = await contract.createPayrollDistribution(
        distributionId,
        organizationId,
        encrypted.recipientHashHandle,
        encrypted.memberIndexHandle,
        encrypted.amountHandle,
        encrypted.currencyHandle,
        encrypted.periodHandle,
        encrypted.signature  // Shared proof for all encrypted values (FHE best practice)
      );

      toast.info('Waiting for confirmation...');
      await tx.wait();

      toast.success('Payroll distribution created successfully!');
      return distributionId;
    } catch (error: any) {
      console.error('Create distribution error:', error);
      toast.error(error.message || 'Failed to create payroll distribution');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Execute Payroll Distribution
  const executeDistribution = useCallback(async (distributionId: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      toast.info('Executing payroll distribution...');
      const tx = await contract.executePayrollDistribution(distributionId);

      toast.info('Waiting for confirmation...');
      await tx.wait();

      toast.success('Payroll distribution executed!');
    } catch (error: any) {
      console.error('Execute distribution error:', error);
      toast.error(error.message || 'Failed to execute distribution');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Get Organization Details
  const getOrganization = useCallback(async (organizationId: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, provider);

      const org = await contract.getOrganization(organizationId);
      return {
        organizationName: org[0],
        owner: org[1],
        createdAt: org[2],
        memberCount: org[3],
        isActive: org[4]
      };
    } catch (error: any) {
      console.error('Get organization error:', error);
      throw error;
    }
  }, []);

  // Get Organizations owned by user
  const getMyOrganizations = useCallback(async () => {
    if (!address) return [];

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, provider);

      const orgIds = await contract.getOwnerOrganizations(address);
      return orgIds;
    } catch (error: any) {
      console.error('Get organizations error:', error);
      return [];
    }
  }, [address]);

  // Get Organization Members
  const getOrganizationMembers = useCallback(async (organizationId: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, provider);

      const memberAddresses = await contract.getOrganizationMembers(organizationId);
      return memberAddresses;
    } catch (error: any) {
      console.error('Get members error:', error);
      return [];
    }
  }, []);

  // Get Team Member Details
  const getTeamMember = useCallback(async (organizationId: string, memberAddress: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, provider);

      const member = await contract.getTeamMember(organizationId, memberAddress);
      return {
        memberName: member[0],
        role: member[1],
        joinedAt: member[2],
        isActive: member[3]
      };
    } catch (error: any) {
      console.error('Get team member error:', error);
      throw error;
    }
  }, []);

  return {
    loading,
    createOrganization,
    addTeamMember,
    createPayrollDistribution,
    executeDistribution,
    getOrganization,
    getMyOrganizations,
    getOrganizationMembers,
    getTeamMember
  };
};
