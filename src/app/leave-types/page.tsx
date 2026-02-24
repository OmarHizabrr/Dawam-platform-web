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
    CalendarCheck,
    Plus,
    Pencil,
    Trash2,
    FileText,
    Info,
    Check,
    X,
    ClipboardList,
    AlignLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaveTypesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // حقول نوع الإجازة
    const [typeName, setTypeName] = useState('');
    const [typeDescription, setTypeDescription] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            const typesColRef = collection(db, "leaveTypes", parsedUser.uid, "types");
            const unsubscribe = onSnapshot(query(typesColRef), (snapshot) => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLeaveTypes(list);
            });

            return () => unsubscribe();
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
                createdAt: new Date().toISOString(),
            };

            if (isEditMode && editingTypeId) {
                const typeRef = FirestoreApi.Api.getLeaveTypeRef(user.uid, editingTypeId);
                await FirestoreApi.Api.updateData({ docRef: typeRef, data: typeData });
            } else {
                const typeId = FirestoreApi.Api.getNewId("leaveTypes");
                const typeRef = FirestoreApi.Api.getLeaveTypeRef(user.uid, typeId);
                await FirestoreApi.Api.setData({ docRef: typeRef, data: typeData });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving leave type:", error);
            alert("حدث خطأ أثناء حفظ نوع الإجازة");
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
            alert("حدث خطأ أثناء نوع الإجازة");
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

    if (!mounted || !user) return <div className="bg-[#0f172a] min-h-screen" />;

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
                            أنواع الإجازات
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            تخصيص تصنيفات الإجازات المختلفة وقواعد استحقاقها للموظفين
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>إضافة نوع</span>
                    </button>
                </motion.header>

                <div className="mb-10 max-w-md">
                    <SearchFilter
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="بحث عن نوع إجازة بالاسم..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {(() => {
                            const filtered = leaveTypes.filter(type =>
                                searchQuery === '' ||
                                (type.name && type.name.includes(searchQuery)) ||
                                (type.description && type.description.includes(searchQuery))
                            );

                            if (filtered.length === 0) {
                                return (
                                    <div className="col-span-full py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                <Info className="w-10 h-10" />
                                            </div>
                                            <p className="font-bold text-lg">{searchQuery === '' ? 'لا يوجد أنواع إجازات مضافة حالياً' : 'لا يوجد نتائج تطابق البحث'}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return filtered.map((type, index) => (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative glass p-5 rounded-xl border border-white/5 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all overflow-hidden"
                                >
                                    <div className="absolute -right-3 -top-3 text-[100px] font-black text-white/[0.02] pointer-events-none group-hover:text-primary/[0.05] transition-colors">
                                        <CalendarCheck />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                                <ClipboardList className="w-4.5 h-4.5" />
                                            </div>

                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(type)}
                                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteType(type.id)}
                                                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/10 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-black text-white mb-1 group-hover:text-primary transition-colors tracking-tight uppercase">{type.name}</h3>
                                        <p className="text-slate-500 text-[10px] font-medium line-clamp-2 mb-3 flex-1">
                                            {type.description || 'بدون وصف.'}
                                        </p>

                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">فئة نشطة</span>
                                            </div>
                                            <div className="text-[9px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                                                ID: {type.id.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        })()}
                    </AnimatePresence>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل نوع الإجازة' : 'إضافة نوع إجازة جديد'}
                >
                    <form onSubmit={handleSaveType} className="space-y-8">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <AlignLeft className="w-3 h-3" /> مسمى الإجازة
                            </label>
                            <input
                                type="text"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                placeholder="مثال: إجازة سنوية..."
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <FileText className="w-3 h-3" /> الوصف (اختياري)
                            </label>
                            <textarea
                                value={typeDescription}
                                onChange={(e) => setTypeDescription(e.target.value)}
                                placeholder="اشرح الشروط..."
                                rows={2}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white font-medium focus:border-primary/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : (
                                    <>
                                        <span>{isEditMode ? 'تحديث البيانات' : 'إضافة النوع'}</span>
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
        </DashboardLayout >
    );
}
