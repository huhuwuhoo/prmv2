
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { http } from 'viem';
import { PROJECT_ID } from './constants';

const networks = [baseSepolia];

export const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks,
  transports: {
    // 显式指定传输协议，不给回退到主网的机会
    [baseSepolia.id]: http('https://sepolia.base.org')
  }
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: PROJECT_ID,
  defaultNetwork: baseSepolia,
  metadata: {
    name: 'BaseLaunch',
    description: 'Base Sepolia Token Factory',
    url: 'https://baselaunch.example.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  },
  features: {
    analytics: true
  }
});
