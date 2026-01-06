
import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CORE_ADDRESS, ERC721_ABI } from '../constants';
import { TokenMetadata } from '../types';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const abi = parseAbi(ERC721_ABI);

export const fetchTokenData = async (tokenId: number): Promise<TokenMetadata | null> => {
  try {
    // Attempt to fetch token URI
    const uri = await client.readContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    }) as string;

    const owner = await client.readContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    }) as string;

    // Resolve IPFS if necessary
    const url = uri.startsWith('ipfs://') 
      ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') 
      : uri;

    const response = await fetch(url);
    const metadata = await response.json();

    return {
      id: tokenId.toString(),
      name: metadata.name || `Token #${tokenId}`,
      description: metadata.description || 'No description available.',
      image: metadata.image?.startsWith('ipfs://') 
        ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
        : (metadata.image || `https://picsum.photos/seed/${tokenId}/400/400`),
      attributes: metadata.attributes,
      owner,
    };
  } catch (error) {
    console.error(`Error fetching token ${tokenId}:`, error);
    return null;
  }
};

export const getProjectInfo = async () => {
  try {
    const name = await client.readContract({
      address: CORE_ADDRESS as `0x${string}`,
      abi,
      functionName: 'name',
    });
    return { name };
  } catch (e) {
    return { name: 'Base Sepolia Collection' };
  }
};
