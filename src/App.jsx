import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CreditCard, 
  PieChart, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  LogOut,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Check,
  X,
  Zap,
  Filter,
  MoreHorizontal,
  DollarSign,
  Calendar,
  Trash2,
  User,
  CheckCircle2,
  ArrowUpRight,
  Wallet,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Design Tokens & Utils (Lo-Fi) ---
// Strictly Monochrome
const THEME_CONSTANTS = {
  light: { bg: "#ffffff", surface: "#ffffff", border: "#000000" },
  dark: { bg: "#1a1a1a", surface: "#262626", border: "#525252" } // Optional dark mode wireframe support
};

// Formatter for currency
const formatCurrency = (amount, currency = 'INR') => {
  const rates = { USD: 1, INR: 83.50, EUR: 0.92 }; 
  const symbols = { USD: '$', INR: '₹', EUR: '€' };
  
  const convertedAmount = amount * (rates[currency] || 1);
  const symbol = symbols[currency] || '₹';

  return `${symbol}${convertedAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// --- Mock Data ---
const INITIAL_SUBSCRIPTIONS = [
  { id: 1, name: "Netflix Premium", price: 19.99, cycle: "Monthly", category: "Entertainment", nextBill: "2024-08-24", status: "Active", icon: "N" },
  { id: 2, name: "Spotify Duo", price: 14.99, cycle: "Monthly", category: "Music", nextBill: "2024-08-28", status: "Active", icon: "S" },
  { id: 3, name: "Adobe Creative Cloud", price: 54.99, cycle: "Monthly", category: "Software", nextBill: "2024-09-01", status: "Active", icon: "A" },
  { id: 4, name: "Figma Professional", price: 12.00, cycle: "Monthly", category: "Software", nextBill: "2024-09-05", status: "Trial", icon: "F" },
  { id: 5, name: "Amazon Prime", price: 139.00, cycle: "Yearly", category: "Shopping", nextBill: "2025-01-15", status: "Active", icon: "A" },
  { id: 6, name: "NordVPN", price: 11.95, cycle: "Monthly", category: "Security", nextBill: "2024-08-30", status: "Paused", icon: "N" },
];

const MOCK_CHART_DATA = [
  { month: 'Jan', spend: 320 },
  { month: 'Feb', spend: 345 },
  { month: 'Mar', spend: 330 },
  { month: 'Apr', spend: 380 },
  { month: 'May', spend: 360 },
  { month: 'Jun', spend: 420 },
];

// --- Shared Components ---

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 right-6 z-[100] flex items-center gap-4 bg-white border-2 border-black text-black px-6 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
  >
    <div className="w-6 h-6 border-2 border-black flex items-center justify-center rounded-full">
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
    </div>
    <div>
      <h4 className="font-bold text-sm uppercase">{type}</h4>
      <p className="text-xs font-mono mt-0.5">{message}</p>
    </div>
    <button onClick={onClose} className="ml-2 hover:bg-gray-100 p-1 rounded">
      <X size={16} />
    </button>
  </motion.div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <motion.div 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
          className="relative w-full max-w-md bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
            <h3 className="text-xl font-bold font-mono uppercase">{title}</h3>
            <button onClick={onClose} className="hover:bg-gray-100 p-1 border border-transparent hover:border-black transition-all">
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StatusBadge = ({ status }) => {
  // Lo-fi badges: outlines and grayscale fills
  const styles = {
    Active: "bg-white text-black border-black",
    Trial: "bg-gray-100 text-black border-black border-dashed",
    Paused: "bg-gray-200 text-gray-600 border-gray-400"
  };
  
  return (
    <span className={`px-3 py-1 text-xs font-bold border ${styles[status] || styles.Paused} flex items-center gap-2 w-fit uppercase font-mono`}>
      <span className={`w-2 h-2 border border-black ${status === 'Active' ? 'bg-black' : status === 'Trial' ? 'bg-gray-400' : 'bg-white'}`} />
      {status}
    </span>
  );
};

// --- Sub-Views ---

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Wallet', icon: Wallet },
    { id: 'calculator', label: 'Savings', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white border-r-2 border-black z-50 flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3 border-b-2 border-black">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold font-mono uppercase hidden lg:block">Unroll</span>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-mono border-2 transition-all ${
                activeTab === item.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-transparent hover:border-black hover:bg-gray-50"
              }`}
            >
              <item.icon size={18} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t-2 border-black">
        <button className="flex items-center gap-3 w-full p-3 border-2 border-transparent hover:border-black hover:bg-gray-50 transition-all font-mono">
          <LogOut size={18} />
          <span className="hidden lg:block text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ title, userSettings }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'ALERT', message: 'Netflix Premium +$2', time: '2h', type: 'alert' },
    { id: 2, title: 'WARNING', message: 'Figma Trial Ends Soon', time: '5h', type: 'warning' },
    { id: 3, title: 'INFO', message: 'Spotify Paid', time: '1d', type: 'success' }
  ]);

  const clearNotifications = () => setNotifications([]);

  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4 relative z-40 border-b-2 border-black pb-6 border-dashed">
      <div>
        <h1 className="text-3xl font-bold text-black font-mono uppercase tracking-tighter">{title}</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs font-mono uppercase">
          [ {userSettings.name.split(' ')[0]}'s Workspace ]
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-3 px-4 py-2 border-2 border-black bg-white">
          <div className="w-8 h-8 bg-gray-200 border border-black flex items-center justify-center overflow-hidden">
             <User size={16} />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold uppercase">{userSettings.name}</p>
            <p className="text-[10px] font-mono">PRO_PLAN</p>
          </div>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 border-2 border-black hover:bg-black hover:text-white transition-all"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-black border border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-14 w-80 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-40"
                >
                  <div className="p-3 border-b-2 border-black flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold font-mono text-sm uppercase">Logs</h3>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs underline hover:bg-black hover:text-white px-1">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((note) => (
                        <div key={note.id} className="p-3 border-b border-black last:border-0 hover:bg-gray-50 flex gap-3 items-start">
                          <div className="font-mono text-[10px] bg-black text-white px-1 mt-1">{note.title}</div>
                          <div>
                            <p className="text-xs font-mono leading-tight">{note.message}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{note.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400 font-mono text-xs">
                        [ NO NEW LOGS ]
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const KPICard = ({ title, amount, trend, trendValue, icon: Icon }) => (
  <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <div className="flex justify-between items-start mb-6">
      <div className="p-2 border-2 border-black">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold px-2 py-1 border border-black bg-gray-100 font-mono">
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </span>
      )}
    </div>
    <div className="space-y-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider font-mono">{title}</p>
        <h3 className="text-3xl font-bold text-black font-mono">{amount}</h3>
    </div>
  </div>
);

