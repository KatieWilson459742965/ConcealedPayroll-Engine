import { getAddress, hexlify } from 'ethers';

let fheInstance: any = null;

export const initializeFHE = async (): Promise<any> => {
  if (fheInstance) {
    return fheInstance;
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  try {
    const { createInstance, initSDK, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
    await initSDK();
    fheInstance = await createInstance(SepoliaConfig);
    console.log('FHE instance initialized successfully');
    return fheInstance;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('FHE initialization failed:', errorMsg);
    throw new Error(`FHE initialization failed: ${errorMsg}`);
  }
};

export const getFHEInstance = (): any => {
  return fheInstance;
};

/**
 * Encrypt a single uint32 value
 */
export const encryptUint32 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add32(value);

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt a single uint64 value
 */
export const encryptUint64 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add64(value);

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt a single uint128 value
 */
export const encryptUint128 = async (
  value: bigint | number,
  contractAddress: string,
  userAddress: string
): Promise<{ handle: string; signature: string }> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);
  ciphertext.add128(typeof value === 'bigint' ? value : BigInt(value));

  const { handles, inputProof } = await ciphertext.encrypt();

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  return { handle, signature: proof };
};

/**
 * Encrypt payroll distribution data (all fields together with shared proof)
 */
export const encryptPayrollData = async (
  recipientHash: bigint,
  memberIndex: number,
  amount: bigint,
  currency: number,
  period: number,
  contractAddress: string,
  userAddress: string
): Promise<{
  recipientHashHandle: string;
  memberIndexHandle: string;
  amountHandle: string;
  currencyHandle: string;
  periodHandle: string;
  signature: string;
}> => {
  let fhe = getFHEInstance();
  if (!fhe) {
    fhe = await initializeFHE();
  }
  if (!fhe) throw new Error('Failed to initialize FHE');

  const contractAddressChecksum = getAddress(contractAddress);
  const ciphertext = await fhe.createEncryptedInput(contractAddressChecksum, userAddress);

  // Add all values in order
  ciphertext.add64(recipientHash);       // euint64 - sufficient for hash identifier
  ciphertext.add64(memberIndex);         // euint64
  ciphertext.add64(amount);              // euint64 - sufficient for USD cents (max ~$184 quadrillion)
  ciphertext.add32(currency);            // euint32
  ciphertext.add32(period);              // euint32

  const { handles, inputProof } = await ciphertext.encrypt();

  const recipientHashHandle = hexlify(handles[0]);
  const memberIndexHandle = hexlify(handles[1]);
  const amountHandle = hexlify(handles[2]);
  const currencyHandle = hexlify(handles[3]);
  const periodHandle = hexlify(handles[4]);
  const signature = hexlify(inputProof);

  return {
    recipientHashHandle,
    memberIndexHandle,
    amountHandle,
    currencyHandle,
    periodHandle,
    signature
  };
};

/**
 * Generate a deterministic hash from an address
 * This creates a privacy-preserving identifier
 * Returns a value that fits in euint64 (max: 18,446,744,073,709,551,615)
 */
export const hashAddress = (address: string): bigint => {
  const encoder = new TextEncoder();
  const data = encoder.encode(address.toLowerCase());

  // Simple hash function that fits in euint64
  let hash = 0n;
  const MAX_UINT64 = 0xFFFFFFFFFFFFFFFFn; // 2^64 - 1

  for (let i = 0; i < data.length; i++) {
    hash = ((hash * 31n) + BigInt(data[i])) % MAX_UINT64;
  }

  return hash;
};

/**
 * Request reencryption for viewing encrypted data
 */
export const requestReencryption = async (
  handle: string,
  publicKey: string,
  contractAddress: string
): Promise<bigint> => {
  const fhe = getFHEInstance();
  if (!fhe) throw new Error('FHE not initialized');

  try {
    const reencrypted = await fhe.reencrypt(
      handle,
      publicKey,
      contractAddress
    );
    return BigInt(reencrypted);
  } catch (error) {
    console.error('Reencryption failed:', error);
    throw error;
  }
};
