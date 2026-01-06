
export interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  creator: string;
  totalSupply: string;
  price: string;
  marketCap: string;
  logoUrl?: string;
  description?: string;
}

export interface TradeRequest {
  tokenAddress: string;
  amount: string;
  type: 'BUY' | 'SELL';
}

export enum AppSection {
  LIST = 'LIST',
  LAUNCH = 'LAUNCH',
  TRADE = 'TRADE'
}