const SpendingChart = ({ data, currency }) => {
  const rates = { USD: 1, INR: 83.50, EUR: 0.92 };
  const currentRate = rates[currency] || 1;
  const symbols = { USD: '$', INR: '₹', EUR: '€' };
  const symbol = symbols[currency] || '₹';

  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      converted: d.spend * currentRate
    }));
  }, [data, currentRate]);

  return (
    <div className="bg-white p-6 border-2 border-black h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-2 border-dashed">
        <div>
          <h3 className="font-bold text-black text-lg font-mono uppercase">Spending_Trend</h3>
          <p className="text-gray-500 text-xs font-mono">6_MONTH_VIEW</p>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
            <XAxis 
              dataKey="month" 
              axisLine={{ stroke: 'black', strokeWidth: 2 }} 
              tickLine={false} 
              tick={{fill: 'black', fontSize: 10, fontFamily: 'monospace'}} 
              dy={10}
            />
            <YAxis hide={true} />
            <Tooltip 
              contentStyle={{ 
                border: '2px solid black', 
                boxShadow: '4px 4px 0px 0px black',
                backgroundColor: 'white',
                fontFamily: 'monospace'
              }}
              formatter={(value) => [`${symbol}${value.toLocaleString()}`, 'SPEND']}
            />
            <Area 
              type="step" 
              dataKey="converted" 
              stroke="black" 
              strokeWidth={2} 
              fillOpacity={0.1} 
              fill="black" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Main Views ---

const DashboardView = ({ subscriptions, userSettings, onNavigate, onCancelSub }) => {
  const totalSpend = subscriptions.filter(s => s.status === 'Active' || s.status === 'Trial').reduce((acc, sub) => sub.cycle === 'Monthly' ? acc + sub.price : acc + (sub.price / 12), 0);
  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const trialSub = subscriptions.find(s => s.status === 'Trial');

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Monthly_Burn" 
          amount={formatCurrency(totalSpend, userSettings.currency)} 
          trend="down" 
          trendValue="2.4%" 
          icon={DollarSign} 
        />
        <KPICard 
          title="Active_Subs" 
          amount={activeCount} 
          trend="up" 
          trendValue="+1" 
          icon={Zap} 
        />
        <KPICard 
          title="Potential_Svgs" 
          amount={formatCurrency(420, userSettings.currency)} 
          trend="up"
          trendValue="OPTIMIZE"
          icon={TrendingUp} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main List & Chart */}
        <div className="xl:col-span-2 space-y-8">
            <SpendingChart data={MOCK_CHART_DATA} currency={userSettings.currency} />

            <div className="bg-white border-2 border-black p-6">
                <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                    <div>
                        <h3 className="font-bold text-black text-lg font-mono uppercase">Upcoming_Renewals</h3>
                        <p className="text-gray-500 text-xs font-mono">NEXT_30_DAYS</p>
                    </div>
                    <button onClick={() => onNavigate('subscriptions')} className="text-xs font-bold text-black border border-black px-3 py-2 hover:bg-black hover:text-white transition-all font-mono uppercase">
                        View All →
                    </button>
                </div>
                
                <div className="space-y-4">
                    {subscriptions.slice(0, 4).map((sub) => (
                    <div 
                        key={sub.id}
                        className="flex items-center justify-between p-4 border border-gray-200 hover:border-black transition-all cursor-pointer group bg-white"
                    >
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-black flex items-center justify-center font-bold font-mono bg-gray-50 group-hover:bg-black group-hover:text-white">
                            {sub.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-black font-mono text-sm uppercase">{sub.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] font-mono text-gray-500">
                                    RENEWS: {new Date(sub.nextBill).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                </p>
                            </div>
                        </div>
                        </div>
                        <div className="text-right">
                        <p className="font-bold text-lg text-black font-mono mb-1">{formatCurrency(sub.price, userSettings.currency)}</p>
                        <StatusBadge status={sub.status} />
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Action Center */}
        <div className="space-y-8">
          {trialSub && (
             <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden pattern-diagonal-lines-sm">
                <div className="flex items-start justify-between mb-6 border-b-2 border-black border-dashed pb-4">
                    <div className="p-2 bg-black text-white">
                        <AlertCircle size={20} />
                    </div>
                    <span className="text-[10px] font-bold bg-white border border-black px-2 py-1 font-mono">EXP: 2 DAYS</span>
                </div>
                <h3 className="font-bold text-xl mb-2 font-mono uppercase">Trial Ending</h3>
                <p className="text-gray-600 text-xs font-mono mb-6 leading-relaxed">
                    ACTION REQUIRED: <span className="font-bold border-b border-black">{trialSub.name}</span> will charge {formatCurrency(trialSub.price, userSettings.currency)}.
                </p>
                <button 
                    onClick={() => onCancelSub(trialSub)}
                    className="w-full py-3 bg-white border-2 border-black text-black font-bold text-sm hover:bg-black hover:text-white transition-all uppercase font-mono"
                >
                    Cancel Subscription
                </button>
             </div>
          )}

          <div className="bg-gray-100 border-2 border-black border-dashed p-8 text-center relative">
             <div className="w-12 h-12 mx-auto bg-white border-2 border-black flex items-center justify-center mb-4">
                <Plus size={24} />
             </div>
             <h3 className="font-bold text-sm mb-2 font-mono uppercase">Add Service</h3>
             <p className="text-gray-500 text-xs font-mono mb-6">Manual Entry</p>
             <button 
                onClick={() => onNavigate('subscriptions')}
                className="w-full py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all font-mono text-xs font-bold uppercase"
             >
                Link Service
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionsView = ({ subscriptions, onAdd, onDelete, userSettings }) => {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || sub.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? sub.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Filters Toolbar */}
      <div className="p-6 border-b-2 border-black flex flex-col xl:flex-row justify-between items-center gap-6 bg-gray-50">
        <div className="relative w-full xl:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm uppercase placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-3 w-full xl:w-auto">
          <div className="relative">
             <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border-2 border-black bg-white font-mono text-sm uppercase focus:outline-none cursor-pointer hover:bg-gray-100"
             >
                <option value="">Status: All</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Paused">Paused</option>
             </select>
             <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button 
            onClick={onAdd}
            className="px-6 py-3 bg-black text-white font-mono text-sm font-bold hover:bg-gray-800 flex items-center gap-2 active:scale-95 transition-all uppercase"
          >
            <Plus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-6 px-6 py-3 border-b-2 border-black bg-white text-[10px] font-bold uppercase tracking-widest font-mono">
        <div className="col-span-5 sm:col-span-4 pl-2">Details</div>
        <div className="col-span-3 sm:col-span-2">Cost</div>
        <div className="col-span-3 hidden sm:block">Cycle</div>
        <div className="col-span-4 sm:col-span-2">State</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {/* Table Body */}
      <div className="p-0">
        {filteredSubs.length > 0 ? filteredSubs.map((sub) => (
          <div 
            key={sub.id} 
            className="grid grid-cols-12 gap-6 px-6 py-4 items-center border-b border-gray-200 hover:bg-gray-50 transition-colors group relative mx-0 font-mono"
          >
            <div className="col-span-5 sm:col-span-4 flex items-center gap-4">
              <div className="w-10 h-10 border border-black flex items-center justify-center font-bold bg-white group-hover:bg-black group-hover:text-white transition-colors">
                {sub.icon}
              </div>
              <div>
                <p className="font-bold text-black text-sm uppercase">{sub.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{sub.category}</p>
              </div>
            </div>
            
            <div className="col-span-3 sm:col-span-2 font-bold text-black text-sm tabular-nums">
              {formatCurrency(sub.price, userSettings.currency)}
            </div>
            
            <div className="col-span-3 hidden sm:block text-xs text-gray-600 uppercase">
              {sub.cycle}
            </div>
            
            <div className="col-span-4 sm:col-span-2">
              <StatusBadge status={sub.status} />
            </div>
            
            <div className="col-span-1 text-right relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === sub.id ? null : sub.id)}
                className="p-2 border border-transparent hover:border-black hover:bg-white transition-all"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {activeMenu === sub.id && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                    <div className="absolute right-0 top-10 w-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 overflow-hidden">
                        <button className="w-full text-left px-4 py-3 text-xs font-bold font-mono uppercase hover:bg-gray-100 border-b border-gray-100">Edit</button>
                        <button 
                            onClick={() => { onDelete(sub); setActiveMenu(null); }}
                            className="w-full text-left px-4 py-3 text-xs font-bold font-mono uppercase hover:bg-black hover:text-white"
                        >
                            Remove
                        </button>
                    </div>
                </>
              )}
            </div>
          </div>
        )) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 font-mono">
                <p className="text-sm uppercase">[ No Data Found ]</p>
            </div>
        )}
      </div>
    </div>
  );
};

const CalculatorView = ({ subscriptions, userSettings, onDeleteMultiple }) => {
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleSelection = (id) => {
    setSelectedSubs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const calculateSavings = useMemo(() => {
    const monthlySavings = subscriptions
      .filter(s => selectedSubs.includes(s.id))
      .reduce((acc, curr) => acc + (curr.cycle === 'Monthly' ? curr.price : curr.price/12), 0);
    
    return {
      monthly: monthlySavings,
      yearly: monthlySavings * 12
    };
  }, [selectedSubs, subscriptions]);

  const handleCut = () => {
    onDeleteMultiple(selectedSubs);
    setSelectedSubs([]);
    setShowConfirm(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
      {/* Selection Area */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white border-2 border-black p-8 h-full">
          <div className="mb-8 border-b-2 border-black pb-4 border-dashed">
            <h2 className="text-xl font-bold text-black mb-1 font-mono uppercase">Simulator</h2>
            <p className="text-xs font-mono text-gray-500">SELECT_TO_CUT</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => toggleSelection(sub.id)}
                className={`flex items-center p-4 border-2 transition-all cursor-pointer relative ${
                  selectedSubs.includes(sub.id) 
                    ? "bg-black text-white border-black" 
                    : "bg-white border-gray-300 hover:border-black"
                }`}
              >
                <div className={`w-5 h-5 border-2 mr-4 flex items-center justify-center ${selectedSubs.includes(sub.id) ? "border-white bg-white text-black" : "border-black"}`}>
                  {selectedSubs.includes(sub.id) && <Check size={12} strokeWidth={4} />}
                </div>

                <div className={`w-10 h-10 border flex items-center justify-center font-bold mr-4 ${selectedSubs.includes(sub.id) ? "border-white" : "border-black"}`}>
                  {sub.icon}
                </div>
                
                <div>
                  <h4 className="font-bold text-sm font-mono uppercase">{sub.name}</h4>
                  <p className={`text-xs font-mono ${selectedSubs.includes(sub.id) ? "text-gray-300" : "text-gray-500"}`}>
                    {formatCurrency(sub.price, userSettings.currency)} / {sub.cycle === 'Monthly' ? 'MO' : 'YR'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Sticky Card */}
      <div className="xl:col-span-1">
        <div className="sticky top-28 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between overflow-hidden relative min-h-[400px]">
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border border-black px-3 py-1 text-[10px] font-bold mb-8 uppercase font-mono bg-gray-50">
              <Wallet size={12} /> Projected Outcome
            </div>
            
            <h3 className="text-gray-500 font-mono text-xs uppercase mb-1">Total Yearly Savings</h3>
            <div className="text-5xl font-bold mb-8 tracking-tighter font-mono border-b-4 border-black w-fit pb-2">
               {formatCurrency(calculateSavings.yearly, userSettings.currency)}
            </div>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between border-b border-dashed border-gray-400 pb-2">
                <span className="text-gray-500">Monthly</span>
                <span className="font-bold">+{formatCurrency(calculateSavings.monthly, userSettings.currency)}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-gray-400 pb-2">
                 <span className="text-gray-500">Invested (7%)</span>
                 <span className="font-bold">+{formatCurrency(calculateSavings.yearly * 1.07, userSettings.currency)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 relative z-10">
             <button 
                onClick={() => selectedSubs.length > 0 && setShowConfirm(true)}
                disabled={selectedSubs.length === 0}
                className={`w-full py-4 border-2 border-black font-bold text-sm uppercase font-mono transition-all ${
                    selectedSubs.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
             >
               Cut Selected ({selectedSubs.length})
             </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Cut">
            <div className="bg-gray-100 border border-black p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p className="text-xs font-mono leading-relaxed">
                    WARNING: This will initiate cancellation for {selectedSubs.length} services. Proceed?
                </p>
            </div>
            <div className="flex gap-4 justify-end">
                <button onClick={() => setShowConfirm(false)} className="px-6 py-3 border-2 border-transparent hover:border-black font-mono text-xs uppercase font-bold">Cancel</button>
                <button onClick={handleCut} className="px-6 py-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black font-mono text-xs uppercase font-bold">Confirm</button>
            </div>
      </Modal>
    </div>
  );
};

const SettingsView = ({ settings, updateSettings }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 font-mono">
            <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-bold text-black mb-8 flex items-center gap-3 uppercase border-b-2 border-black pb-4">
                    <User size={20} /> Profile Data
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                            <input 
                                type="text" 
                                value={settings.name} 
                                onChange={(e) => updateSettings('name', e.target.value)}
                                className="w-full p-3 bg-white border-2 border-black focus:outline-none focus:bg-gray-50 transition-all font-bold text-sm uppercase"
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                            <input type="email" value="felix@example.com" disabled className="w-full p-3 bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed font-bold text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-bold text-black mb-8 flex items-center gap-3 uppercase border-b-2 border-black pb-4">
                    <Settings size={20} /> Preferences
                </h3>
                <div className="space-y-8">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-black text-sm uppercase">Theme</p>
                            <p className="text-[10px] text-gray-500 mt-1">WIREFRAME MODE ONLY</p>
                        </div>
                        <div className="flex border-2 border-black p-1">
                           <button
                             disabled
                             className={`p-2 bg-black text-white`}
                           >
                             <Sun size={16} />
                           </button>
                           <button
                             disabled
                             className={`p-2 text-gray-300 cursor-not-allowed`}
                           >
                             <Moon size={16} />
                           </button>
                        </div>
                    </div>
                    
                    <div className="h-px bg-black w-full border-b border-dashed border-gray-400"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-black text-sm uppercase">Currency</p>
                            <p className="text-[10px] text-gray-500 mt-1">DISPLAY UNIT</p>
                        </div>
                        <div className="flex border-2 border-black bg-gray-100">
                            {['INR', 'USD', 'EUR'].map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => updateSettings('currency', curr)}
                                    className={`px-4 py-2 text-xs font-bold transition-all border-r border-black last:border-0 ${settings.currency === curr ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-white'}`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // -- Local Storage Initialization --
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('unroll_subs');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch (e) {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  const [userSettings, setUserSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('unroll_settings');
      return saved ? JSON.parse(saved) : {
        name: 'Felix Mitchell',
        currency: 'INR',
        notifications: true,
        theme: 'light'
      };
    } catch (e) {
      return { name: 'Felix Mitchell', currency: 'INR', notifications: true, theme: 'light' };
    }
  });

  // -- Persistence Effects --
  useEffect(() => {
    localStorage.setItem('unroll_subs', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('unroll_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const [toasts, setToasts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New Sub Form State
  const [newSub, setNewSub] = useState({ name: '', price: '', category: 'Entertainment', cycle: 'Monthly' });

  const addToast = (msg, type = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAddSubscription = () => {
      if(!newSub.name || !newSub.price) return;
      const sub = {
          id: Date.now(),
          ...newSub,
          price: parseFloat(newSub.price),
          nextBill: new Date().toISOString(),
          status: 'Active',
          icon: newSub.name[0].toUpperCase(),
      };
      setSubscriptions(prev => [sub, ...prev]);
      setModalOpen(false);
      setNewSub({ name: '', price: '', category: 'Entertainment', cycle: 'Monthly' });
      addToast("ENTRY_ADDED");
  };

  const handleDeleteSubscription = (sub) => {
      setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
      addToast(`DELETED: ${sub.name.toUpperCase()}`);
  };

  const handleBatchDelete = (ids) => {
      setSubscriptions(prev => prev.filter(s => !ids.includes(s.id)));
      addToast(`BATCH_DELETE: ${ids.length} ITEMS`);
  };

  const updateSettings = (key, value) => {
      setUserSettings(prev => ({...prev, [key]: value}));
      if(key === 'currency') addToast(`CURRENCY: ${value}`);
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView subscriptions={subscriptions} userSettings={userSettings} onNavigate={setActiveTab} onCancelSub={handleDeleteSubscription} />;
      case 'subscriptions': return <SubscriptionsView subscriptions={subscriptions} userSettings={userSettings} onAdd={() => setModalOpen(true)} onDelete={handleDeleteSubscription} />;
      case 'calculator': return <CalculatorView subscriptions={subscriptions} userSettings={userSettings} onDeleteMultiple={handleBatchDelete} />;
      case 'settings': return <SettingsView settings={userSettings} updateSettings={updateSettings} />;
      default: return <DashboardView subscriptions={subscriptions} userSettings={userSettings} />;
    }
  };

  return (
    <div className={`min-h-screen font-mono bg-gray-50 text-black flex`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-12 max-w-[1600px] transition-all duration-300">
          <Header title={activeTab === 'calculator' ? 'Simulate' : activeTab === 'subscriptions' ? 'Wallet' : activeTab === 'settings' ? 'Config' : 'Dashboard'} userSettings={userSettings} />
          
          <AnimatePresence mode='wait'>
          <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
          >
              {renderContent()}
          </motion.div>
          </AnimatePresence>
      </main>

      {/* Global Components */}
      <AnimatePresence>
          {toasts.map(t => (
              <Toast key={t.id} message={t.msg} type={t.type} onClose={() => setToasts(p => p.filter(i => i.id !== t.id))} />
          ))}
      </AnimatePresence>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Entry">
          <div className="space-y-6">
              <div>
                  <label className="block text-[10px] font-bold uppercase mb-2">Service Name</label>
                  <input 
                      className="w-full p-3 border-2 border-black focus:outline-none focus:bg-gray-50 font-mono text-sm uppercase placeholder:text-gray-400" 
                      placeholder="e.g. NETFLIX"
                      value={newSub.name}
                      onChange={e => setNewSub({...newSub, name: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[10px] font-bold uppercase mb-2">Cost</label>
                      <div className="relative">
                          <input 
                              type="number"
                              className="w-full p-3 border-2 border-black focus:outline-none focus:bg-gray-50 font-mono text-sm font-bold" 
                              placeholder="0.00"
                              value={newSub.price}
                              onChange={e => setNewSub({...newSub, price: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold uppercase mb-2">Cycle</label>
                      <select 
                          className="w-full p-3 border-2 border-black focus:outline-none bg-white font-mono text-sm uppercase"
                          value={newSub.cycle}
                          onChange={e => setNewSub({...newSub, cycle: e.target.value})}
                      >
                          <option>Monthly</option>
                          <option>Yearly</option>
                      </select>
                  </div>
              </div>
              <div>
                  <label className="block text-[10px] font-bold uppercase mb-2">Category</label>
                  <select 
                      className="w-full p-3 border-2 border-black focus:outline-none bg-white font-mono text-sm uppercase"
                      value={newSub.category}
                      onChange={e => setNewSub({...newSub, category: e.target.value})}
                  >
                      <option>Entertainment</option>
                      <option>Software</option>
                      <option>Utilities</option>
                      <option>Shopping</option>
                  </select>
              </div>
              <button 
                  onClick={handleAddSubscription}
                  className="w-full py-4 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                  Confirm Entry
              </button>
          </div>
      </Modal>
    </div>
  );
};

export default App;