import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  LabelList,
  Label
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  Printer,
  Download,
  Building2,
  Briefcase
} from 'lucide-react';
import { MonthlyData, CostBreakdown, StockData, BalanceSheetSummary } from './types';

// --- DATA CONSTANTS ---

// Data extracted from "PRESTASI PENJUALAN" tables for Jan-Oct
const monthlyData: MonthlyData[] = [
  { month: 'Jan', revenue2024: 1069573971, revenue2025: 2693805750 },
  { month: 'Feb', revenue2024: 1111261625, revenue2025: 1884748700 },
  { month: 'Mar', revenue2024: 869888475, revenue2025: 825671953 },
  { month: 'Apr', revenue2024: 643666275, revenue2025: 793701350 },
  { month: 'May', revenue2024: 1490407613, revenue2025: 741655485 },
  { month: 'Jun', revenue2024: 2247169109, revenue2025: 817566050 },
  { month: 'Jul', revenue2024: 1348294238, revenue2025: 1276926845 },
  { month: 'Aug', revenue2024: 1648304791, revenue2025: 579200000 },
  { month: 'Sep', revenue2024: 827121453, revenue2025: 656229710 },
  { month: 'Oct', revenue2024: 802480909, revenue2025: 914132860 },
];

// Based on Laba Rugi Oct 2025 YTD
const financialSummary2025 = {
  revenue: 11183638703,
  directCost: 8681981875,
  overhead: 1544085008,
  netProfit: 952304320, 
};

// MOCK Balance Sheet Data for Ratio Calculation (Estimates)
const balanceSheet: BalanceSheetSummary = {
  assets: 18500000000,
  liabilities: 6200000000,
  equity: 12300000000,
};

// MOCK Stock Data
const stockParams = {
  sharePrice: 1450,
  totalShares: 10000000, // 10 Million shares
  dividendPerShare: 45,
};

// Calculations for Stock Metrics
const annualizedNetProfit = (financialSummary2025.netProfit / 10) * 12; // Projecting 12 months based on 10
const eps = annualizedNetProfit / stockParams.totalShares;
const per = stockParams.sharePrice / eps;
const bookValuePerShare = balanceSheet.equity / stockParams.totalShares;
const pbv = stockParams.sharePrice / bookValuePerShare;
const roe = (annualizedNetProfit / balanceSheet.equity) * 100;
const der = (balanceSheet.liabilities / balanceSheet.equity);
const marketCap = stockParams.sharePrice * stockParams.totalShares;
const dividendYield = (stockParams.dividendPerShare / stockParams.sharePrice) * 100;

const stockData: StockData = {
  sharePrice: stockParams.sharePrice,
  totalShares: stockParams.totalShares,
  marketCap: marketCap,
  eps: eps,
  per: per,
  pbv: pbv,
  roe: roe,
  der: der,
  dividendYield: dividendYield
};

const costData: CostBreakdown[] = [
  { name: 'Direct Cost', value: financialSummary2025.directCost, color: '#EF4444' },
  { name: 'Overhead', value: financialSummary2025.overhead, color: '#F59E0B' },
  { name: 'Net Profit', value: financialSummary2025.netProfit, color: '#10B981' },
];

// --- HELPER COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 print-shadow-none print-break-inside-avoid ${className}`}>
    {children}
  </div>
);

