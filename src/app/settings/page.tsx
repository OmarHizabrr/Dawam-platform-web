'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
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
    UserCircle2,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    ShieldCheck,
    Cpu,
    Fingerprint,
    AppWindow,
    Box,
    Cloud,
    MousePointer2,
    MonitorSmartphone,
    Zap,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('account');

    // Security States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Appearance States
    const [primaryColor, setPrimaryColor] = useState('#10b981'); // Default emerald
    const [isGlassEnabled, setIsGlassEnabled] = useState(true);

    // Data States
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setDisplayName(parsedUser.displayName || '');
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
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

            setMessage({ text: 'تم تحديث بيانات ملفك الشخصي بنجاح بمستوى توافق عالٍ.', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: 'حدث خطأ تقني أثناء المزامنة، يرجى إعادة المحاولة.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;
    if (!user) return null;

    const navItems = [
        { id: 'account', icon: User, label: 'الهوية الرقمية', desc: 'إدارة أصول الحساب والبيانات' },
        { id: 'security', icon: Shield, label: 'بروتوكول الأمان', desc: 'تشفير الوصول والخصوصية' },
        { id: 'appearance', icon: Palette, label: 'المظهر البصري', desc: 'تخصيص الواجهات والسمات' },
        { id: 'notifications', icon: Bell, label: 'مركز التنبيهات', desc: 'تفضيلات البث المباشر' },
        { id: 'language', icon: Languages, label: 'اللغة والتعريب', desc: 'إدارة الواجهات المتوافقة' },
        { id: 'data', icon: Database, label: 'إدارة الأصول', desc: 'الأرشفة والنسخ السحابي' },
    ];

    return (
        <DashboardLayout>
            <PageHeader
                title="مركز تفضيلات النظام"
                subtitle="إعدادات متقدمة لتخصيص التجربة التشغيلية، بروتوكولات الأمان، والهوية المؤسسية."
                icon={SettingsIcon}
                breadcrumb="الإعدادات"
            />

            <div className="flex flex-col xl:flex-row gap-12 max-w-7xl mx-auto pb-20">
                {/* Advanced Settings Navigation */}
                <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="xl:w-85 shrink-0 space-y-4 no-print"
                >
                    <div className="px-5 py-3 border-b border-white/5 mb-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">تصنيفات الضبط</span>
                    </div>

                    <div className="space-y-3">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] transition-all duration-500 relative group border text-right",
                                    activeTab === item.id
                                        ? "bg-primary text-white border-primary/20 shadow-2xl shadow-primary/30 scale-[1.03] z-10"
                                        : "bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-white border-white/5"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
                                    activeTab === item.id
                                        ? "bg-white/20 shadow-inner"
                                        : "bg-slate-950 border border-white/5 group-hover:scale-110 group-hover:rotate-3"
                                )}>
                                    <item.icon className={cn("w-6 h-6", activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-primary")} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-[15px] font-black tracking-tighter">{item.label}</div>
                                    <div className={cn(
                                        "text-[10px] font-black uppercase tracking-widest truncate mt-1 opacity-60",
                                        activeTab === item.id ? "text-white/80" : "text-slate-600"
                                    )}>{item.desc}</div>
                                </div>
                                {activeTab === item.id && (
                                    <ChevronLeft className="w-4 h-4 text-white/40" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="pt-10 px-4">
                        <AppCard padding="none" className="p-6 border-dashed border-2 border-white/5 bg-transparent group/help cursor-pointer hover:border-primary/20 transition-all rounded-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-slate-700 group-hover/help:text-primary transition-colors" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest block">مركز الدعم</span>
                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter">Documentation v2.4.0</span>
                                </div>
                            </div>
                        </AppCard>
                    </div>
                </motion.aside>

                {/* Content Viewport Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'account' && (
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <AppCard padding="none" className="relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-white/5 surface-deep rounded-[3rem]">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                                    <div className="p-10 md:p-14 relative z-10 space-y-12">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="w-18 h-18 rounded-[2.2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                                    <Fingerprint className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <h2 className="text-3xl font-black text-white tracking-tighter">خصائص الهوية الرقمية</h2>
                                                    <p className="text-meta !text-[11px] uppercase tracking-[0.2em]">إدارة التوافق البنيوي لبيانات المسؤول</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-950 border border-white/5">
                                                <Cloud className="w-5 h-5 text-blue-500" />
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">مزامنة سحابية نشطة</span>
                                            </div>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-4 group">
                                                <label className="text-meta px-1 flex items-center gap-3">
                                                    <User className="w-4 h-4 text-primary" /> مسمى العرض الرسمي
                                                </label>
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="الاسم الإداري المعتمد..."
                                                    required
                                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white placeholder:text-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner"
                                                />
                                                <div className="flex gap-2 px-1">
                                                    <Info className="w-3.5 h-3.5 text-slate-700 mt-0.5" />
                                                    <p className="text-[10px] font-bold text-slate-700 leading-relaxed uppercase tracking-tighter">يتم استخدام هذا المسمى في كافة التواقيع الرقمية والتقارير المالية الصادرة.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 opacity-70">
                                                <label className="text-meta px-1 flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-slate-600" /> نقطة المراسلة (ثابتة)
                                                </label>
                                                <div className="w-full h-11 bg-slate-900 border border-white/5 rounded-xl px-4 text-[14px] font-black text-slate-500 flex items-center gap-3 shadow-inner">
                                                    <span className="flex-1 truncate">{user.email}</span>
                                                    <Lock className="w-3.5 h-3.5 text-slate-800" />
                                                </div>
                                                <div className="flex gap-2 px-1">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
                                                    <p className="text-[10px] font-bold text-slate-800 leading-relaxed uppercase tracking-tighter font-mono">ENCRYPTED_ENDPOINT_PROTO</p>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 pt-8">
                                                <AnimatePresence mode="wait">
                                                    {message.text && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            className={cn(
                                                                "p-6 rounded-[2rem] mb-10 flex items-center gap-5 border shadow-2xl backdrop-blur-3xl",
                                                                message.type === 'success'
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                                                message.type === 'success' ? "bg-emerald-500/20" : "bg-rose-500/20"
                                                            )}>
                                                                {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 animate-bounce" /> : <AlertCircle className="w-6 h-6" />}
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[15px] font-black tracking-tight block">{message.text}</span>
                                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">تحديث الحالة: تم تأكيد المزامنة مع Firestore</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="h-11 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-[13px] transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 uppercase tracking-[0.2em] group"
                                                >
                                                    {loading ? (
                                                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>تحديث بيانات الهوية</span>
                                                            <Save className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </AppCard>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <AppCard className="p-10 space-y-8 group hover:translate-y-[-10px] transition-all duration-700 cursor-pointer border-white/5 surface-deep">
                                        <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all duration-500 group-hover:rotate-12 shadow-inner">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-[20px] font-black text-white tracking-tighter">المصادقة الثنائية (2FA)</h3>
                                            <p className="text-meta !text-[11px] leading-relaxed">رفع مستوى حماية الحساب عبر بروتوكول التحقق المزدوج المتقدم.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10">Coming Soon</span>
                                            <Zap className="w-4 h-4 text-primary animate-pulse" />
                                        </div>
                                    </AppCard>

                                    <AppCard className="p-8 space-y-8 group hover:translate-y-[-10px] transition-all duration-700 border-white/5 surface-deep">
                                        <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-amber-500 transition-all duration-500 group-hover:scale-110 shadow-inner">
                                            <AppWindow className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-[20px] font-black text-white tracking-tighter">سجل الجلسات التشغيلية</h3>
                                            <p className="text-meta !text-[11px] leading-relaxed">عرض وتحليل كافة محاولات الوصول والأجهزة المرتبطة حالياً.</p>
                                        </div>
                                        <button className="text-[11px] font-black text-amber-500 hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 group/link transition-colors">
                                            تحليل الجلسات <MousePointer2 className="w-4 h-4 group-hover/link:translate-x-[-2px] group-hover/link:translate-y-[-2px] transition-transform" />
                                        </button>
                                    </AppCard>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <AppCard padding="none" className="relative overflow-hidden shadow-2xl border-white/5 surface-deep rounded-[3rem]">
                                    <div className="p-10 md:p-14 space-y-12">
                                        <div className="flex items-center gap-6 pb-10 border-b border-white/5">
                                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                                                <Lock className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-black text-white tracking-tighter">تعديل بروتوكول الوصول</h2>
                                                <p className="text-meta !text-[10px] uppercase tracking-widest">تحديث مفاتيح التشفير وكلمات المرور</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-meta px-1 block font-black">كلمة المرور الحالية</label>
                                                <div className="relative group">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 pr-12 text-white font-black placeholder:text-slate-800 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-inner"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="hidden md:block" />

                                            <div className="space-y-4">
                                                <label className="text-meta px-1 block font-black">كلمة المرور الجديدة</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white font-black placeholder:text-slate-800 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-meta px-1 block font-black">تأكيد الكلمة الجديدة</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full h-12 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-white font-black placeholder:text-slate-800 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <button className="h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-[12px] transition-all shadow-xl shadow-rose-500/20 active:scale-95 uppercase tracking-widest">
                                            تحديث بروتوكول الأمان
                                        </button>
                                    </div>
                                </AppCard>
                            </motion.div>
                        )}

                        {activeTab === 'appearance' && (
                            <motion.div
                                key="appearance"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <AppCard padding="none" className="relative overflow-hidden shadow-2xl border-white/5 surface-deep rounded-[3rem]">
                                    <div className="p-10 md:p-14 space-y-12">
                                        <div className="flex items-center gap-6 pb-10 border-b border-white/5">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                                <Palette className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-black text-white tracking-tighter">تخصيص الهوية البصرية</h2>
                                                <p className="text-meta !text-[10px] uppercase tracking-widest">إدارة الألوان، الشفافية، والجماليات التشغيلية</p>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div className="space-y-6">
                                                <label className="text-meta px-1 block font-black uppercase tracking-[0.2em] opacity-40">اللون الأساسي للنظام</label>
                                                <div className="flex flex-wrap gap-6">
                                                    {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setPrimaryColor(color)}
                                                            className={cn(
                                                                "w-14 h-14 rounded-2xl border-4 transition-all duration-500 shadow-2xl",
                                                                primaryColor === color ? "border-white scale-110 shadow-primary/40" : "border-white/5 opacity-40 hover:opacity-100"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-white/5" />

                                            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-slate-950 border border-white/5 group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all">
                                                        <Box className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[15px] font-black text-white">تأثير الزجاج المتقدم (Glassmorphism)</div>
                                                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">تفعيل الطبقات الشفافة والتمويه البصري العميق</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setIsGlassEnabled(!isGlassEnabled)}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative border border-white/10",
                                                        isGlassEnabled ? "bg-primary" : "bg-slate-900"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-xl",
                                                        isGlassEnabled ? "left-1" : "left-7"
                                                    )} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </AppCard>
                            </motion.div>
                        )}

                        {activeTab === 'data' && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                <AppCard padding="none" className="relative overflow-hidden shadow-2xl border-white/5 surface-deep rounded-[3rem]">
                                    <div className="p-10 md:p-14 space-y-12">
                                        <div className="flex items-center gap-6 pb-10 border-b border-white/5">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                                <Database className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-2xl font-black text-white tracking-tighter">إدارة الأصول والنسخ الاحتياطي</h2>
                                                <p className="text-meta !text-[10px] uppercase tracking-widest">تأمين البيانات وتصدير السجلات المؤسسية</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <AppCard className="p-10 space-y-8 surface-deep group hover:border-blue-500/30 transition-all cursor-pointer">
                                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                    <Cloud className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-black text-white">تصدير قاعدة البيانات</h3>
                                                    <p className="text-meta !text-[11px] leading-relaxed">تحميل كافة البيانات (الموظفين، الحضور، الرواتب) كملف Excel موحد.</p>
                                                </div>
                                                <button className="h-10 px-6 rounded-xl bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                                    بدء عملية التصدير
                                                </button>
                                            </AppCard>

                                            <AppCard className="p-10 space-y-8 surface-deep group hover:border-rose-500/30 transition-all cursor-pointer">
                                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                                    <Zap className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-xl font-black text-white">تطهير الذاكرة المؤقتة</h3>
                                                    <p className="text-meta !text-[11px] leading-relaxed">إعادة ضبط تفضيلات المتصفح المحلية ومسح سجلات الجلسة.</p>
                                                </div>
                                                <button className="h-10 px-6 rounded-xl bg-slate-900 border border-white/5 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                                                    تصفية الذاكرة
                                                </button>
                                            </AppCard>
                                        </div>
                                    </div>
                                </AppCard>
                            </motion.div>
                        )}

                        {(activeTab === 'notifications' || activeTab === 'language') && (
                            <motion.div
                                key="coming-soon"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-[600px] flex flex-col items-center justify-center text-center space-y-10 opacity-30 border-2 border-dashed border-white/5 rounded-[3rem] surface-deep"
                            >
                                <div className="w-40 h-40 rounded-[4rem] bg-slate-950 flex items-center justify-center border border-white/5 relative shadow-2xl">
                                    <MonitorSmartphone className="w-20 h-20 text-slate-700" />
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 5, repeat: Infinity }}
                                        className="absolute inset-0 bg-primary/20 rounded-full blur-[60px]"
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-[1.2rem] bg-primary/20 border border-primary/20 flex items-center justify-center text-primary backdrop-blur-2xl shadow-2xl">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-white tracking-tighter">توسعة النظام قيد المعالجة</h2>
                                    <p className="text-meta !text-[12px] max-w-[450px] mx-auto leading-relaxed uppercase tracking-[0.3em]">نقوم حالياً ببرمجة واجهة التحكم المتقدمة لهذا القسم لضمان استقرار البروتوكولات.</p>
                                </div>
                                <div className="px-8 py-3 rounded-full bg-slate-950 border border-white/10 text-[11px] font-black text-slate-500 uppercase tracking-widest shadow-inner">
                                    Target Distribution: Alpha Release v3.0
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
