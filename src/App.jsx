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
  Sun
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Design Tokens & Utils ---
// We will handle theme via Tailwind 'dark:' classes, but keep some constants for reference
const THEME_CONSTANTS = {
  light: { bg: "#F3F4F6", surface: "#ffffff" },
  dark: { bg: "#0F172A", surface: "#1E293B" }
};

// Formatter for currency with conversion logic
const formatCurrency = (amount, currency = 'INR') => {
  // Base rates relative to USD (assuming input amounts are base USD for calculation consistency)
  const rates = { USD: 1, INR: 83.50, EUR: 0.92 };
  const symbols = { USD: '$', INR: '₹', EUR: '€' };

  const convertedAmount = amount * (rates[currency] || 1);
  const symbol = symbols[currency] || '₹';

  return `${symbol}${convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// --- Mock Data & Helpers ---
const INITIAL_SUBSCRIPTIONS = [
  { id: 1, name: "Netflix Premium", price: 19.99, cycle: "Monthly", category: "Entertainment", nextBill: "2024-08-24", status: "Active", icon: "N", color: "from-red-500 to-red-600" },
  { id: 2, name: "Spotify Duo", price: 14.99, cycle: "Monthly", category: "Music", nextBill: "2024-08-28", status: "Active", icon: "S", color: "from-green-500 to-emerald-600" },
  { id: 3, name: "Adobe Creative Cloud", price: 54.99, cycle: "Monthly", category: "Software", nextBill: "2024-09-01", status: "Active", icon: "A", color: "from-blue-600 to-blue-700" },
  { id: 4, name: "Figma Professional", price: 12.00, cycle: "Monthly", category: "Software", nextBill: "2024-09-05", status: "Trial", icon: "F", color: "from-purple-600 to-fuchsia-600" },
  { id: 5, name: "Amazon Prime", price: 139.00, cycle: "Yearly", category: "Shopping", nextBill: "2025-01-15", status: "Active", icon: "A", color: "from-orange-400 to-amber-500" },
  { id: 6, name: "NordVPN", price: 11.95, cycle: "Monthly", category: "Security", nextBill: "2024-08-30", status: "Paused", icon: "N", color: "from-sky-500 to-cyan-600" },
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
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className="fixed bottom-6 right-6 z-[100] flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200"
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-600' : 'bg-red-500/20 text-red-400 dark:text-red-600'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    </div>
    <div>
      <h4 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Attention'}</h4>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{message}</p>
    </div>
    <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white dark:hover:text-slate-900 transition-colors">
      <X size={16} />
    </button>
  </motion.div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="
  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  w-full max-w-md
  bg-white dark:bg-slate-800
  rounded-3xl shadow-2xl z-[70]
  p-8
  border border-slate-100 dark:border-slate-700
  max-h-[90vh] overflow-y-auto"

        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Trial: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    Paused: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Paused} flex items-center gap-1.5 w-fit`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : status === 'Trial' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      {status === 'Trial' ? 'Trial Period' : status}
    </span>
  );
};

