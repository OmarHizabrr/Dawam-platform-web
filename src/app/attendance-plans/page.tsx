'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarRange,
    Plus,
    Pencil,
    Trash2,
    Clock,
    CalendarDays,
    Check,
    X,
    Layers,
    Info,
    Timer,
    ArrowLeftRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shift {
    start: string;
    end: string;
}

export default function AttendancePlansPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

    // حقول الباقة
    const [planName, setPlanName] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([{ start: '08:00', end: '16:00' }]);

    const daysOfWeek = [
        { id: 'sat', name: 'السبت' },
        { id: 'sun', name: 'الأحد' },
        { id: 'mon', name: 'الاثنين' },
        { id: 'tue', name: 'الثلاثاء' },
        { id: 'wed', name: 'الأربعاء' },
        { id: 'thu', name: 'الخميس' },
        { id: 'fri', name: 'الجمعة' },
    ];

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            const plansColRef = collection(db, "attendancePlans", parsedUser.uid, "plans");
            const unsubscribe = onSnapshot(query(plansColRef), (snapshot) => {
                const plansList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPlans(plansList);
            });

            return () => unsubscribe();
        }
    }, []);

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (selectedDays.length === 0) {
            alert("يرجى اختيار يوم واحد على الأقل");
            return;
        }

        setLoading(true);
        try {
            const planData = {
                name: planName,
                days: selectedDays,
                shifts: shifts,
            };

            if (isEditMode && editingPlanId) {
                const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, editingPlanId);
                await FirestoreApi.Api.updateData({ docRef: planRef, data: planData });
            } else {
                const planId = FirestoreApi.Api.getNewId("attendancePlans");
                const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, planId);
                await FirestoreApi.Api.setData({ docRef: planRef, data: planData });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving plan:", error);
            alert("حدث خطأ أثناء حفظ باقة الدوام");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
        try {
            const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, planId);
            await FirestoreApi.Api.deleteData(planRef);
        } catch (error) {
            console.error("Error deleting plan:", error);
            alert("حدث خطأ أثناء حذف الباقة");
        }
    };

    const openEditModal = (plan: any) => {
        setPlanName(plan.name);
        setSelectedDays(plan.days || []);
        setShifts(plan.shifts || [{ start: '08:00', end: '16:00' }]);
        setEditingPlanId(plan.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingPlanId(null);
        setPlanName('');
        setSelectedDays([]);
        setShifts([{ start: '08:00', end: '16:00' }]);
    };

    const toggleDay = (dayId: string) => {
        setSelectedDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    const addShift = () => {
        setShifts(prev => [...prev, { start: '08:00', end: '16:00' }]);
    };

    const removeShift = (index: number) => {
        if (shifts.length === 1) return;
        setShifts(prev => prev.filter((_, i) => i !== index));
    };

    const updateShift = (index: number, field: keyof Shift, value: string) => {
        setShifts(prev => {
            const newShifts = [...prev];
            newShifts[index] = { ...newShifts[index], [field]: value };
            return newShifts;
        });
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
                            باقات الدوام
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            تصميم وإدارة جداول العمل والورديات لمختلف أقسام وفئات الموظفين
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>إنشاء باقة</span>
                    </button>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {plans.length === 0 ? (
                            <div className="col-span-full py-24 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-500 gap-4 text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                        <Layers className="w-10 h-10" />
                                    </div>
                                    <p className="font-bold text-lg">لا توجد باقات دوام مضافة حالياً</p>
                                    <p className="text-sm max-w-xs mx-auto">ابدأ بإنشاء باقة دوام لتحديد أيام العمل وفترات الورديات للموظفين.</p>
                                </div>
                            </div>
                        ) : (
                            plans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group glass p-5 rounded-xl border border-white/5 shadow-xl hover:shadow-2xl hover:border-blue-500/20 transition-all flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shadow-inner">
                                            <CalendarRange className="w-4.5 h-4.5" />
                                        </div>

                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/10 flex items-center justify-center"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-black text-white mb-3 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{plan.name}</h3>

                                    <div className="space-y-4 flex-1">
                                        <div className="space-y-1.5">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                <CalendarDays className="w-2.5 h-2.5 text-blue-500/70" /> أيام العمل
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {daysOfWeek.map(d => (
                                                    <span key={d.id} className={cn(
                                                        "text-[8px] font-bold px-1.5 py-0.5 rounded border transition-colors",
                                                        plan.days.includes(d.id)
                                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/10"
                                                            : "bg-white/[0.02] text-slate-700 border-white/5"
                                                    )}>
                                                        {d.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-white/5 space-y-2">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5 text-emerald-500/70" /> فترات الدوام
                                            </span>
                                            <div className="grid gap-1.5">
                                                {plan.shifts.map((s: Shift, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between bg-white/[0.01] border border-white/5 px-2 py-1.5 rounded-lg group/shift hover:bg-white/[0.03] transition-colors">
                                                        <span className="text-[9px] font-bold text-slate-600">فترة {idx + 1}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900/50 px-1.5 py-0.5 rounded">
                                                                <Timer className="w-2 h-2 text-emerald-500" />
                                                                {s.start}
                                                            </div>
                                                            <ArrowLeftRight className="w-2 h-2 text-slate-800" />
                                                            <div className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900/50 px-1.5 py-0.5 rounded">
                                                                <Timer className="w-2 h-2 text-rose-500" />
                                                                {s.end}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل باقة الدوام' : 'إنشاء باقة دوام جديدة'}
                >
                    <form onSubmit={handleSavePlan} className="space-y-8 max-h-[80vh] overflow-y-auto px-2 custom-scrollbar">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <Layers className="w-3 h-3" /> اسم الباقة
                            </label>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="مثال: الدوام الرسمي الصيفي..."
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <CalendarDays className="w-3 h-3" /> تحديد أيام العمل
                            </label>
                            <div className="flex flex-wrap gap-1 p-1 bg-slate-900/30 rounded-xl border border-white/5 shadow-inner">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={cn(
                                            "flex-1 px-2 py-1.5 rounded-lg text-[9px] font-black transition-all border whitespace-nowrap",
                                            selectedDays.includes(day.id)
                                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                                        )}
                                    >
                                        {day.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> فترات الدوام
                                </label>
                                <button
                                    type="button"
                                    onClick={addShift}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/10 text-[8px] font-bold uppercase tracking-widest"
                                >
                                    <Plus className="w-2.5 h-2.5" /> إضافة فترة
                                </button>
                            </div>

                            <div className="space-y-4">
                                {shifts.map((shift, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative bg-slate-900/50 p-3 rounded-xl border border-white/5 shadow-inner"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase px-1">بداية الفترة</span>
                                                <input
                                                    type="time"
                                                    value={shift.start}
                                                    onChange={(e) => updateShift(index, 'start', e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-white font-black [color-scheme:dark] outline-none focus:border-blue-500/50 transition-all text-center text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black text-slate-600 uppercase px-1">نهاية الفترة</span>
                                                <input
                                                    type="time"
                                                    value={shift.end}
                                                    onChange={(e) => updateShift(index, 'end', e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-white font-black [color-scheme:dark] outline-none focus:border-blue-500/50 transition-all text-center text-sm"
                                                />
                                            </div>
                                        </div>

                                        {shifts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeShift(index)}
                                                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        <div className="mt-3 flex justify-center">
                                            <div className="inline-flex items-center gap-1.5 text-[8px] font-black text-slate-700 bg-white/5 px-3 py-0.5 rounded-full uppercase tracking-tighter">
                                                فترة رقـم {index + 1}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : (
                                    <>
                                        <span>{isEditMode ? 'تحديث الباقة' : 'تفعيل الباقة'}</span>
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
