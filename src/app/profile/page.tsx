'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Link,
    Shield,
    UserCircle2,
    ExternalLink,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!mounted || !user) {
        return <div className="bg-[#0f172a] min-h-screen" />;
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-black mb-1 bg-gradient-to-l from-white to-white/60 bg-clip-text text-transparent">
                        الملف الشخصي
                    </h1>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        إدارة بياناتك الشخصية وإعدادات حسابك الأساسية
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    </p>
                </motion.header>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar Section */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary/20 border border-white/10 group-hover:scale-105 transition-transform">
                                {user.displayName?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-primary shadow-xl">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 space-y-6 w-full text-right">
                            <div className="border-b border-white/5 pb-4">
                                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors">{user.displayName}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">مسؤول النظام المعتمد</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                        البريد الإلكتروني <Mail className="w-3 h-3" />
                                    </label>
                                    <div className="bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 text-sm font-medium text-slate-300 flex items-center gap-2 justify-end">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                        معرف المستخدم <Shield className="w-3 h-3" />
                                    </label>
                                    <div className="bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 text-xs font-mono text-slate-500 flex items-center gap-2 justify-end">
                                        {user.uid.slice(0, 16)}...
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-end">
                                <button className="flex items-center gap-2 px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-black text-xs transition-all border border-primary/20">
                                    <UserCircle2 className="w-3.5 h-3.5" />
                                    <span>تعديل الملف</span>
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-black text-xs transition-all border border-white/10">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>سجل النشاط</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
