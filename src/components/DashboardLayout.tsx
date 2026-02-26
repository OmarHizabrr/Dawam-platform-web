'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthService } from '@/lib/firebase/authService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CircleDollarSign,
    BarChart3,
    ClipboardList,
    ShieldCheck,
    FileText,
    Hourglass,
    TrendingDown,
    Coins,
    UserCircle,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search as SearchIcon,
    Fingerprint,
    Sparkles,
    MousePointer2,
    Command
} from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Global Search States
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem('userData');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && typeof parsed === 'object') {
                    setUser(parsed);
                    fetchEmployees(parsed.uid);
                } else {
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("DashboardLayout: Error during initialization:", error);
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchEmployees = (uid: string) => {
        const empCol = collection(db, "employees", uid, "employees");
        onSnapshot(query(empCol), (snap) => {
            setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const q = searchQuery.toLowerCase();
        const results: any[] = [];

        // 1. Search Pages
        navItems.forEach(item => {
            if (item.name.toLowerCase().includes(q)) {
                results.push({ type: 'page', label: item.name, path: item.path, icon: item.icon });
            }
        });

        // 2. Search Employees
        employees.forEach(emp => {
            if (emp.name?.toLowerCase().includes(q) || emp.jobId?.toLowerCase().includes(q)) {
                results.push({
                    type: 'employee',
                    label: emp.name,
                    subLabel: emp.jobId || 'ID الوظيفي غير متوفر',
                    path: `/employees`,
                    icon: Users
                });
            }
        });

        // 3. Quick Actions
        const actions = [
            { label: 'تسجيل موظف جديد', path: '/employees', icon: Fingerprint },
            { label: 'صرف راتب', path: '/salaries', icon: CircleDollarSign },
            { label: 'تحليل الأداء', path: '/stats', icon: BarChart3 }
        ];

        actions.forEach(action => {
            if (action.label.toLowerCase().includes(q)) {
                results.push({ type: 'action', ...action });
            }
        });

        setSearchResults(results.slice(0, 8));
    }, [searchQuery, employees]);

    const handleLogout = async () => {
        await AuthService.Api.logout();
        window.location.href = '/login';
    };

    if (!mounted || !user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const navItems = [
        { name: 'الرئيسية', path: '/stats', icon: LayoutDashboard },
        { name: 'الموظفين', path: '/employees', icon: Users },
        { name: 'الدوام', path: '/attendance', icon: Calendar },
        { name: 'الرواتب', path: '/salaries', icon: CircleDollarSign },
        { name: 'التقارير', path: '/reports', icon: BarChart3 },
        { name: 'باقات الدوام', path: '/attendance-plans', icon: ClipboardList },
        { name: 'المسؤولين', path: '/admins', icon: ShieldCheck },
        { name: 'أنواع الإجازات', path: '/leave-types', icon: FileText },
        { name: 'تخصيص الإجازات', path: '/leave-allocation', icon: Hourglass },
        { name: 'أرصدة الإجازات', path: '/leave-balance', icon: TrendingDown },
        { name: 'العملات', path: '/currencies', icon: Coins },
        { name: 'الملف الشخصي', path: '/profile', icon: UserCircle },
        { name: 'الإعدادات', path: '/settings', icon: Settings },
    ];

    const springTransition: any = {
        type: 'spring',
        damping: 24,
        stiffness: 120,
        mass: 1
    };

    const sidebarVariants = {
        open: { width: 300, x: 0 },
        closed: { width: 96, x: 0 }
    };

    const contentVariants = {
        expanded: { paddingRight: 300 },
        collapsed: { paddingRight: 96 }
    };

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 antialiased selection:bg-primary/30 font-sans">
            {/* Optimized Sidebar Desktop */}
            <motion.aside
                initial={isSidebarOpen ? "open" : "closed"}
                animate={isSidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                transition={springTransition}
                className="hidden lg:flex flex-col bg-slate-950/60 backdrop-blur-3xl border-l border-white/5 fixed right-0 h-screen z-50 p-6 shadow-[30px_0_90px_-20px_rgba(0,0,0,0.9)] overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="w-11 h-11 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 flex-shrink-0 relative group">
                        <div className="absolute inset-0 bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <Sparkles className="w-6 h-6 text-white relative z-10" />
                    </div>
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex flex-col"
                            >
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Dawam<span className="text-primary">.</span></h2>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none translate-x-1">OS System</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-0.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div
                                    className={cn(
                                        "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 relative group cursor-pointer",
                                        isActive
                                            ? "bg-white/[0.04] text-white shadow-inner"
                                            : "text-slate-500 hover:text-white hover:bg-white/[0.02]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500",
                                        isActive ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" : "bg-white/[0.03] text-slate-600 group-hover:text-primary/70 group-hover:bg-white/[0.05]"
                                    )}>
                                        <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {isSidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 5 }}
                                                className="text-[13px] font-black tracking-tight whitespace-nowrap"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute right-0 w-1 h-7 bg-primary rounded-l-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-3.5 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all w-full text-right group font-black text-[12px] surface-deep border border-rose-500/10 shadow-lg shadow-rose-500/5"
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                            <LogOut className="w-4.5 h-4.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                        </div>
                        {isSidebarOpen && <span className="tracking-widest">خروج آمن</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full h-11 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-600 hover:text-white transition-all items-center justify-center lg:flex hidden border border-white/5 group shadow-inner"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5 group-hover:rotate-90 transition-transform" /> : <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content synchronized */}
            <motion.main
                initial={isSidebarOpen ? "expanded" : "collapsed"}
                animate={isSidebarOpen ? "expanded" : "collapsed"}
                variants={contentVariants}
                transition={springTransition}
                className="flex-1 flex flex-col pt-20 lg:pt-0 min-h-screen relative overflow-x-hidden"
            >
                {/* Refined TopBar Desktop */}
                <header className="hidden lg:flex h-20 px-10 items-center justify-between sticky top-0 bg-slate-950/10 backdrop-blur-2xl border-b border-white/5 z-40">
                    <div
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-3 w-[460px] group hover:border-primary/40 hover:bg-slate-950/80 transition-all duration-700 shadow-2xl cursor-pointer"
                    >
                        <SearchIcon className="w-5 h-5 text-slate-700 group-hover:text-primary transition-all group-hover:scale-110" />
                        <div className="flex-1 px-4 text-[13px] text-slate-500 font-bold overflow-hidden truncate">
                            {searchQuery || "بحث شامل في النظام (Cmd + K)"}
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black text-slate-700 uppercase">
                            ⌘ K
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <button className="relative w-11 h-11 rounded-2xl bg-white/[0.02] flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5 hover:bg-white/[0.05] group">
                                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-[3px] border-slate-950 animate-pulse" />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 pl-2 border-r border-white/5 pr-6">
                            <div className="text-left flex flex-col items-start">
                                <span className="text-[14px] font-black text-white leading-tight tracking-tight">{user.displayName}</span>
                                <span className="text-meta">Global Operator</span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-primary to-blue-500 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer group">
                                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-white text-[13px] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">{user.displayName?.charAt(0) || 'U'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 lg:p-10 flex-1 flex flex-col">
                    <div className="page-container flex-1 flex flex-col max-w-[1600px] mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex-1"
                        >
                            {children}
                        </motion.div>
                    </div>
                </div>
            </motion.main>

            {/* Mobile Header Optimization */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 z-[60] px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-2xl text-white italic tracking-tighter">Dawam.</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white active:scale-90 transition-all border border-white/10"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Menu Enhanced */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[70] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 bottom-0 right-0 w-[300px] bg-slate-950 z-[80] lg:hidden p-8 flex flex-col border-l border-white/5"
                        >
                            <div className="flex items-center gap-4 mb-14">
                                <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-black text-2xl text-white italic tracking-tighter">Dawam.</span>
                            </div>

                            <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                                {navItems.map((item) => (
                                    <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className={cn(
                                            "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all",
                                            pathname === item.path
                                                ? "bg-white/[0.05] text-white font-black shadow-lg"
                                                : "text-slate-500 hover:bg-white/5 hover:text-white"
                                        )}>
                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", pathname === item.path ? "bg-primary text-white" : "bg-white/[0.03]")}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[14px] font-black uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </nav>

                            <button
                                onClick={handleLogout}
                                className="mt-8 flex items-center gap-4 px-5 py-5 rounded-2xl text-rose-500 bg-rose-500/10 font-black border border-rose-500/20 shadow-2xl shadow-rose-500/5 group text-[14px]"
                            >
                                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>خروج من الجلسة</span>
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            {/* Global Search Modal - Command Palette */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-start justify-center pt-[15vh] px-6"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-white/5 flex items-center gap-6 bg-white/[0.01]">
                                <SearchIcon className="w-7 h-7 text-primary animate-pulse" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابدأ البحث عن الموظفين، الصفحات، أو الإجراءات السريعة..."
                                    className="flex-1 bg-transparent border-none outline-none text-[20px] font-black text-white placeholder:text-slate-800"
                                />
                                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                    ESC
                                </div>
                            </div>

                            <div className="max-h-[50vh] overflow-y-auto no-scrollbar p-4">
                                {searchResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchResults.map((result, idx) => (
                                            <Link
                                                key={idx}
                                                href={result.path}
                                                onClick={() => setIsSearchOpen(false)}
                                                className="flex items-center gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 text-right"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all">
                                                    <result.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[15px] font-black text-white">{result.label}</div>
                                                    {result.subLabel && (
                                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{result.subLabel}</div>
                                                    )}
                                                </div>
                                                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
                                                    Open
                                                </div>
                                                <MousePointer2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </Link>
                                        ))}
                                    </div>
                                ) : searchQuery ? (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto">
                                            <Command className="w-10 h-10 text-slate-800" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">لم نتمكن من الوصول</h3>
                                            <p className="text-meta !text-[11px] mt-2">جرب البحث بمعايير أخرى للدقة</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 px-6">
                                        <div className="text-meta mb-6 opacity-40 text-right uppercase tracking-[0.2em]">اختصارات مقترحة</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {navItems.slice(0, 4).map((item, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={item.path}
                                                    onClick={() => setIsSearchOpen(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-primary/20 transition-all group text-right"
                                                >
                                                    <item.icon className="w-5 h-5 text-slate-700 group-hover:text-primary" />
                                                    <span className="text-[13px] font-black text-slate-500 group-hover:text-white uppercase tracking-tight">{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-white/10 text-[8px] font-black text-slate-500 uppercase tracking-tighter">⏎</div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Select</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-white/10 text-[8px] font-black text-slate-500 uppercase tracking-tighter">↑↓</div>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Navigate</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em]">
                                    Dawam Logic Index v1.0
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
