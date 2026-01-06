
import React, { useState, useEffect, useCallback } from 'react';
import { CORE_ADDRESS, PROJECT_ID, BASESCAN_URL } from './constants';
import { TokenMetadata, ChatMessage } from './types';
import { fetchTokenData, getProjectInfo } from './services/blockchain';
import { analyzeTokenMetadata, askAboutProject } from './services/gemini';

const TokenCard: React.FC<{ token: TokenMetadata; onAnalyze: (t: TokenMetadata) => void }> = ({ token, onAnalyze }) => (
  <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 group">
    <div className="relative aspect-square overflow-hidden bg-zinc-900">
      <img 
        src={token.image} 
        alt={token.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
        #{token.id}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-semibold text-white mb-2 truncate">{token.name}</h3>
      <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">{token.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <a 
          href={`${BASESCAN_URL}/token/${CORE_ADDRESS}?a=${token.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
        >
          View on BaseScan ↗
        </a>
        <button 
          onClick={() => onAnalyze(token)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors border border-white/10"
        >
          AI Analyze
        </button>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('Loading...');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const info = await getProjectInfo();
      setProjectName(info.name);

      // Simulate fetching first batch of tokens
      const fetched: TokenMetadata[] = [];
      // On some contracts, Project ID influences token ID range. 
      // For general purpose, we'll try fetching the first few standard IDs.
      for (let i = 1; i <= 8; i++) {
        const data = await fetchTokenData(i);
        if (data) fetched.push(data);
      }
      setTokens(fetched);
      setLoading(false);
    };
    init();
  }, []);

  const handleAnalyze = async (token: TokenMetadata) => {
    setAnalysis("Analysing with Gemini...");
    try {
      const result = await analyzeTokenMetadata(token);
      setAnalysis(result || "Analysis failed.");
    } catch (e) {
      setAnalysis("Error connecting to AI service.");
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const context = `Tokens found: ${tokens.length}. Contract: ${CORE_ADDRESS}. Project: ${projectName}. ProjectID: ${PROJECT_ID}`;
      const response = await askAboutProject(chatInput, context);
      setChatMessages(prev => [...prev, { role: 'model', text: response || "I'm not sure about that." }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Service busy. Try again." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">B</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Base Token Explorer</h1>
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">Base Sepolia Testnet</p>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm text-zinc-400">
            <span className="glass px-3 py-1 rounded-full border border-zinc-800">Project: {PROJECT_ID.slice(0, 8)}...</span>
            <span className="glass px-3 py-1 rounded-full border border-zinc-800">Address: {CORE_ADDRESS.slice(0, 6)}...{CORE_ADDRESS.slice(-4)}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              {projectName}
            </h2>
            <p className="text-zinc-400 max-w-2xl text-lg">
              Explore the unique digital assets minted under Project ID <code className="text-blue-400 bg-blue-400/10 px-1 rounded">{PROJECT_ID}</code> 
              on the Base Sepolia network. Powered by real-time blockchain synchronization.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="glass p-4 rounded-2xl text-center min-w-[120px]">
              <div className="text-3xl font-bold text-blue-500">{tokens.length}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-tighter">Minted Items</div>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                Recent Mints
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </h3>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Refresh Data
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass h-[400px] rounded-2xl animate-pulse bg-zinc-900/50"></div>
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <div className="glass p-20 text-center rounded-3xl border-dashed border-zinc-800">
                <p className="text-zinc-500">No tokens found in this range yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {tokens.map(token => (
                  <TokenCard key={token.id} token={token} onAnalyze={handleAnalyze} />
                ))}
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          <div className="space-y-8">
            {/* Analysis Box */}
            <div className="glass rounded-3xl p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Insights
              </h3>
              <div className="bg-black/40 rounded-xl p-4 min-h-[150px] text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {analysis || "Select a token and click 'AI Analyze' to generate a deep dive report using Gemini."}
              </div>
            </div>

            {/* Chat Box */}
            <div className="glass rounded-3xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Assistant</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-zinc-600 text-sm italic">Ask me anything about this contract or the Base network.</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl p-3 text-sm rounded-tl-none animate-pulse">
                      ...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChat} className="p-4 bg-white/5 border-t border-white/5">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <div className="text-sm">Base Sepolia Blockchain Dashboard</div>
          <div className="flex gap-8 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Explorer</a>
            <a href="#" className="hover:text-blue-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
