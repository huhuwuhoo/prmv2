
import React, { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { CORE_ADDRESS, CORE_ABI, BASE_SEPOLIA_CHAIN_ID } from '../constants';
import { generateTokenIdeas } from '../services/geminiService';

interface LaunchpadProps {
  onLaunched: () => void;
}

const Launchpad: React.FC<LaunchpadProps> = ({ onLaunched }) => {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
  });
  
  const [aiTheme, setAiTheme] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleAiAssist = async () => {
    if (!aiTheme) return;
    setIsGenerating(true);
    try {
      const ideas = await generateTokenIdeas(aiTheme);
      setAiSuggestions(ideas);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSuggestion = (sug: any) => {
    setFormData({ name: sug.name, symbol: sug.symbol });
    setAiSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsDeploying(true);
      await writeContractAsync({
        chainId: BASE_SEPOLIA_CHAIN_ID, // 关键点：强制指定测试网链ID
        address: CORE_ADDRESS as `0x${string}`,
        abi: CORE_ABI,
        functionName: 'launchToken',
        args: [formData.name, formData.symbol],
      });
      alert("Organization launched successfully!");
      onLaunched();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Launch failed. Check your wallet balance and network.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-4">Create Organization</h1>
        <p className="text-white/40">Deploy a new token ecosystem on Base Sepolia</p>
      </div>

      <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-black bg-blue-600 px-2 py-1 rounded text-white uppercase tracking-tighter">Factory V1</span>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20">
            <label className="text-xs font-bold text-blue-400 uppercase mb-2 block tracking-widest">AI Branding Helper</label>
            <div className="flex gap-2">
              <input 
                value={aiTheme}
                onChange={(e) => setAiTheme(e.target.value)}
                placeholder="Idea: AI Agent Finance..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleAiAssist}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isGenerating ? '...' : 'Help'}
              </button>
            </div>
            {aiSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                {aiSuggestions.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => selectSuggestion(s)}
                    className="p-2 bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/50 cursor-pointer flex justify-between items-center transition-all"
                  >
                    <span className="text-xs font-bold">{s.name}</span>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">${s.symbol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Base Protocol One"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Ticker Symbol</label>
              <input 
                required
                value={formData.symbol}
                onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                placeholder="BPO"
              />
            </div>
            <button 
              disabled={isDeploying}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isDeploying ? 'Deploying...' : 'Launch on Base'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Launchpad;
