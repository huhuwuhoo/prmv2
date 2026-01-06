
import React, { useState } from 'react';
import { useWriteContract, useAccount, useReadContract } from 'wagmi';
import { CORE_ADDRESS, CORE_ABI, ERC20_ABI, BASE_SEPOLIA_CHAIN_ID } from '../constants';
import { Token } from '../types';
import { parseEther, formatEther } from 'viem';

interface TradeInterfaceProps {
  token: Token;
}

const TradeInterface: React.FC<TradeInterfaceProps> = ({ token }) => {
  const { address, isConnected } = useAccount();
  const [liqAmount, setLiqAmount] = useState('0.01');
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const { data: userBalance } = useReadContract({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const handleAddLiquidity = async () => {
    if (!isConnected) return;
    setIsProcessing(true);
    try {
      await writeContractAsync({
        chainId: BASE_SEPOLIA_CHAIN_ID, // 显式指定测试网
        address: CORE_ADDRESS as `0x${string}`,
        abi: CORE_ABI,
        functionName: 'addInitialLiquidityAndBurnLP',
        value: parseEther(liqAmount)
      });
      alert("Liquidity added and LP burned!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyback = async () => {
    if (!isConnected) return;
    setIsProcessing(true);
    try {
      await writeContractAsync({
        chainId: BASE_SEPOLIA_CHAIN_ID, // 显式指定测试网
        address: CORE_ADDRESS as `0x${string}`,
        abi: CORE_ABI,
        functionName: 'manualBuyback',
        args: [BigInt(0)]
      });
      alert("Buyback executed successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Buyback failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
            {token.symbol[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black">{token.name}</h1>
            <p className="text-blue-400 font-mono text-sm tracking-tighter">{token.address}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Your Holdings</p>
          <p className="text-2xl font-mono text-green-400">
            {userBalance ? parseFloat(formatEther(userBalance as bigint)).toLocaleString() : '0'} ${token.symbol}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8 border border-blue-500/20 bg-blue-900/5 space-y-6">
          <h3 className="text-lg font-bold text-blue-400">Add Initial Liquidity</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            This will pair your organization token with ETH on Uniswap and permanently burn the LP tokens.
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase">Amount (ETH)</label>
            <input 
              type="number"
              value={liqAmount}
              onChange={(e) => setLiqAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleAddLiquidity}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Add Liquidity & Burn LP'}
          </button>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Manual Buyback</h3>
            <p className="text-xs text-white/40 leading-relaxed mt-2">
              Use the factory's accumulated reserves to purchase organization tokens and support the floor price.
            </p>
          </div>
          <button 
            onClick={handleBuyback}
            disabled={isProcessing}
            className="w-full border border-white/10 hover:bg-white/5 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Execute Buyback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeInterface;
