'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarCheck,
    Plus,
    Pencil,
    Trash2,
    FileText,
    Info,
    Check,
    X,
    ClipboardList,
    AlignLeft,
    Search,
    Bookmark,
    Tag,
    History,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

export default function LeaveTypesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form fields
    const [typeName, setTypeName] = useState('');
    const [typeDescription, setTypeDescription] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                const typesColRef = collection(db, "leaveTypes", parsedUser.uid, "types");
                onSnapshot(query(typesColRef), (snapshot) => {
                    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setLeaveTypes(list);
                });
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const typeData = {
                name: typeName,
                description: typeDescription,
                updatedAt: new Date().toISOString(),
            };

            if (isEditMode && editingTypeId) {
                const typeRef = FirestoreApi.Api.getLeaveTypeRef(user.uid, editingTypeId);
                await FirestoreApi.Api.updateData({ docRef: typeRef, data: typeData });
            } else {
                const typeId = FirestoreApi.Api.getNewId("leaveTypes");
                const typeRef = FirestoreApi.Api.getLeaveTypeRef(user.uid, typeId);
                await FirestoreApi.Api.setData({ docRef: typeRef, data: { ...typeData, createdAt: new Date().toISOString() } });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving leave type:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteType = async (typeId: string) => {
        if (!confirm("هل أنت متأكد من حذف نوع الإجازة هذا؟")) return;
        try {
            const typeRef = FirestoreApi.Api.getLeaveTypeRef(user.uid, typeId);
            await FirestoreApi.Api.deleteData(typeRef);
        } catch (error) {
            console.error("Error deleting leave type:", error);
        }
    };

    const openEditModal = (type: any) => {
        setTypeName(type.name);
        setTypeDescription(type.description || '');
        setEditingTypeId(type.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingTypeId(null);
        setTypeName('');
        setTypeDescription('');
    };

    if (!mounted) return null;

    const filteredTypes = leaveTypes.filter(type =>
        searchQuery === '' ||
        (type.name && type.name.includes(searchQuery)) ||
        (type.description && type.description.includes(searchQuery))
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="قواعد الإجازات الرسمية"
                subtitle="إعداد مصفوفة أنواع الإجازات المتاحة وضوابط استهلاك الأرصدة السنوية."
                icon={ClipboardList}
                breadcrumb="المعايير التنظيمية"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        <span>إضافة تصنيف جديد</span>
                    </button>
                }
            />

            {/* High-Fidelity Search Interface */}
            <AppCard padding="none" className="mb-12 border-white/5 shadow-2xl bg-slate-900/40">
                <div className="p-6 md:p-10">
                    <div className="relative group">
                        <label className="text-meta mb-3 block px-1">فرز مصفوفة الإجازات</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-600 group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن مسمى الإجازة أو الوصف التنظيمي..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>
                </div>
            </AppCard>

            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTypes.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/2 rounded-full blur-[120px] pointer-events-none" />
                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity"
                                />
                                <Bookmark className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                            </div>
                            <div className="text-center space-y-3 relative z-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">لا يوجد أرشيف معرف</h3>
                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">يرجى تسجيل فئات الإجازات الرسمية ليتمكن النظام من محاكاة الأرصدة وإدارة التراخيص.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-8 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95"
                            >
                                تعريف فئة إجازة فوراً
                            </button>
                        </div>
                    ) : (
                        filteredTypes.map((type, idx) => (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <AppCard padding="none" className="group flex flex-col h-full border-white/5 shadow-2xl surface-deep relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                                    <div className="p-8 space-y-6 flex-1 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                                <Tag className="w-7 h-7" />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(type)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"
                                                >
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteType(type.id)}
                                                    className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-[20px] font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                                                {type.name}
                                            </h3>
                                            <p className="text-slate-500 text-[13px] font-bold leading-relaxed line-clamp-4 group-hover:text-slate-400 transition-colors">
                                                {type.description || 'لا توجد قواعد إدارية مسجلة لهذا النوع من الإجازات حالياً.'}
                                            </p>
                                        </div>

                                        <div className="pt-6 mt-2 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-meta !text-slate-600 !text-[10px]">بروتوكول نشط</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Activity className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">تحليل آلي</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between group-hover:bg-primary/[0.02] transition-colors">
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] tabular-nums">ID: {type.id.slice(0, 8)}...</span>
                                        <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
                                    </div>
                                </AppCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </AnimatePresence>

            {/* Leave Type Management Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تحديث المعايير' : 'تعريف فئة إجازة'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveType} className="space-y-10 p-4">
                    <div className="space-y-4">
                        <label className="text-meta px-2 flex items-center gap-3">
                            <AlignLeft className="w-4 h-4 text-primary" /> التسمية الرسمية
                        </label>
                        <input
                            type="text"
                            value={typeName}
                            onChange={(e) => setTypeName(e.target.value)}
                            placeholder="مثال: إجازة سنوية مدفوعة..."
                            required
                            className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner placeholder:text-slate-800"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-meta px-2 flex items-center gap-3">
                            <FileText className="w-4 h-4 text-primary" /> الدليل التنظيمي والقواعد
                        </label>
                        <textarea
                            value={typeDescription}
                            onChange={(e) => setTypeDescription(e.target.value)}
                            placeholder="تدوين القواعد والضوابط المنظمة لهذه الفئة..."
                            rows={5}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-6 text-[15px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none leading-relaxed shadow-inner placeholder:text-slate-800"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 hover:bg-primary/90 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تحديث السجل التنظيمي' : 'اعتماد التصنيف نهائياً'}</span>
                                    <Check className="w-4.5 h-4.5" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 h-11 rounded-xl bg-white/5 font-black text-[12px] text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95"
                        >
                            تجاهل
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
