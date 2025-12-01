import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
    interface Window {
        RelayerSDK?: any;
        relayerSDK?: any;
        ethereum?: any;
        okxwallet?: any;
        coinbaseWalletExtension?: any;
        trustwallet?: any;
    }
}

let fheInstance: any = null;

const getSDK = () => {
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
    }
    return sdk;
};

export const initializeFHE = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }

    const ethereumProvider =
        provider ||
        window.ethereum ||
        window.okxwallet?.provider ||
        window.okxwallet ||
        window.coinbaseWalletExtension ||
        window.trustwallet;
    if (!ethereumProvider) {
        throw new Error("No wallet provider detected. Connect a wallet first.");
    }

    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const config = { ...SepoliaConfig, network: ethereumProvider };
    fheInstance = await createInstance(config);
    return fheInstance;
};

const getInstance = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    return initializeFHE(provider);
};

export const getFHEInstance = (): any => {
    return fheInstance;
};

export const resetFheInstance = (): void => {
    fheInstance = null;
};

/**
 * Encrypt a single uint32 value
 * @param value - The value to encrypt
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptUint32 = async (
    value: number,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint32 value:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add32(value);

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt a single uint64 value
 * @param value - The value to encrypt (number or bigint)
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptUint64 = async (
    value: number | bigint,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint64 value:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(typeof value === 'bigint' ? value : BigInt(value));

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt monthly salary (in USD cents as euint64)
 * @param salaryInCents - Monthly salary in USD cents
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptSalary = async (
    salaryInCents: bigint | number,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting salary:', salaryInCents, 'cents');
    return encryptUint64(salaryInCents, contractAddress, userAddress, provider);
};

/**
 * Encrypt a single uint128 value
 * @param value - The value to encrypt
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptUint128 = async (
    value: bigint | number,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{ handle: `0x${string}`; proof: `0x${string}` }> => {
    console.log('[FHE] Encrypting uint128 value:', value);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add128(typeof value === 'bigint' ? value : BigInt(value));

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt payroll distribution data (all fields together with shared proof)
 * @param recipientHash - Hash of recipient address
 * @param memberIndex - Index of member in organization
 * @param amount - Payment amount in USD cents
 * @param currency - Currency code (1=USD)
 * @param period - Payment period (YYYYMM format)
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptPayrollData = async (
    recipientHash: bigint,
    memberIndex: number,
    amount: bigint,
    currency: number,
    period: number,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{
    recipientHashHandle: `0x${string}`;
    memberIndexHandle: `0x${string}`;
    amountHandle: `0x${string}`;
    currencyHandle: `0x${string}`;
    periodHandle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting payroll data...');
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);

    // Add all values in order
    input.add64(recipientHash);       // euint64 - sufficient for hash identifier
    input.add64(BigInt(memberIndex)); // euint64
    input.add64(amount);              // euint64 - sufficient for USD cents
    input.add32(currency);            // euint32
    input.add32(period);              // euint32

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 5) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        recipientHashHandle: bytesToHex(handles[0]) as `0x${string}`,
        memberIndexHandle: bytesToHex(handles[1]) as `0x${string}`,
        amountHandle: bytesToHex(handles[2]) as `0x${string}`,
        currencyHandle: bytesToHex(handles[3]) as `0x${string}`,
        periodHandle: bytesToHex(handles[4]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
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
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.RelayerSDK || window.relayerSDK);
};

export const isFheInitialized = (): boolean => {
    return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (isFHEReady()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
    sdkLoaded: boolean;
    instanceReady: boolean;
} => {
    return {
        sdkLoaded: isFHEReady(),
        instanceReady: fheInstance !== null,
    };
};

/**
 * Request re-encryption for viewing encrypted data
 * @param ciphertextHandles - Array of encrypted handles to decrypt
 * @param userAddress - The user's wallet address
 * @param contractAddress - The contract address
 * @param provider - Optional ethereum provider
 */
export const requestReencryption = async (
    ciphertextHandles: (bigint | string)[],
    userAddress: Address,
    contractAddress: string,
    provider?: any
): Promise<number[]> => {
    console.log('[FHE] Requesting re-encryption for', ciphertextHandles.length, 'values');
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const decryptedValues: number[] = [];

    for (const handle of ciphertextHandles) {
        const ctValue = typeof handle === 'string' ? BigInt(handle) : handle;
        try {
            const decrypted = await instance.reencrypt(
                ctValue,
                contractAddr,
                userAddr
            );
            decryptedValues.push(Number(decrypted));
        } catch (error) {
            console.error('[FHE] Failed to decrypt handle:', handle, error);
            decryptedValues.push(0); // Push 0 for failed decryptions
        }
    }

    return decryptedValues;
};
