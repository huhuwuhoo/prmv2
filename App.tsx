
import React, { useState } from 'react';
import { WagmiProvider, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiAdapter } from './web3Config';
import Navbar from './components/Navbar';
import TokenList from './components/TokenList';
import Launchpad from './components/Launchpad';
import TradeInterface from './components/TradeInterface';
import { AppSection, Token } from './types';
import { BASE_SEPOLIA_CHAIN_ID } from './constants';

const queryClient = new QueryClient();

const NetworkGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const chainId = useChainId();
  const isWrongNetwork = chainId !== BASE_SEPOLIA_CHAIN_ID;

  return (
    <>
      {isWrongNetwork && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-black uppercase tracking-widest sticky top-[72px] z-[60] shadow-xl">
          ⚠️ Wrong Network: Please switch to Base Sepolia in your wallet to avoid Mainnet Gas fees
        </div>
      )}
      {children}
    </>
  );
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.LIST);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const navigateToTrade = (token: Token) => {
    setSelectedToken(token);
    setActiveSection(AppSection.TRADE);
  };

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
          <Navbar 
            activeSection={activeSection} 
            onNavigate={(section) => setActiveSection(section)} 
          />
          
          <NetworkGuard>
            <div className="bg-blue-600/5 border-b border-blue-500/10 py-1 px-4">
              <p className="max-w-7xl mx-auto text-[10px] font-mono text-blue-400/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                CONNECTED TO BASE SEPOLIA TESTNET | FACTORY: {wagmiAdapter.networks[0].id}
              </p>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
              {activeSection === AppSection.LIST && (
                <TokenList onTrade={navigateToTrade} />
              )}
              
              {activeSection === AppSection.LAUNCH && (
                <Launchpad onLaunched={() => setActiveSection(AppSection.LIST)} />
              )}
              
              {activeSection === AppSection.TRADE && selectedToken && (
                <TradeInterface token={selectedToken} />
              )}

              {activeSection === AppSection.TRADE && !selectedToken && (
                <div className="text-center py-20 glass rounded-3xl border border-white/5">
                  <h2 className="text-2xl font-bold mb-4">No token selected</h2>
                  <button 
                    onClick={() => setActiveSection(AppSection.LIST)}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-black transition-all shadow-lg shadow-blue-600/20"
                  >
                    Browse Market
                  </button>
                </div>
              )}
            </main>
          </NetworkGuard>

          <footer className="border-t border-white/10 py-12 text-center">
            <div className="flex justify-center gap-4 mb-4 opacity-40">
              <span className="px-2 py-1 border border-white rounded text-[10px]">BASE SEPOLIA</span>
              <span className="px-2 py-1 border border-white rounded text-[10px]">SMART CONTRACT V1.0</span>
            </div>
            <p className="text-white/20 text-xs">© 2024 BaseLaunch Protocol. Secure Token Factory.</p>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
