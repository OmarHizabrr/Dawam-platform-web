'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import SearchFilter from '@/components/SearchFilter';
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
    Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CurrenciesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // حقول العملة
    const [currencyName, setCurrencyName] = useState('');
    const [currencyCode, setCurrencyCode] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
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
        }
    }, []);

    const handleSaveCurrency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            if (isEditMode && editingCurrencyId) {
                const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, editingCurrencyId);
                await FirestoreApi.Api.updateData({
                    docRef: curRef,
                    data: {
                        name: currencyName,
                        code: currencyCode,
                        symbol: currencySymbol,
                    }
                });
            } else {
                const curId = FirestoreApi.Api.getNewId("currencies");
                const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, curId);

                await FirestoreApi.Api.setData({
                    docRef: curRef,
                    data: {
                        name: currencyName,
                        code: currencyCode,
                        symbol: currencySymbol,
                    }
                });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving currency:", error);
            alert("حدث خطأ أثناء حفظ العملة");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCurrency = async (curId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه العملة؟")) return;
        if (!user) return;

        try {
            const curRef = FirestoreApi.Api.getCurrencyRef(user.uid, curId);
            await FirestoreApi.Api.deleteData(curRef);
        } catch (error) {
            console.error("Error deleting currency:", error);
            alert("حدث خطأ أثناء حذف العملة");
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

    if (!mounted || !user) {
        return <div className="bg-[#0f172a] min-h-screen" />;
    }

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
                            العملات
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            تخصيص وإدارة العملات المستخدمة في التقارير والرواتب ومتابعة الحسابات
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>إضافة عملة</span>
                    </button>
                </motion.header>

                <div className="mb-10 max-w-md">
                    <SearchFilter
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="بحث عن عملة بالاسم أو الكود..."
                    />
                </div>

                {/* List of Currencies */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {(() => {
                            const filtered = currencies.filter(cur =>
                                searchQuery === '' ||
                                (cur.name && cur.name.includes(searchQuery)) ||
                                (cur.code && cur.code.includes(searchQuery))
                            );

                            if (filtered.length === 0) {
                                return (
                                    <div className="col-span-full py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                <Info className="w-10 h-10" />
                                            </div>
                                            <p className="font-bold text-lg">{searchQuery === '' ? 'لا يوجد عملات مضافة حالياً' : 'لا يوجد نتائج تطابق البحث'}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return filtered.map((cur, index) => (
                                <motion.div
                                    key={cur.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative glass p-4 rounded-xl border border-white/5 shadow-xl hover:shadow-2xl hover:border-amber-500/20 transition-all overflow-hidden"
                                >
                                    {/* Abstract Symbol Background */}
                                    <div className="absolute -right-3 -top-3 text-[80px] font-black text-white/[0.02] pointer-events-none group-hover:text-amber-500/[0.05] transition-colors leading-none">
                                        {cur.symbol || '$'}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg text-amber-500 font-black shadow-inner border border-amber-500/10">
                                                {cur.symbol || '$'}
                                            </div>

                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(cur)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCurrency(cur.id)}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/10 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-black text-white mb-1 group-hover:text-amber-500 transition-colors truncate">{cur.name}</h3>
                                        <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                            {cur.code}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        })()}
                    </AnimatePresence>
                </div>

                {/* Modal Component */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل بيانات العملة' : 'إضافة عملة جديدة'}
                >
                    <form onSubmit={handleSaveCurrency} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <Type className="w-3 h-3" /> اسم العملة بالعربي
                            </label>
                            <input
                                type="text"
                                value={currencyName}
                                onChange={(e) => setCurrencyName(e.target.value)}
                                placeholder="مثال: ريال سعودي"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-amber-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <Hash className="w-3 h-3" /> رمز العملة
                                </label>
                                <input
                                    type="text"
                                    value={currencySymbol}
                                    onChange={(e) => setCurrencySymbol(e.target.value)}
                                    placeholder="ر.س"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2 text-[13px] text-white font-black text-center focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <CircleDollarSign className="w-3 h-3" /> كود ISO
                                </label>
                                <input
                                    type="text"
                                    value={currencyCode}
                                    onChange={(e) => setCurrencyCode(e.target.value)}
                                    placeholder="SAR"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2 text-[13px] text-white font-black text-center uppercase tracking-widest focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : (
                                    <>
                                        <span>{isEditMode ? 'تحديث العملة' : 'حفظ العملة'}</span>
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold transition-all border border-white/5 text-xs"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
