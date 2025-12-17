export interface MonthlyData {
  month: string;
  revenue2024: number;
  revenue2025: number;
  [key: string]: string | number;
}

export interface CostBreakdown {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface KPIData {
  label: string;
  value: number;
  prevValue?: number;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface StockData {
  sharePrice: number;
  totalShares: number;
  marketCap: number;
  eps: number; // Annualized
  per: number;
  pbv: number;
  roe: number;
  der: number;
  dividendYield: number;
}

export interface BalanceSheetSummary {
  assets: number;
  liabilities: number;
  equity: number;
}