import { BlockchainBlock, BlockchainTransaction } from '../types';

/**
 * SHA-256 calculation using native Web Cryptography API
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute Merkle Root from transaction hashes
 */
export async function calculateMerkleRoot(transactions: BlockchainTransaction[]): Promise<string> {
  if (transactions.length === 0) {
    return await sha256('EMPTY_MERKLE_TREE_ROOT');
  }

  let currentLevel = transactions.map((t) => t.txHash || 'TX_NULL');

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(await sha256(combined));
      } else {
        // duplicate odd element
        const combined = currentLevel[i] + currentLevel[i];
        nextLevel.push(await sha256(combined));
      }
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * Compute the canonical Block Hash
 */
export async function computeBlockHash(
  blockHeight: number,
  previousHash: string,
  timestamp: string,
  merkleRoot: string,
  nonce: number,
  validatorNode: string
): Promise<string> {
  const blockHeader = `${blockHeight}|${previousHash}|${timestamp}|${merkleRoot}|${nonce}|${validatorNode}`;
  return await sha256(blockHeader);
}

/**
 * Generate a Transaction Hash
 */
export async function generateTxHash(
  txId: string,
  timestamp: string,
  type: string,
  recipient: string,
  amount: number | undefined,
  payload: Record<string, unknown>
): Promise<string> {
  const content = `${txId}:${timestamp}:${type}:${recipient}:${amount || 0}:${JSON.stringify(payload)}`;
  return '0x' + (await sha256(content));
}

export interface VerificationResult {
  isValid: boolean;
  blockVerifications: Array<{
    blockHeight: number;
    isValid: boolean;
    reason?: string;
    computedHash: string;
    storedHash: string;
    merkleStatus: 'MATCH' | 'MISMATCH';
  }>;
  totalBlocks: number;
  tamperedBlocksCount: number;
  message: string;
}

/**
 * Automated Blockchain Audit Engine:
 * Validates cryptographic chain links, re-hashes blocks, and checks Merkle Roots
 */
export async function runAutomatedAudit(blocks: BlockchainBlock[]): Promise<VerificationResult> {
  const blockVerifications = [];
  let allValid = true;
  let tamperedBlocksCount = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    let isBlockValid = true;
    let failureReason = '';

    // Check previous hash continuity
    if (i > 0) {
      const prevBlock = blocks[i - 1];
      if (block.previousHash !== prevBlock.blockHash) {
        isBlockValid = false;
        failureReason = `Previous hash putus pada blok #${block.blockHeight}. Tercatat: ${block.previousHash.slice(0, 10)}..., Aktual blok #${prevBlock.blockHeight}: ${prevBlock.blockHash.slice(0, 10)}...`;
      }
    }

    // Recompute Merkle Root
    const computedMerkle = await calculateMerkleRoot(block.transactions);
    const merkleMatch = computedMerkle === block.merkleRoot;
    if (!merkleMatch) {
      isBlockValid = false;
      failureReason = failureReason
        ? `${failureReason} | Merkle root korup / transaksi dimanipulasi.`
        : 'Merkle root tidak cocok dengan mutasi transaksi.';
    }

    // Recompute Block Hash
    const computedHash = await computeBlockHash(
      block.blockHeight,
      block.previousHash,
      block.timestamp,
      block.merkleRoot,
      block.nonce,
      block.validatorNode
    );

    if (computedHash !== block.blockHash) {
      isBlockValid = false;
      failureReason = failureReason
        ? `${failureReason} | Hash blok tidak valid.`
        : 'Block hash tidak cocok dengan header data asli.';
    }

    if (!isBlockValid) {
      allValid = false;
      tamperedBlocksCount++;
    }

    blockVerifications.push({
      blockHeight: block.blockHeight,
      isValid: isBlockValid,
      reason: failureReason || 'Integritas kriptografis terverifikasi sempurna.',
      computedHash,
      storedHash: block.blockHash,
      merkleStatus: merkleMatch ? ('MATCH' as const) : ('MISMATCH' as const),
    });
  }

  return {
    isValid: allValid,
    blockVerifications,
    totalBlocks: blocks.length,
    tamperedBlocksCount,
    message: allValid
      ? 'Audit Otomatis Sukses: Seluruh blok aman, tidak ada manipulasi data.'
      : `Peringatan Integritas: Ditemukan ${tamperedBlocksCount} blok mengalami inkonsistensi hash/data.`,
  };
}
