
import React, { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CORE_ADDRESS, CORE_ABI, ERC20_ABI } from '../constants';
import { Token } from '../types';
import { formatEther } from 'viem';

interface TokenListProps {
  onTrade: (token: Token) => void;
}

const TokenList: React.FC<TokenListProps> = ({ onTrade }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const publicClient = usePublicClient();

  const fetchTokensFromContract = useCallback(async () => {
    if (!publicClient) return;
    
    try {
      setLoading(true);
      const discoveredTokens: Token[] = [];
      const MAX_SCAN = 100; // 扫描深度扩大到100
      const BATCH_SIZE = 10; // 分批扫描防止请求过载
      
      for (let i = 0; i < MAX_SCAN; i += BATCH_SIZE) {
        setScanProgress(i);
        const batchIndices = Array.from({ length: BATCH_SIZE }, (_, j) => i + j);
        
        const batchAddresses = await Promise.all(
          batchIndices.map(async (index) => {
            try {
              const addr = await publicClient.readContract({
                address: CORE_ADDRESS as `0x${string}`,
                abi: CORE_ABI,
                functionName: 'allSubTokens',
                args: [BigInt(index)]
              }) as string;
              return addr;
            } catch (e) {
              return null;
            }
          })
        );

        const validBatch = batchAddresses.filter(addr => addr && addr !== '0x0000000000000000000000000000000000000000') as `0x${string}`[];
        
        // 如果一整批都是空的，说明可能已经到达末尾，提前退出以节省性能
        if (validBatch.length === 0 && i > 20) break;

        const details = await Promise.all(
          validBatch.map(async (tokenAddr) => {
            try {
              const [name, symbol, supply] = await Promise.all([
                publicClient.readContract({ address: tokenAddr, abi: ERC20_ABI, functionName: 'name' }),
                publicClient.readContract({ address: tokenAddr, abi: ERC20_ABI, functionName: 'symbol' }),
                publicClient.readContract({ address: tokenAddr, abi: ERC20_ABI, functionName: 'totalSupply' }),
              ]);

              return {
                id: tokenAddr,
                address: tokenAddr,
                name: name as string,
                symbol: symbol as string,
                creator: 'Contract',
                totalSupply: formatEther(supply as bigint),
                price: 'N/A',
                marketCap: 'Active',
                description: `Discovered Organization Token`
              };
            } catch (e) {
              return null;
            }
          })
        );

        discoveredTokens.push(...(details.filter(t => t !== null) as Token[]));
      }

      setTokens(discoveredTokens);
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setLoading(false);
      setScanProgress(100);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchTokensFromContract();
  }, [fetchTokensFromContract]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black mb-2">Market Discovery</h1>
          <p className="text-white/40 text-sm">
            {loading ? `Scanning blockchain... ${scanProgress}%` : `Found ${tokens.length} verified tokens`}
          </p>
        </div>
        <button 
          onClick={fetchTokensFromContract}
          className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-blue-600/40 transition-all"
        >
          {loading ? 'Refreshing...' : 'Force Rescan'}
        </button>
      </div>

      {tokens.length === 0 && !loading ? (
        <div className="py-20 text-center glass rounded-3xl border border-dashed border-white/10">
          <p className="text-white/20 italic">No tokens detected in the factory yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <div 
              key={token.address} 
              className="group glass rounded-2xl border border-white/10 p-6 hover:border-blue-500/50 transition-all cursor-pointer bg-gradient-to-b from-white/[0.02] to-transparent"
              onClick={() => onTrade(token)}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                  {token.symbol[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{token.name}</h3>
                  <p className="text-blue-400/60 font-mono text-xs">${token.symbol}</p>
                </div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40 uppercase">Total Supply</span>
                  <span className="text-white/80 font-mono">{parseFloat(token.totalSupply).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40 uppercase">Address</span>
                  <span className="text-blue-400/60 font-mono">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                </div>
              </div>
            </div>
          ))}
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 glass rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenList;
