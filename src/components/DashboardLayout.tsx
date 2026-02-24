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
    Search
} from 'lucide-react';
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

    useEffect(() => {
        setMounted(true);
        try {
            const storedUser = localStorage.getItem('userData');
            console.log("DashboardLayout: storedUser from localStorage:", storedUser ? "Found" : "Not Found");

            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && typeof parsed === 'object') {
                    setUser(parsed);
                } else {
                    console.warn("DashboardLayout: userData is invalid object, redirecting to login");
                    window.location.href = '/login';
                }
            } else {
                console.warn("DashboardLayout: No userData found, redirecting to login");
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("DashboardLayout: Error during initialization:", error);
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = async () => {
        await AuthService.Api.logout();
        window.location.href = '/login';
    };

    // Show empty state while mounting or if no user is found
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

    const sidebarVariants = {
        open: { width: 260, transition: { type: 'spring' as any, damping: 20, stiffness: 100 } },
        closed: { width: 80, transition: { type: 'spring' as any, damping: 20, stiffness: 100 } }
    };

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 antialiased selection:bg-primary/30">
            {/* Sidebar Desktop */}
            <motion.aside
                initial="open"
                animate={isSidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                className="hidden lg:flex flex-col bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 fixed right-0 h-screen z-50 p-4 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="flex items-center gap-2.5 mb-8 px-1">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 animate-pulse-slow">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <h2 className="text-xl font-black bg-gradient-to-l from-white to-white/60 bg-clip-text text-transparent">دوام</h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">PLATFORM</span>
                        </motion.div>
                    )}
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar pr-0.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all duration-300 relative group cursor-pointer",
                                        isActive
                                            ? "bg-white/[0.05] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                                            : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7.5 h-7.5 rounded-md flex items-center justify-center transition-all duration-500",
                                        isActive ? "bg-primary/20 text-primary shadow-lg shadow-primary/10" : "text-slate-500 group-hover:text-primary/70"
                                    )}>
                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                    </div>

                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[13px] font-bold tracking-tight"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute right-0 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all w-full text-right group font-bold text-[12px]"
                    >
                        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors">
                            <LogOut className="w-4.5 h-4.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                        </div>
                        {isSidebarOpen && <span>تسجيل الخروج</span>}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full h-10 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-500 hover:text-white transition-all items-center justify-center lg:flex hidden border border-white/5"
                    >
                        {isSidebarOpen ? (
                            <X className="w-4.5 h-4.5" />
                        ) : (
                            <Menu className="w-4.5 h-4.5" />
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Nav */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-2xl border-b border-white/5 z-[60] px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-xl text-white">دوام</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Main Content */}
            <main className={cn(
                "flex-1 flex flex-col transition-all duration-500 ease-in-out",
                isSidebarOpen ? "lg:pr-[260px]" : "lg:pr-[80px]",
                "pt-20 lg:pt-0 min-h-screen"
            )}>
                {/* TopBar Desktop */}
                <header className="hidden lg:flex h-14 px-8 items-center justify-between sticky top-0 glass-nav z-40">
                    <div className="flex items-center bg-white/5 border border-white/5 rounded-lg px-3.5 py-1.5 w-[360px] group focus-within:border-primary/40 focus-within:bg-white/[0.08] transition-all duration-300 shadow-inner">
                        <Search className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="ابحث عن أي شيء..."
                            className="bg-transparent border-none outline-none px-2.5 text-[13px] text-white w-full placeholder:text-slate-600 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 hover:bg-white/10 group">
                            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                        </button>

                        <div className="flex items-center gap-3 pl-1 border-r border-white/5 pr-4">
                            <div className="text-left flex flex-col items-start translate-y-0.5">
                                <div className="text-[13px] font-black text-white leading-none mb-0.5">{user.displayName}</div>
                                <div className="text-[10px] text-primary uppercase tracking-[0.1em] font-black">ADMINISTRATOR</div>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-blue-400 p-0.5 group cursor-pointer shadow-lg shadow-primary/10 transition-transform active:scale-90">
                                <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center font-black text-white text-[11px]">
                                    {user.displayName?.charAt(0) || 'U'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 min-h-full">
                    <div className="max-w-screen-2xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 right-0 w-[280px] bg-slate-950/90 backdrop-blur-2xl z-[80] lg:hidden p-6 flex flex-col border-l border-white/5"
                        >
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-black text-xl text-white">دوام</span>
                            </div>

                            <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                                {navItems.map((item) => (
                                    <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className={cn(
                                            "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all",
                                            pathname === item.path
                                                ? "bg-primary text-white font-black shadow-lg shadow-primary/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        )}>
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-sm uppercase tracking-tight">{item.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </nav>

                            <button
                                onClick={handleLogout}
                                className="mt-6 flex items-center gap-4 px-4 py-3.5 rounded-xl text-rose-500 bg-rose-500/10 font-bold border border-rose-500/20 shadow-lg shadow-rose-500/5 group text-sm"
                            >
                                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>تسجيل الخروج</span>
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChevronLeft(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
}

function ChevronRight(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
}
