'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins,
    Plus,
    Pencil,
    Trash2,
    CircleDollarSign,
    Info,
    Check,
    X,
    Hash,
    Type,
    Wallet,
    DollarSign,
    Banknote,
    ArrowRightLeft,
    Compass,
    Zap,
    MousePointer2,
    ChevronLeft,
    ShieldCheck,
    Briefcase,
    Gem
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

export default function CurrenciesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Currency Form fields
    const [currencyName, setCurrencyName] = useState('');
    const [currencyCode, setCurrencyCode] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                const curColRef = collection(db, "currencies", parsedUser.uid, "currencies");
                const q = query(curColRef);

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const curList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setCurrencies(curList);
                });

                return () => unsubscribe();
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const handleSaveCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const data = {
                name: currencyName,
                code: currencyCode,
                symbol: currencySymbol,
                updatedAt: new Date().toISOString()
            };

            if (isEditMode && editingCurrencyId) {
                const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, editingCurrencyId);
                await FirestoreApi.Api.updateData({ docRef: curRef, data });
            } else {
                const curId = FirestoreApi.Api.getNewId("currencies");
                const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, curId);
                await FirestoreApi.Api.setData({ docRef: curRef, data: { ...data, createdAt: new Date().toISOString() } });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving currency:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCurrency = async (curId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه العملة؟ سيؤثر هذا على كشوف الرواتب والتقارير المالية المرتبطة بها.")) return;
        if (!user) return;

        try {
            const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, curId);
            await FirestoreApi.Api.deleteData(curRef);
        } catch (error) {
            console.error("Error deleting currency:", error);
        }
    };

    const openEditModal = (cur: any) => {
        setCurrencyName(cur.name);
        setCurrencyCode(cur.code);
        setCurrencySymbol(cur.symbol);
        setEditingCurrencyId(cur.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingCurrencyId(null);
        setCurrencyName('');
        setCurrencyCode('');
        setCurrencySymbol('');
    };

    if (!mounted) return null;

    const filteredCurrencies = currencies.filter(cur =>
        searchQuery === '' ||
        (cur.name && cur.name.includes(searchQuery)) ||
        (cur.code && cur.code.includes(searchQuery))
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="إدارة الأصول النقدية"
                subtitle="تهيئة العملات المعتمدة، تخصيص رموز الصرف، وإدارة التوافق المالي للتقارير والرواتب."
                icon={Coins}
                breadcrumb="الإعدادات المالية"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-[12px] transition-all shadow-2xl shadow-amber-500/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        <span>تعريف عملة جديدة</span>
                    </button>
                }
            />

            <AppCard padding="none" className="mb-10 border-white/5 shadow-2xl surface-deep no-print overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1">البحث في السجلات المالية</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <Compass className="w-5 h-5 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن عملة، كود ISO، أو رمز الصرف..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-8 py-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner">
                        <div className="text-center space-y-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">العملات المفعلة</span>
                            <span className="text-2xl font-black text-white tabular-nums">{currencies.length}</span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
                <AnimatePresence mode="popLayout">
                    {filteredCurrencies.length === 0 ? (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-amber-500/2 rounded-full blur-[140px] pointer-events-none" />
                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"
                                />
                                <Banknote className="w-14 h-14 text-slate-700 group-hover/empty:text-amber-500 transition-colors" />
                            </div>
                            <div className="text-center space-y-3 relative z-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">عجز في الأصول النقدية</h3>
                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">يرجى تهيئة العملات المطلوبة لبدء محاكاة العمليات المالية وإدارة الرواتب عبر الأنظمة.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-black text-amber-500 hover:text-white hover:bg-amber-500 transition-all uppercase tracking-widest active:scale-95 shadow-xl shadow-amber-500/5"
                            >
                                تعريف عملة فوراً
                            </button>
                        </div>
                    ) : (
                        filteredCurrencies.map((cur, idx) => (
                            <motion.div
                                key={cur.id}
                                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.5, ease: "backOut" }}
                            >
                                <AppCard padding="none" className="group overflow-hidden border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] h-full flex flex-col relative surface-deep hover:translate-y-[-12px] transition-all duration-700">
                                    <div className="absolute -right-6 -top-6 text-[110px] font-black text-white/[0.02] pointer-events-none group-hover:text-amber-500/[0.08] transition-all duration-1000 leading-none group-hover:scale-110 group-hover:rotate-12">
                                        {cur.symbol || '$'}
                                    </div>

                                    <div className="p-8 flex-1 space-y-10 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-18 h-18 rounded-[2rem] bg-gradient-to-br from-amber-500/30 to-slate-950 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl text-4xl font-black shadow-amber-500/10">
                                                {cur.symbol || '$'}
                                            </div>
                                            <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(cur)}
                                                    className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90 shadow-xl"
                                                >
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCurrency(cur.id)}
                                                    className="w-11 h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90 shadow-xl"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white group-hover:text-amber-500 transition-colors tracking-tighter truncate leading-none">
                                                {cur.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Verified Settlement Asset</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-8 py-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between relative overflow-hidden group/footer">
                                        <div className="absolute inset-0 bg-amber-500/5 translate-x-full group-hover/footer:translate-x-0 transition-transform duration-700 pointer-events-none" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <Gem className="w-5 h-5 text-amber-500/40 group-hover/footer:text-amber-500 transition-colors" />
                                            <span className="text-[16px] font-black text-slate-400 tracking-[0.2em] group-hover/footer:text-white transition-colors tabular-nums">
                                                {cur.code}
                                            </span>
                                        </div>
                                        <ArrowRightLeft className="w-4 h-4 text-slate-800 opacity-40 group-hover/footer:rotate-180 transition-all duration-700 relative z-10" />
                                    </div>
                                </AppCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Currency Provisioning Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تحديث ميثاق العملة' : 'تعريف أصل نقدي جديد'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveCurrency} className="space-y-10 p-4">
                    <div className="space-y-8">
                        <div className="space-y-4 group">
                            <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest">
                                <Type className="w-5 h-5 text-amber-500" /> التوصيف النقدي (بالعربية)
                            </label>
                            <input
                                type="text"
                                value={currencyName}
                                onChange={(e) => setCurrencyName(e.target.value)}
                                placeholder="مثال: ريال سعودي، درهم إماراتي..."
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all placeholder:text-slate-800 shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4 group">
                                <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest text-center justify-center">
                                    <Hash className="w-5 h-5 text-amber-500" /> رمز الصرف
                                </label>
                                <input
                                    type="text"
                                    value={currencySymbol}
                                    onChange={(e) => setCurrencySymbol(e.target.value)}
                                    placeholder="ر.س"
                                    required
                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[16px] text-center font-black text-amber-500 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all shadow-inner"
                                />
                                <p className="text-[9px] font-black text-slate-700 text-center uppercase tracking-tighter">Localized Symbol</p>
                            </div>

                            <div className="space-y-4 group">
                                <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest text-center justify-center">
                                    <DollarSign className="w-5 h-5 text-amber-500" /> كود ISO الدولي
                                </label>
                                <input
                                    type="text"
                                    value={currencyCode}
                                    onChange={(e) => setCurrencyCode(e.target.value)}
                                    placeholder="SAR"
                                    required
                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] text-center font-black text-white focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all shadow-inner uppercase tracking-[0.2em]"
                                />
                                <p className="text-[9px] font-black text-slate-700 text-center uppercase tracking-tighter">Global Identifier</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !currencyName || !currencyCode || !currencySymbol}
                            className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black text-[12px] transition-all shadow-2xl shadow-amber-500/40 active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 uppercase tracking-[0.2em] group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'مزامنة ميثاق الصرف' : 'تفعيل الأصل النقدي'}</span>
                                    <ShieldCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-10 h-11 bg-white/5 hover:bg-white/10 text-slate-500 rounded-xl font-black transition-all border border-white/5 text-[12px] uppercase tracking-widest active:scale-95"
                        >
                            تراجع
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
