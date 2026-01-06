
import React from 'react';
import { AppSection } from '../types';

interface NavbarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(AppSection.LIST)}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl italic neon-glow">
            B
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block">BaseLaunch</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { id: AppSection.LIST, label: 'Explore' },
            { id: AppSection.LAUNCH, label: 'Launch' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === item.id 
                  ? 'bg-white/10 text-blue-400' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <appkit-button />
      </div>
    </nav>
  );
};

export default Navbar;