const KPI: React.FC<{ 
  title: string; 
  value: number; 
  prevValue?: number; 
  icon: React.ElementType; 
  isCurrency?: boolean;
  subtext?: string;
}> = ({ title, value, prevValue, icon: Icon, isCurrency = true, subtext }) => {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const percentageChange = prevValue ? ((value - prevValue) / prevValue) * 100 : 0;
  const isPositive = percentageChange >= 0;

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">
            {isCurrency ? formatCurrency(value) : value.toLocaleString('id-ID')}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <Icon size={20} />
        </div>
      </div>
      {prevValue && (
        <div className="flex items-center text-sm">
          <span className={`flex items-center font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="text-slate-400 ml-2 text-xs">vs YoY (Jan-Oct 2024)</span>
        </div>
      )}
      {subtext && <div className="text-xs text-slate-400 mt-2">{subtext}</div>}
    </Card>
  );
};

const SectionHeader: React.FC<{ title: string; icon?: React.ElementType }> = ({ title, icon: Icon }) => (
  <div className="flex items-center space-x-2 mb-4 mt-8 pb-2 border-b border-slate-200 print-break-inside-avoid">
    {Icon && <Icon className="text-blue-600" size={24} />}
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
  </div>
);

// --- MAIN DASHBOARD ---

const App: React.FC = () => {
  
  const totalRevenue2024 = useMemo(() => monthlyData.reduce((acc, curr) => acc + curr.revenue2024, 0), []);
  const totalRevenue2025 = useMemo(() => monthlyData.reduce((acc, curr) => acc + curr.revenue2025, 0), []);
  const totalGrowth = ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024) * 100;

  const profitMargin = (financialSummary2025.netProfit / financialSummary2025.revenue) * 100;

  // Prepare chart data with random targets based on 9-11 Billion ANNUAL target
  // Average monthly target needed: ~750M - 900M
  const chartData = useMemo(() => {
    return monthlyData.map((data, index) => {
      // Generate random monthly target between 700 Million and 1.1 Billion
      const randomSeed = Math.sin(index + 2025) * 10000;
      const normalizedRandom = (randomSeed - Math.floor(randomSeed)); 
      
      // Range: 700,000,000 to 1,100,000,000
      const target = 700000000 + (normalizedRandom * 400000000); 
      
      return {
        ...data,
        target: Math.floor(target)
      };
    });
  }, []);

  const avgTarget = useMemo(() => chartData.reduce((acc, curr) => acc + curr.target, 0) / chartData.length, [chartData]);
  const avgRevenue2025 = useMemo(() => chartData.reduce((acc, curr) => acc + curr.revenue2025, 0) / chartData.length, [chartData]);

  const formatIDR = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`;
    }
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)} jt`;
    }
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  };

  const formatShortBillions = (value: number) => {
    return `${(value / 1000000000).toFixed(1)} M`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "Financial_Report_DJP_Jan-Oct_2025";
    window.print();
    setTimeout(() => document.title = originalTitle, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation / Action Bar - STICKY & HIGH Z-INDEX */}
        <div className="sticky top-0 z-50 flex justify-between items-center mb-8 py-4 -mx-4 px-4 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur border-b border-slate-200 no-print transition-all">
          <div className="flex items-center text-slate-800">
             <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
               DJ
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">PT. Daniswara Jaya Perkasa</h1>
               <p className="text-xs text-slate-500 font-medium">Financial Intelligence Unit</p>
             </div>
          </div>
          <div className="flex flex-col items-end">
            <button 
              onClick={handlePrint}
              className="cursor-pointer flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
              title="Click to Print or Save as PDF"
            >
              <Printer size={18} />
              <span className="font-medium">Print / Save PDF</span>
            </button>
            <span className="text-[10px] text-slate-400 mt-1">or press Ctrl + P</span>
          </div>
        </div>

        {/* Report Header (Visible in Print) */}
        <div className="hidden print:flex justify-between items-end mb-8 pb-6 border-b-2 border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Financial Report</h1>
            <p className="text-slate-600 font-medium">Period: January - October 2025</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">PT. Daniswara Jaya Perkasa</h2>
            <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="mb-8 print-break-inside-avoid">
          <Card className="bg-gradient-to-r from-blue-900 to-slate-900 text-white border-none print:bg-none print:bg-white print:text-black print:border print:border-slate-300">
            <div className="flex items-start gap-4">
              <Briefcase className="mt-1 opacity-80 print:text-slate-900" />
              <div>
                <h3 className="text-lg font-bold mb-2 print:text-slate-900">Executive Summary</h3>
                <p className="text-slate-200 text-sm leading-relaxed max-w-4xl print:text-slate-800">
                  Year-to-date revenue for 2025 stands at <strong>{formatIDR(totalRevenue2025)}</strong>, representing a slight decrease of 
                  <span className="text-red-300 print:text-red-600 font-semibold mx-1">
                    {Math.abs(totalGrowth).toFixed(1)}%
                  </span> 
                  compared to the same period in 2024. Despite revenue volatility, the company maintains a Net Profit Margin of <strong>{profitMargin.toFixed(1)}%</strong>. 
                  Financial stability remains strong with a Debt-to-Equity Ratio of {der.toFixed(2)}x.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 md:gap-6 mb-8">
          <KPI 
            title="Total Revenue" 
            value={totalRevenue2025} 
            prevValue={totalRevenue2024} 
            icon={DollarSign} 
          />
          <KPI 
            title="Net Profit (YTD)" 
            value={financialSummary2025.netProfit} 
            icon={Activity}
            subtext="Net Margin: 8.5%" 
          />
          <KPI 
            title="EPS (Annualized)" 
            value={stockData.eps} 
            icon={TrendingUp}
            subtext="Earnings Per Share" 
          />
          <KPI 
            title="Equity Value" 
            value={balanceSheet.equity} 
            icon={Building2}
            subtext="Book Value" 
          />
        </div>

        {/* Stock & Valuation Analysis */}
        <SectionHeader title="Market Performance & Valuation" icon={Activity} />
        
        {/* Print Layout: Stack these cards (grid-cols-1) so tables are readable on A4 paper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-6 mb-8 print-break-inside-avoid">
          {/* Main Stock Table */}
          <Card className="lg:col-span-2 print:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Key Financial Ratios</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded print:border print:border-slate-200">TTM / Annualized Basis</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 border-b pb-1">Valuation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Price to Earnings (PER)</span>
                    <span className="font-mono font-bold text-slate-900">{stockData.per.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Price to Book (PBV)</span>
                    <span className="font-mono font-bold text-slate-900">{stockData.pbv.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Dividend Yield</span>
                    <span className="font-mono font-bold text-slate-900">{stockData.dividendYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Market Cap</span>
                    <span className="font-mono font-bold text-slate-900">{formatIDR(stockData.marketCap)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 border-b pb-1">Profitability & Solvency</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Return on Equity (ROE)</span>
                    <span className={`font-mono font-bold ${stockData.roe > 15 ? 'text-emerald-600' : 'text-slate-900'}`}>{stockData.roe.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Return on Assets (ROA)</span>
                    <span className="font-mono font-bold text-slate-900">{((annualizedNetProfit / balanceSheet.assets) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Debt to Equity (DER)</span>
                    <span className={`font-mono font-bold ${stockData.der < 1 ? 'text-emerald-600' : 'text-amber-600'}`}>{stockData.der.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Current Share Price</span>
                    <span className="font-mono font-bold text-blue-600">Rp {stockData.sharePrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Share Structure Card */}
          <Card className="bg-slate-50 border-slate-200 print:bg-white print:border-slate-300">
            <h3 className="font-bold text-slate-800 mb-4">Share Structure</h3>
            <div className="space-y-4">
              <div className="p-3 bg-white rounded border border-slate-100 print:border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Jumlah Saham Beredar (Total Shares)</p>
                <p className="font-mono font-bold text-lg text-slate-900">{stockData.totalShares.toLocaleString()}</p>
              </div>
               <div className="p-3 bg-white rounded border border-slate-100 print:border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Laba Per Saham (EPS)</p>
                <p className="font-mono font-bold text-lg text-slate-900">Rp {stockData.eps.toFixed(2)}</p>
              </div>
               <div className="p-3 bg-white rounded border border-slate-100 print:border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Nilai Buku Per Saham (BVPS)</p>
                <p className="font-mono font-bold text-lg text-slate-900">Rp {bookValuePerShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        {/* Force page break before charts if needed, or let it flow naturally with break-inside-avoid */}
        <div className="print-break-before"></div>
        <SectionHeader title="Revenue & Target Analysis" icon={BarChart2} />

        {/* Print Layout: Stack charts vertically (grid-cols-1) to ensure they are large and readable on paper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-6 mb-8 print-break-inside-avoid">
          
          <Card className="lg:col-span-2 print:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Revenue Realization vs Target (2025)</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span> Realization
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="w-3 h-1 border-t border-dashed border-red-400 mr-2"></span> Target (Annual 9-11M)
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B' }} 
                    tickFormatter={formatIDR} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [formatIDR(value), name === "revenue2025" ? "Realization" : "Target"]}
                  />
                  <Legend wrapperStyle={{ display: 'none' }} />
                  
                  {/* Average Lines */}
                  <ReferenceLine 
                    y={avgTarget} 
                    label={{ value: `Avg Target (${formatShortBillions(avgTarget)})`, position: 'insideTopRight', fill: '#F87171', fontSize: 10 }} 
                    stroke="#F87171" 
                    strokeDasharray="5 5" 
                  />
                  <ReferenceLine 
                    y={avgRevenue2025} 
                    label={{ value: `Avg Realization (${formatShortBillions(avgRevenue2025)})`, position: 'insideBottomRight', fill: '#3B82F6', fontSize: 10 }} 
                    stroke="#3B82F6" 
                    strokeDasharray="5 5" 
                  />

                  {/* Lines */}
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Target" 
                    stroke="#F87171" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue2025" 
                    name="Realization" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  >
                     <LabelList 
                      dataKey="revenue2025" 
                      position="top" 
                      formatter={formatShortBillions} 
                      style={{ fill: '#1E293B', fontSize: '11px', fontWeight: 'bold' }} 
                      offset={10}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="print:col-span-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cost Structure</h3>
             <p className="text-xs text-slate-400 mb-6">As % of Total Revenue</p>
            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatIDR(value)} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute -bottom-4 w-full">
                <div className="space-y-2">
                  {costData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-600">{item.name.split('(')[0]}</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {((item.value / financialSummary2025.revenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <div className="print-break-inside-avoid">
          <SectionHeader title="Monthly Performance Breakdown" icon={Calendar} />
          <Card className="overflow-hidden p-0 print-overflow-visible">
            <div className="overflow-x-auto print:overflow-x-visible">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Month</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Target (Est)</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">2024 Revenue</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">2025 Revenue</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Growth (YoY)</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => {
                    const growth = ((row.revenue2025 - row.revenue2024) / row.revenue2024) * 100;
                    const isPositive = growth >= 0;
                    return (
                      <tr key={index} className="border-b border-slate-100 last:border-none">
                        <td className="p-3 font-medium text-slate-800 text-sm">{row.month}</td>
                        <td className="p-3 text-right text-slate-400 font-mono text-sm italic">
                          {formatShortBillions(row.target)}
                        </td>
                        <td className="p-3 text-right text-slate-600 font-mono text-sm">
                          {new Intl.NumberFormat('id-ID').format(row.revenue2024)}
                        </td>
                        <td className="p-3 text-right text-slate-900 font-mono text-sm font-medium">
                          {new Intl.NumberFormat('id-ID').format(row.revenue2025)}
                        </td>
                        <td className={`p-3 text-right font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-200">
                  <tr>
                    <td className="p-4 text-sm text-slate-800 uppercase tracking-wide">Total (Jan - Oct)</td>
                     <td className="p-4 text-right text-slate-500 font-mono text-sm">-</td>
                    <td className="p-4 text-right text-slate-800 font-mono text-sm">
                      {new Intl.NumberFormat('id-ID').format(totalRevenue2024)}
                    </td>
                    <td className="p-4 text-right text-slate-900 font-mono text-sm">
                      {new Intl.NumberFormat('id-ID').format(totalRevenue2025)}
                    </td>
                    <td className={`p-4 text-right text-sm ${totalGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {totalGrowth > 0 ? '+' : ''}{totalGrowth.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Footer for Print */}
        <div className="hidden print:block text-center mt-12 pt-8 border-t border-slate-200 text-xs text-slate-400">
          <div className="flex justify-between items-center">
             <span>PT. Daniswara Jaya Perkasa</span>
             <span>Page 1 of 1</span>
          </div>
          <p className="mt-2">Confidential Financial Report. This document is for internal use only.</p>
        </div>

      </div>
    </div>
  );
};

export default App;