import { useState, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { PAYROLL_MANAGER_ABI, CONTRACT_ADDRESS } from '@/lib/contractABI';
import { initializeFHE, encryptUint32, encryptSalary } from '@/lib/fhe';
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

  // Add Team Member (with encrypted monthly salary)
  const addTeamMember = useCallback(async (
    organizationId: string,
    memberAddress: string,
    memberName: string,
    role: string,
    monthlySalaryUSD: string  // Monthly salary in USD (e.g., "5000.00")
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

      // Convert USD to cents
      const salaryInCents = Math.floor(parseFloat(monthlySalaryUSD) * 100);

      // Encrypt monthly salary
      toast.info('Encrypting salary...');
      const { handle: salaryHandle, signature: salaryProof } = await encryptSalary(
        BigInt(salaryInCents),
        CONTRACT_ADDRESS,
        address
      );

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      toast.info('Adding team member...');
      const tx = await contract.addTeamMember(
        organizationId,
        memberAddress,
        memberName,
        role,
        salaryHandle,
        salaryProof
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

  // Create Payroll Distribution (only needs member address and period)
  const createPayrollDistribution = useCallback(async (
    organizationId: string,
    memberAddress: string,
    period: string  // Format: "202501" (YYYYMM)
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

      // Convert period string to number (e.g., "202501" -> 202501)
      const periodNum = parseInt(period);

      // Encrypt period
      toast.info('Encrypting period...');
      const { handle: periodHandle, signature: periodProof } = await encryptUint32(
        periodNum,
        CONTRACT_ADDRESS,
        address
      );

      // Generate distribution ID
      const distributionId = ethers.keccak256(
        ethers.toUtf8Bytes(`${organizationId}-${memberAddress}-${period}-${Date.now()}`)
      );

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, signer);

      toast.info('Creating payroll distribution...');
      const tx = await contract.createPayrollDistribution(
        distributionId,
        organizationId,
        memberAddress,
        periodHandle,
        periodProof
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

  // Get Organizations where address is a member
  const getMemberOrganizations = useCallback(async () => {
    if (!address) return [];

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, PAYROLL_MANAGER_ABI, provider);

      const orgIds = await contract.getMemberOrganizations(address);
      return orgIds;
    } catch (error: any) {
      console.error('Get member organizations error:', error);
      return [];
    }
  }, [address]);

  return {
    loading,
    createOrganization,
    addTeamMember,
    createPayrollDistribution,
    executeDistribution,
    getOrganization,
    getMyOrganizations,
    getOrganizationMembers,
    getTeamMember,
    getMemberOrganizations
  };
};
