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
    ShieldCheck,
    Contact2,
    KeyRound,
    Lock,
    Settings,
    Camera,
    Sparkles,
    ShieldAlert,
    Cpu,
    QrCode,
    IdCard,
    Zap,
    History,
    Fingerprint,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    if (!mounted) return null;
    if (!user) return null;

    return (
        <DashboardLayout>
            <PageHeader
                title="بطاقة الهوية الرقمية"
                subtitle="إدارة بيانات الاعتماد، تفضيلات الوصول، وسجل النشاط التقني للمسؤول."
                icon={IdCard}
                breadcrumb="الملف الشخصي"
            />

            <div className="max-w-6xl mx-auto space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Perspective Identity Card */}
                    <div className="lg:col-span-1 space-y-8">
                        <AppCard padding="none" className="overflow-hidden border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] group relative surface-deep">
                            <div className="h-40 bg-gradient-to-br from-primary via-primary/80 to-blue-600 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                                    <div className="grid grid-cols-6 gap-3 rotate-12 -translate-y-4">
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <div key={i} className="w-full h-10 bg-white/20 rounded-full blur-[15px] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-5 left-5 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Verified Admin</span>
                                </div>
                            </div>

                            <div className="p-8 pt-0 -mt-14 text-center relative z-10">
                                <div className="relative inline-block mb-8">
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-slate-950 p-2 shadow-2xl relative">
                                        <div className="w-full h-full rounded-[3rem] bg-gradient-to-tr from-primary via-blue-500 to-indigo-400 p-0.5 group-hover:rotate-6 transition-transform duration-700">
                                            <div className="w-full h-full bg-slate-950 rounded-[2.8rem] flex items-center justify-center text-5xl font-black text-white shadow-inner">
                                                {user.displayName?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 w-11 h-11 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-primary shadow-2xl hover:bg-primary hover:text-white transition-all group/btn active:scale-90">
                                        <Camera className="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-white tracking-tighter leading-none group-hover:text-primary transition-colors">{user.displayName}</h3>
                                    <div className="flex items-center justify-center gap-2.5">
                                        <Fingerprint className="w-4 h-4 text-slate-700" />
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Super Administrator</span>
                                    </div>
                                </div>

                                <div className="mt-12 grid grid-cols-2 gap-5">
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 group/stat hover:bg-white/[0.05] transition-colors shadow-inner">
                                        <div className="text-[24px] font-black text-white tracking-tighter tabular-nums group-hover/stat:text-primary transition-colors">128</div>
                                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">نشاط مسجل</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 group/stat hover:bg-white/[0.05] transition-colors shadow-inner">
                                        <div className="text-[24px] font-black text-white tracking-tighter tabular-nums group-hover/stat:text-blue-500 transition-colors">04</div>
                                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">أعوام خدمة</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-950/60 border-t border-white/5 flex items-center justify-between group-hover:bg-primary/[0.02] transition-colors">
                                <QrCode className="w-10 h-10 text-slate-800 opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="text-left font-mono text-[10px] text-slate-700 uppercase tracking-tighter leading-relaxed">
                                    Authority-Grant:<br />
                                    <span className="text-slate-500 font-black">{user.uid.slice(0, 14)}...</span>
                                </div>
                            </div>
                        </AppCard>

                        <div className="flex flex-col gap-4">
                            <button className="h-11 w-full rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 px-6 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[12px] uppercase tracking-widest group shadow-xl">
                                <KeyRound className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform text-primary" />
                                <span>تغيير مفاتيح الدخول</span>
                            </button>
                            <button className="h-11 w-full rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-3 px-6 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[12px] uppercase tracking-widest group shadow-xl">
                                <ShieldAlert className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                <span>إيقاف الصلاحية مؤقتاً</span>
                            </button>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="lg:col-span-2 space-y-8">
                        <AppCard className="border-white/5 shadow-2xl overflow-hidden relative surface-deep">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />

                            <div className="relative space-y-12 p-4 md:p-10">
                                <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Contact2 className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[20px] font-black text-white tracking-tighter uppercase">توصيف الهوية الرقمية</h4>
                                        <p className="text-meta !text-[11px]">البيانات التعريفية الرسمية المرتبطة ببروتوكول الوصول الخاص بك.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3 relative group">
                                        <label className="text-meta px-1 flex items-center gap-2">الاسم الكامل للمسؤول <Sparkles className="w-3 h-3 opacity-40" /></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                                <User className="w-4.5 h-4.5 text-slate-600 transition-colors group-focus-within:text-primary" />
                                            </div>
                                            <div className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 flex items-center text-[14px] font-black text-white shadow-inner">
                                                {user.displayName}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative group">
                                        <label className="text-meta px-1 flex items-center gap-2">عنوان المراسلة التقنية <Lock className="w-3 h-3 opacity-40 ml-auto" /></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                                <Mail className="w-4.5 h-4.5 text-slate-600" />
                                            </div>
                                            <div className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-slate-500 shadow-inner flex items-center gap-3">
                                                {user.email}
                                                <Shield className="w-3.5 h-3.5 opacity-20 ml-auto" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative group">
                                        <label className="text-meta px-1">معرف الربط البنيوي (UID)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                                <Smartphone className="w-4.5 h-4.5 text-slate-600" />
                                            </div>
                                            <div className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[12px] font-mono font-black text-slate-700 lowercase truncate hover:text-slate-500 transition-colors shadow-inner flex items-center">
                                                {user.uid}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative group">
                                        <label className="text-meta px-1">جلسة العمل الأخيرة</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                                <History className="w-4.5 h-4.5 text-slate-600" />
                                            </div>
                                            <div className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[12px] font-black text-slate-500 uppercase tracking-widest shadow-inner flex items-center">
                                                Feb 25, 2026 • 11:20 AM
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex items-center justify-between border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">التغييرات تتطلب صلاحيات عليا</span>
                                    </div>
                                    <button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[13px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 active:scale-95 group uppercase tracking-[0.2em]">
                                        حفظ التعديلات <Sparkles className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </AppCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AppCard padding="none" className="group overflow-hidden border-white/5 shadow-2xl surface-deep hover:translate-y-[-8px] transition-all duration-700 relative">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-10 space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors shadow-inner group-hover:scale-110 duration-500">
                                        <Cpu className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[18px] font-black text-white tracking-tight">إدارة بروتوكول الأمان</h5>
                                        <p className="text-meta !text-[11px] leading-relaxed">تهيئة جدران الحماية، أذونات الوصول، والمصادقة متعددة المستويات.</p>
                                    </div>
                                    <button className="text-[11px] font-black text-primary hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 group/link transition-colors">
                                        إدارة التشفير <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-[-2px] group-hover/link:translate-y-[-2px] transition-transform" />
                                    </button>
                                </div>
                            </AppCard>

                            <AppCard padding="none" className="group overflow-hidden border-white/5 shadow-2xl surface-deep hover:translate-y-[-8px] transition-all duration-700 relative">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-10 space-y-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-colors shadow-inner group-hover:scale-110 duration-500">
                                        <Settings className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[18px] font-black text-white tracking-tight">التفضيلات السلوكية</h5>
                                        <p className="text-meta !text-[11px] leading-relaxed">تخصيص الخوارزميات، السمات البصرية، ونظام الإشعارات المخصص.</p>
                                    </div>
                                    <button className="text-[11px] font-black text-amber-500 hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 group/link transition-colors">
                                        تخصيص التجربة <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-[-2px] group-hover/link:translate-y-[-2px] transition-transform" />
                                    </button>
                                </div>
                            </AppCard>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
