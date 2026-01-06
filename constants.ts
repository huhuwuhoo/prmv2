
export const CORE_ADDRESS = '0x80a4A65e0cd7ddcD9E6ad257F0bF7D7CcE66881e';
export const PROJECT_ID = 'db2fa52a63be115cb4a12cb5cbfeac86';
export const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
export const BASESCAN_URL = 'https://sepolia.basescan.org';

export const MIN_TOKEN_INDEX = 1;
export const MAX_LOAD_LIMIT = 12;

// Standard ERC721 minimal ABI for fetching data
export const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)"
];
