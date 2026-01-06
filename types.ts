
export interface TokenMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: any }>;
  mintDate?: string;
  owner?: string;
}

export interface ProjectStats {
  totalMinted: number;
  contractAddress: string;
  projectId: string;
  network: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
