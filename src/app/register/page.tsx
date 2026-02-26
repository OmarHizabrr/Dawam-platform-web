'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/firebase/authService';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    ShieldCheck,
    ArrowRight,
    UserPlus,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    ShieldPlus,
    Infinity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-[#020617]" />;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة. يرجى التأكد من كتابتها بشكل صحيح.');
            return;
        }

        setLoading(true);

        try {
            await AuthService.Api.register({ name, email, password });
            window.location.href = '/profile';
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('هذا البريد الإلكتروني مستخدم بالفعل في نظامنا.');
            } else if (err.code === 'auth/weak-password') {
                setError('كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف على الأقل.');
            } else {
                setError('فشل إنشاء الحساب. تأكد من صحة البيانات المدخلة.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden selection:bg-violet-500/30">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Logo & Intro Section */}
                <div className="text-center mb-10 space-y-4">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-blue-500 p-0.5 shadow-2xl shadow-violet-500/20"
                    >
                        <div className="w-full h-full bg-slate-900 rounded-[2.3rem] flex items-center justify-center">
                            <ShieldPlus className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Dawam<span className="text-violet-500">.</span>
                        </h1>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] translate-x-1">
                            Secure Onboarding
                        </p>
                    </div>
                </div>

                {/* Registration Card */}
                <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative group">
                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight">إنشاء حساب جديد</h2>
                            <p className="text-[13px] font-bold text-slate-500">انضم إلى مجتمع دوام واستمتع بإدارة ذكية لمؤسستك.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-[13px] font-black"
                                    >
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">الاسم الكامل</label>
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="الاسم الكامل كما يظهر في التقارير"
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            required
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">كلمة المرور</label>
                                        <div className="relative group/field">
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-11 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">تأكيد المرور</label>
                                        <div className="relative group/field">
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <ShieldCheck className="w-4 h-4 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-11 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[15px] transition-all shadow-2xl shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>إنشاء الحساب الجديد</span>
                                            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-6 pb-12">
                    <p className="text-[13px] font-bold text-slate-500">
                        هل لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="text-violet-500 hover:text-violet-400 font-black transition-colors">
                            تسجيل الدخول
                        </Link>
                    </p>

                    <div className="flex items-center justify-center gap-6 opacity-30 grayscale">
                        <div className="flex items-center gap-2">
                            <Infinity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Unlimited possibilities</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Atmospheric Micro-elements */}
            <div className="absolute top-10 right-10 text-white/5 rotate-12 pointer-events-none">
                <Sparkles className="w-32 h-32" />
            </div>
        </div>
    );
}
