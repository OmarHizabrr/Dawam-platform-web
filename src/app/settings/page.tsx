'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    User,
    Mail,
    Save,
    Check,
    AlertCircle,
    Palette,
    Bell,
    Shield,
    Layout,
    Smartphone,
    Languages,
    Database,
    HelpCircle,
    CheckCircle2,
    Info,
    UserCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setDisplayName(parsedUser.displayName || '');
        }
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                displayName: displayName,
                updatedAt: new Date().toISOString()
            });

            const updatedUser = { ...user, displayName: displayName };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setMessage({ text: 'تم تحديث بيانات ملفك الشخصي بنجاح', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: 'حدث خطأ غير متوقع أثناء التحديث، يرجى المحاولة لاحقاً', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted || !user) return <div className="bg-[#0f172a] min-h-screen" />;

    const sidebarItems = [
        { icon: User, label: 'الحساب الشخصي', active: true },
        { icon: Palette, label: 'المظهر والتصميم' },
        { icon: Bell, label: 'الإشعارات' },
        { icon: Shield, label: 'الأمان والخصوصية' },
        { icon: Layout, label: 'تخصيص اللوحة' },
        { icon: Smartphone, label: 'تطبيقات الجوال' },
        { icon: Languages, label: 'اللغة والعرض' },
        { icon: Database, label: 'البيانات والنسخ' },
        { icon: HelpCircle, label: 'الدعم والمساعدة' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
                >
                    <div>
                        <h1 className="text-2xl font-black mb-1 bg-gradient-to-l from-white to-white/60 bg-clip-text text-transparent">
                            إعدادات النظام
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            تخصيص تجربة المستخدم وإدارة تفضيلات حسابك وتطبيقات المؤسسة
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        </p>
                    </div>
                </motion.header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Settings Navigation Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:w-80 space-y-2"
                    >
                        {sidebarItems.map((item, idx) => (
                            <button
                                key={idx}
                                className={cn(
                                    "w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl font-black text-xs transition-all text-right group",
                                    item.active
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "bg-white/[0.02] text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent hover:border-white/5"
                                )}
                            >
                                <item.icon className={cn("w-4.5 h-4.5 transition-transform group-hover:scale-110", item.active ? "text-white" : "text-slate-600 group-hover:text-primary")} />
                                <span>{item.label}</span>
                                {item.active && <motion.div layoutId="activeDot" className="w-1 h-1 rounded-full bg-white mr-auto" />}
                            </button>
                        ))}
                    </motion.aside>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-12">
                        {/* Profile Section */}
                        <motion.section
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary transition-transform border border-primary/20 shadow-inner">
                                        <UserCircle2 className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white">إعدادات الملف الشخصي</h2>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">المعلومات الشخصية التي تظهر للآخرين</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-500 px-1 uppercase tracking-widest flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" /> اسم العرض في التقارير
                                            </label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="أدخل اسمك الكامل ليظهر هنا..."
                                                required
                                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-black focus:border-primary focus:ring-4 ring-primary/10 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-3 opacity-60">
                                            <label className="text-xs font-black text-slate-500 px-1 uppercase tracking-widest flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> عنوان البريد الإلكتروني (ثابت)
                                            </label>
                                            <div className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-500 font-bold flex items-center gap-3 cursor-not-allowed">
                                                <span className="flex-1 text-right">{user.email}</span>
                                                <Shield className="w-4 h-4 text-slate-700" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <AnimatePresence mode="wait">
                                            {message.text && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={cn(
                                                        "p-4 rounded-2xl mb-8 flex items-center gap-3 font-bold text-sm",
                                                        message.type === 'success'
                                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                                                            : "bg-rose-500/10 text-rose-500 border border-rose-500/10"
                                                    )}
                                                >
                                                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                                    {message.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full md:w-max px-8 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-base transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50"
                                        >
                                            {loading ? 'جاري التحديث...' : (
                                                <>
                                                    <span>حفظ التغييرات الجديدة</span>
                                                    <Save className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.section>

                        {/* Organizational Identity Section */}
                        <motion.section
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group/opt"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover/opt:text-primary transition-colors border border-white/5">
                                        <Palette className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white">هوية المؤسسة والشعار</h2>
                                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">ميزة قادمة في التحديث القادم</p>
                                    </div>
                                </div>
                                <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-4 py-2 rounded-full border border-amber-500/20 uppercase tracking-widest hidden md:block">
                                    SOON
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-40 grayscale pointer-events-none">
                                <div className="p-5 bg-slate-900/50 rounded-xl border border-white/5 text-center space-y-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-full mx-auto" />
                                    <div className="h-3 bg-white/5 rounded w-2/3 mx-auto" />
                                    <div className="h-1.5 bg-white/5 rounded w-full" />
                                </div>
                                <div className="p-5 bg-slate-900/50 rounded-xl border border-white/5 text-center space-y-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-full mx-auto" />
                                    <div className="h-3 bg-white/5 rounded w-3/4 mx-auto" />
                                    <div className="h-1.5 bg-white/5 rounded w-full" />
                                </div>
                                <div className="p-5 bg-slate-900/50 rounded-xl border border-white/5 text-center space-y-3">
                                    <div className="w-10 h-10 bg-white/5 rounded-full mx-auto" />
                                    <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
                                    <div className="h-1.5 bg-white/5 rounded w-full" />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center p-4 bg-white/[0.01] border border-white/5 rounded-xl group-hover/opt:bg-white/[0.03] transition-colors">
                                <p className="text-slate-500 font-bold text-[11px] text-center flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5 shrink-0" />
                                    قريباً: تمكين المشرفين من تغيير الشعار، نظام الألوان الموحد، وتخصيص خلفية تسجيل الدخول لتناسب هوية مؤسستك.
                                </p>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