// --- Sub-Views ---

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'My Wallet', icon: Wallet },
    { id: 'calculator', label: 'Savings', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full w-20 lg:w-72 bg-slate-900 dark:bg-slate-950 z-50 flex flex-col justify-between transition-all duration-300 shadow-2xl`}>
      <div>
        <div className="p-8 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0`}>
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white hidden lg:block">Unroll</span>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon size={22} className={`relative z-10 ${activeTab === item.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="hidden lg:block relative z-10 tracking-wide">{item.label}</span>

              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute left-0 w-1 h-full bg-indigo-500 top-0"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800/50">
        <button className="flex items-center gap-4 w-full p-4 rounded-2xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors group">
          <LogOut size={22} />
          <span className="hidden lg:block text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ title, userSettings }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Price Alert', message: 'Netflix Premium increased by $2.', time: '2h ago', type: 'alert' },
    { id: 2, title: 'Trial Ending', message: 'Figma Professional trial ends in 3 days.', time: '5h ago', type: 'warning' },
    { id: 3, title: 'Bill Paid', message: 'Spotify Duo payment of $14.99 successful.', time: '1d ago', type: 'success' }
  ]);

  const clearNotifications = () => setNotifications([]);

  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4 relative z-40">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {userSettings.name.split(' ')[0]}'s Workspace
        </p>
      </div>
      <div className="flex items-center gap-6 bg-white dark:bg-slate-800 p-2 pr-6 pl-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 p-0.5 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{userSettings.name}</p>
            <p className="text-xs text-slate-400 mt-1">Pro Plan</p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        {/* Notification Area */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400 hover:text-indigo-600"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-40 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((note) => (
                        <div key={note.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex gap-3 group cursor-default">
                          <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${note.type === 'alert' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : note.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{note.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{note.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{note.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-slate-400">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={20} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                        <p className="text-xs mt-1 opacity-70">No new notifications.</p>
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

const KPICard = ({ title, amount, trend, trendValue, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-emerald-600 bg-emerald-50'}`}>
          <TrendingUp size={14} className="mr-1.5" />
          {trendValue}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{amount}</h3>
    </div>
  </motion.div>
);

const SpendingChart = ({ data, currency }) => {
  // 1. Get conversion rate
  const rates = { USD: 1, INR: 83.50, EUR: 0.92 };
  const currentRate = rates[currency] || 1;
  const symbols = { USD: '$', INR: '₹', EUR: '€' };
  const symbol = symbols[currency] || '₹';

  // 2. Prepare data with numeric converted values
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      // Keep raw 'spend' for shape if needed, but we want value for tooltip/axis
      converted: d.spend * currentRate
    }));
  }, [data, currentRate]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-xl">Spending Trend</h3>
          <p className="text-slate-400 text-sm mt-1">Last 6 months</p>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              hide={true}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#1E293B'
              }}
              formatter={(value) => [`${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Spend']}
            />
            <Area
              type="monotone"
              dataKey="converted"
              stroke="#6366F1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSpend)"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard
          title="Monthly Burn"
          amount={formatCurrency(totalSpend, userSettings.currency)}
          trend="down"
          trendValue="2.4% vs last mo"
          icon={DollarSign}
          colorClass="bg-indigo-500"
          delay={0}
        />
        <KPICard
          title="Active Services"
          amount={activeCount}
          trend="up"
          trendValue="1 New Added"
          icon={Zap}
          colorClass="bg-amber-500"
          delay={0.1}
        />
        <KPICard
          title="Potential Savings"
          amount={formatCurrency(420, userSettings.currency)}
          trend="up"
          trendValue="Cancel unused"
          icon={TrendingUp}
          colorClass="bg-emerald-500"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Main List & Chart */}
        <div className="xl:col-span-2 space-y-8">
          <SpendingChart data={MOCK_CHART_DATA} currency={userSettings.currency} />

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xl">Upcoming Renewals</h3>
                <p className="text-slate-400 text-sm mt-1">Next 30 days timeline</p>
              </div>
              <button onClick={() => onNavigate('subscriptions')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                View All <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {subscriptions.slice(0, 4).map((sub, i) => (
                <motion.div
                  key={sub.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-700/30 hover:bg-white dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center text-xl font-bold shadow-md ring-4 ring-white dark:ring-slate-800 group-hover:scale-105 transition-transform`}>
                      {sub.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{sub.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={12} className="text-slate-400" />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          {new Date(sub.nextBill).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900 dark:text-white mb-1">{formatCurrency(sub.price, userSettings.currency)}</p>
                    <StatusBadge status={sub.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Center - Modernized */}
        <div className="space-y-8">
          {trialSub && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-rose-500/20 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-orange-600"></div>
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                    <AlertCircle size={24} />
                  </div>
                  <span className="text-xs font-bold bg-white text-rose-600 px-3 py-1.5 rounded-full shadow-lg">Expires in 2 days</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">Trial Ending</h3>
                <p className="text-rose-100 text-sm mb-8 leading-relaxed">
                  <span className="font-bold text-white border-b border-white/30 pb-0.5">{trialSub.name}</span> will charge you {formatCurrency(trialSub.price, userSettings.currency)}.
                </p>
                <button
                  onClick={() => onCancelSub(trialSub)}
                  className="w-full py-4 bg-white text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors shadow-xl flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
                >
                  Cancel Now <X size={16} />
                </button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-indigo-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px]"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                <Plus size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Add New Service</h3>
              <p className="text-indigo-200 text-sm mb-6">Manually link a subscription to track.</p>
              <button
                onClick={() => onNavigate('subscriptions')}
                className="w-full py-3 border border-indigo-400/30 rounded-xl font-medium hover:bg-indigo-800 transition-colors"
              >
                Link Service
              </button>
            </div>
          </motion.div>
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
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 overflow-hidden">
      {/* Filters Toolbar */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-800">
        <div className="relative w-full xl:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search service, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="flex gap-3 w-full xl:w-auto">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-100 cursor-pointer shadow-sm"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Paused">Paused</option>
            </select>
            <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={onAdd}
            className={`px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 active:scale-95 transition-all`}
          >
            <Plus size={20} /> Add New
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-6 px-8 py-4 bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <div className="col-span-5 sm:col-span-4 pl-2">Service Details</div>
        <div className="col-span-3 sm:col-span-2">Amount</div>
        <div className="col-span-3 hidden sm:block">Billing Cycle</div>
        <div className="col-span-4 sm:col-span-2">Status</div>
        <div className="col-span-1 text-right"></div>
      </div>

      {/* Table Body */}
      <div className="p-2">
        {filteredSubs.length > 0 ? filteredSubs.map((sub) => (
          <motion.div
            layout
            key={sub.id}
            className="grid grid-cols-12 gap-6 px-6 py-5 items-center hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-2xl transition-colors group relative mx-2"
          >
            <div className="col-span-5 sm:col-span-4 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center text-lg font-bold shadow-md ring-2 ring-white dark:ring-slate-800`}>
                {sub.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{sub.name}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{sub.category}</p>
              </div>
            </div>

            <div className="col-span-3 sm:col-span-2 font-bold text-slate-900 dark:text-white text-lg tabular-nums">
              {formatCurrency(sub.price, userSettings.currency)}
            </div>

            <div className="col-span-3 hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400">
              {sub.cycle}
            </div>

            <div className="col-span-4 sm:col-span-2">
              <StatusBadge status={sub.status} />
            </div>

            <div className="col-span-1 text-right relative">
              <button
                onClick={() => setActiveMenu(activeMenu === sub.id ? null : sub.id)}
                className="p-2.5 hover:bg-white dark:hover:bg-slate-600 hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-slate-500 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                <MoreHorizontal size={20} />
              </button>

              {/* Dropdown Menu */}
              {activeMenu === sub.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)}></div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute right-0 top-12 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 z-20 p-2 overflow-hidden"
                  >
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Edit Details</button>
                    <button
                      onClick={() => { onDelete(sub); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-between"
                    >
                      Remove <Trash2 size={14} />
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )) : (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="opacity-40" />
            </div>
            <p className="font-medium text-lg">No matches found</p>
            <p className="text-sm opacity-60">Try adjusting your filters</p>
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
      .reduce((acc, curr) => acc + (curr.cycle === 'Monthly' ? curr.price : curr.price / 12), 0);

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
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 h-full shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Simulate Your Savings</h2>
            <p className="text-slate-500 dark:text-slate-400">Tap items to see how much you'd save by cancelling them.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSelection(sub.id)}
                className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${selectedSubs.includes(sub.id)
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md"
                    : "bg-white dark:bg-slate-700/20 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md"
                  }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selectedSubs.includes(sub.id)
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-slate-300 dark:border-slate-500 bg-transparent"
                  }`}>
                  {selectedSubs.includes(sub.id) && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center text-lg font-bold shadow-sm mr-5`}>
                  {sub.icon}
                </div>

                <div>
                  <h4 className={`font-bold text-base transition-colors ${selectedSubs.includes(sub.id) ? "text-indigo-900 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>{sub.name}</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatCurrency(sub.price, userSettings.currency)} <span className="text-xs text-slate-400">/ {sub.cycle}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Sticky Card */}
      <div className="xl:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className={`sticky top-28 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-500/40 flex flex-col justify-between overflow-hidden relative min-h-[500px]`}
        >
          {/* Abstract BG */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/30 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold mb-10 backdrop-blur-md border border-white/20 uppercase tracking-wider">
              <Wallet size={14} /> Projected Outcome
            </div>

            <h3 className="text-indigo-100 font-medium mb-2 text-lg">Yearly Savings</h3>
            <div className="text-6xl font-bold mb-12 tracking-tighter drop-shadow-sm">
              {formatCurrency(calculateSavings.yearly, userSettings.currency)}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-base text-white/90 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 uppercase font-bold tracking-wide">Monthly Impact</p>
                  <p className="font-bold text-lg">+{formatCurrency(calculateSavings.monthly, userSettings.currency)} <span className="text-sm font-normal opacity-80">cash flow</span></p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-base text-white/90 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-300">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-200 uppercase font-bold tracking-wide">Invested (7% APY)</p>
                  <p className="font-bold text-lg text-emerald-100">{formatCurrency(calculateSavings.yearly * 1.07, userSettings.currency)} <span className="text-sm font-normal opacity-80">in 1 yr</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <button
              onClick={() => selectedSubs.length > 0 && setShowConfirm(true)}
              disabled={selectedSubs.length === 0}
              className={`w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${selectedSubs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
                }`}
            >
              <Trash2 size={20} />
              Cut Selected ({selectedSubs.length})
            </button>
            <p className="text-xs text-indigo-200/80 text-center mt-5 font-medium">Unroll handles the negotiation & paperwork.</p>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Cancellation">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed font-medium">
            You are about to cancel {selectedSubs.length} subscriptions. This action cannot be undone automatically.
          </p>
        </div>
        <div className="flex gap-4 justify-end">
          <button onClick={() => setShowConfirm(false)} className="px-6 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors">Keep Them</button>
          <button onClick={handleCut} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all">Yes, Cut Them</button>
        </div>
      </Modal>
    </div>
  );
};

const SettingsView = ({ settings, updateSettings }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-10 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><User size={20} /></div>
          Profile Details
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => updateSettings('name', e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <input type="email" value="felix@example.com" disabled className="w-full p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 cursor-not-allowed font-medium" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-10 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Settings size={20} /></div>
          App Preferences
        </h3>
        <div className="space-y-8">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Appearance</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Switch between light and dark mode.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl">
              <button
                onClick={() => updateSettings('theme', 'light')}
                className={`p-2.5 rounded-lg transition-all ${settings.theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
              >
                <Sun size={20} />
              </button>
              <button
                onClick={() => updateSettings('theme', 'dark')}
                className={`p-2.5 rounded-lg transition-all ${settings.theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
              >
                <Moon size={20} />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Primary Currency</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Used for all calculations and displays.</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl">
              {['INR', 'USD', 'EUR'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => updateSettings('currency', curr)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${settings.currency === curr ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Weekly Digest</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Receive spending summaries via email.</p>
            </div>
            <button
              onClick={() => updateSettings('notifications', !settings.notifications)}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.notifications ? 'left-7' : 'left-1'}`} />
            </button>
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
      // Default to INR and Light Mode if no save found
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
    if (!newSub.name || !newSub.price) return;
    const sub = {
      id: Date.now(),
      ...newSub,
      price: parseFloat(newSub.price),
      nextBill: new Date().toISOString(),
      status: 'Active',
      icon: newSub.name[0].toUpperCase(),
      color: 'from-indigo-500 to-indigo-600'
    };
    setSubscriptions(prev => [sub, ...prev]);
    setModalOpen(false);
    setNewSub({ name: '', price: '', category: 'Entertainment', cycle: 'Monthly' });
    addToast("New service linked successfully");
  };

  const handleDeleteSubscription = (sub) => {
    setSubscriptions(prev => prev.filter(s => s.id !== sub.id));
    addToast(`Unlinked ${sub.name}`);
  };

  const handleBatchDelete = (ids) => {
    setSubscriptions(prev => prev.filter(s => !ids.includes(s.id)));
    addToast(`Cancelled ${ids.length} subscriptions`);
  };

  const updateSettings = (key, value) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'currency') addToast(`Currency changed to ${value}`);
    if (key === 'theme') addToast(`${value === 'light' ? 'Light' : 'Dark'} mode activated`);
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView subscriptions={subscriptions} userSettings={userSettings} onNavigate={setActiveTab} onCancelSub={handleDeleteSubscription} />;
      case 'subscriptions': return <SubscriptionsView subscriptions={subscriptions} userSettings={userSettings} onAdd={() => setModalOpen(true)} onDelete={handleDeleteSubscription} />;
      case 'calculator': return <CalculatorView subscriptions={subscriptions} userSettings={userSettings} onDeleteMultiple={handleBatchDelete} />;
      case 'settings': return <SettingsView settings={userSettings} updateSettings={updateSettings} />;
      default: return <DashboardView subscriptions={subscriptions} userSettings={userSettings} />;
    }
  };

  return (
    <div className={`${userSettings.theme} min-h-screen font-sans`}>
      {/* The 'dark' class on the wrapper will trigger Tailwind's dark mode styles if properly configured, 
            or we use conditional rendering for classes. Since this environment assumes standard Tailwind,
            we add the class 'dark' to a wrapper div if theme is dark. 
        */}
      <div className={`min-h-screen bg-[#F3F4F6] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 flex transition-colors duration-300`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 ml-20 lg:ml-72 p-6 lg:p-12 max-w-[1920px] transition-all duration-300">
          <Header title={activeTab === 'calculator' ? 'Savings Simulator' : activeTab === 'subscriptions' ? 'My Wallet' : activeTab === 'settings' ? 'Settings' : 'Dashboard'} userSettings={userSettings} />

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

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Link New Service">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Service Name</label>
              <input
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 transition-all"
                placeholder="e.g., Netflix"
                value={newSub.name}
                onChange={e => setNewSub({ ...newSub, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    className="w-full pl-8 p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-500 outline-none font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    placeholder="0.00"
                    value={newSub.price}
                    onChange={e => setNewSub({ ...newSub, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cycle</label>
                <select
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 font-medium cursor-pointer text-slate-900 dark:text-white"
                  value={newSub.cycle}
                  onChange={e => setNewSub({ ...newSub, cycle: e.target.value })}
                >
                  <option>Monthly</option>
                  <option>Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 font-medium cursor-pointer text-slate-900 dark:text-white"
                value={newSub.category}
                onChange={e => setNewSub({ ...newSub, category: e.target.value })}
              >
                <option>Entertainment</option>
                <option>Software</option>
                <option>Utilities</option>
                <option>Shopping</option>
              </select>
            </div>
            <button
              onClick={handleAddSubscription}
              className={`w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all mt-4`}
            >
              Link Subscription
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default App;