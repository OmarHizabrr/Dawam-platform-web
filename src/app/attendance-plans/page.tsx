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
    ArrowLeftRight,
    GripVertical,
    CalendarCheck,
    Briefcase,
    Zap,
    MousePointer2,
    ChevronLeft,
    Sparkles,
    Sun,
    Moon,
    Coffee,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

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

    // Form fields
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
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                const plansColRef = collection(db, "attendancePlans", parsedUser.uid, "plans");
                onSnapshot(query(plansColRef), (snapshot) => {
                    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPlans(list);
                });
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (selectedDays.length === 0) return;

        setLoading(true);
        try {
            const planData = {
                name: planName,
                days: selectedDays,
                shifts: shifts,
                updatedAt: new Date().toISOString()
            };

            if (isEditMode && editingPlanId) {
                const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, editingPlanId);
                await FirestoreApi.Api.updateData({ docRef: planRef, data: planData });
            } else {
                const planId = FirestoreApi.Api.getNewId("attendancePlans");
                const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, planId);
                await FirestoreApi.Api.setData({ docRef: planRef, data: { ...planData, createdAt: new Date().toISOString() } });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving plan:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الباقة؟ سيؤثر هذا على نظام احتساب الحضور للموظفين المرتبطين بها.")) return;
        try {
            const planRef = FirestoreApi.Api.getAttendancePlanRef(user.uid, planId);
            await FirestoreApi.Api.deleteData(planRef);
        } catch (error) {
            console.error("Error deleting plan:", error);
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

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <PageHeader
                title="هندسة جداول الحضور"
                subtitle="بناء هياكل الدوام المخصصة، تصميم الورديات، وتوزيع أيام العمل التشغيلية للمؤسسة."
                icon={CalendarRange}
                breadcrumb="الإعدادات التشغيلية"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        <span>إنشاء بنية دوام</span>
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 pb-20">
                <AnimatePresence mode="popLayout">
                    {plans.length === 0 ? (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                                />
                                <Layers className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                            </div>
                            <div className="text-center space-y-3 relative z-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">غياب المخطط التشغيلي</h3>
                                <p className="text-meta !text-[11px] max-w-[450px] mx-auto leading-relaxed">قم بتصميم المخطط الزمني الأول لضبط حركة تدفق الموظفين وقواعد الحضور داخل المؤسسة.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-8 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-black text-primary hover:text-white hover:bg-primary transition-all uppercase tracking-widest active:scale-95 shadow-xl shadow-primary/5"
                            >
                                تصميم أول خطة دوام
                            </button>
                        </div>
                    ) : (
                        plans.map((plan, idx) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.6, ease: "circOut" }}
                            >
                                <AppCard padding="none" className="group overflow-hidden flex flex-col h-full border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] surface-deep hover:translate-y-[-10px] transition-all duration-700">
                                    <div className="p-8 space-y-8 flex-1 relative">
                                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-slate-950 border border-primary/20 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                                                <CalendarCheck className="w-8 h-8" />
                                            </div>
                                            <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(plan)}
                                                    className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90"
                                                >
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                    className="w-11 h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-primary transition-colors leading-none">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <Briefcase className="w-4 h-4 text-slate-700" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Institutional Profile</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/[0.03] relative z-10">
                                            <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">دورة العمل الأسبوعية</div>
                                            <div className="flex flex-wrap gap-2">
                                                {daysOfWeek.map(d => {
                                                    const isActive = plan.days.includes(d.id);
                                                    return (
                                                        <span key={d.id} className={cn(
                                                            "text-[10px] font-black px-3.5 py-2 rounded-xl border transition-all duration-500 truncate",
                                                            isActive
                                                                ? "bg-primary/20 text-primary border-primary/20 shadow-lg shadow-primary/5"
                                                                : "bg-white/[0.01] text-slate-800 border-white/5 opacity-10"
                                                        )}>
                                                            {d.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 relative z-10">
                                            <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">توزيع الورديات (Shifts)</div>
                                            <div className="grid gap-3">
                                                {plan.shifts.map((s: Shift, sIdx: number) => (
                                                    <div key={sIdx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/5 group/shift hover:border-emerald-500/40 transition-all duration-500 shadow-inner overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-emerald-500/5 translate-x-full group-hover/shift:translate-x-0 transition-transform duration-700 pointer-events-none" />
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[11px] font-black text-slate-600 uppercase shadow-inner">
                                                                {sIdx + 1}
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[15px] font-black text-white tabular-nums">{s.start}</span>
                                                                <ArrowLeftRight className="w-4 h-4 text-slate-800" />
                                                                <span className="text-[15px] font-black text-white tabular-nums">{s.end}</span>
                                                            </div>
                                                        </div>
                                                        <Clock className="w-5 h-5 text-emerald-500/20 group-hover/shift:text-emerald-500 transition-all duration-500 group-hover/shift:rotate-12 relative z-10" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between relative overflow-hidden group/footer">
                                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover/footer:translate-y-0 transition-transform duration-500" />
                                        <div className="flex items-center gap-3 relative z-10">
                                            <Zap className="w-4 h-4 text-primary animate-pulse" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Active Architecture</span>
                                        </div>
                                        <button className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative z-10 group/btn">
                                            تحليل الكفاءة <ChevronLeft className="w-4 h-4 group-hover/btn:translate-x-[-3px] transition-transform" />
                                        </button>
                                    </div>
                                </AppCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Attendance Plan Blueprint Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تحديث بنية الدوام' : 'تصميم باقة دوام مؤسسية'}
                maxWidth="max-w-4xl"
            >
                <form onSubmit={handleSavePlan} className="space-y-12 p-4">
                    <div className="space-y-6 group">
                        <label className="text-meta px-2 flex items-center gap-3 uppercase tracking-widest">
                            <Layers className="w-5 h-5 text-primary" /> مسمى الهيكل التشغيلي
                        </label>
                        <input
                            type="text"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            placeholder="مثال: قطاع العمليات الميدانية، المكتب الرئيسي..."
                            required
                            className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner placeholder:text-slate-800"
                        />
                    </div>

                    <div className="space-y-6">
                        <label className="text-meta px-2 flex items-center gap-3 uppercase tracking-widest">
                            <CalendarDays className="w-5 h-5 text-primary" /> تحديد دورة العمل الأسبوعية
                        </label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                            {daysOfWeek.map(day => {
                                const isSelected = selectedDays.includes(day.id);
                                return (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={cn(
                                            "h-11 rounded-xl text-[11px] font-black transition-all duration-500 border flex flex-col items-center justify-center -space-y-0.5",
                                            isSelected
                                                ? "bg-primary text-white border-primary/20 shadow-2xl shadow-primary/30 scale-95"
                                                : "bg-slate-950 border-white/5 text-slate-700 hover:bg-slate-900 hover:text-slate-400 group/day"
                                        )}
                                    >
                                        <span className="opacity-40 uppercase font-mono text-[8px]">{day.id}</span>
                                        <span>{day.name}</span>
                                        {isSelected && <Sparkles className="w-2.5 h-2.5 text-white/40 animate-pulse" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-meta flex items-center gap-3 uppercase tracking-widest">
                                <Clock className="w-5 h-5 text-primary" /> تشكيل طبقات الورديات
                            </label>
                            <button
                                type="button"
                                onClick={addShift}
                                className="h-11 px-5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group shadow-xl shadow-primary/5 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> إضافة وردية
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AnimatePresence>
                                {shifts.map((shift, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        className="relative p-6 rounded-xl bg-slate-950 border border-white/10 border-dashed group/shift-edit hover:border-primary/40 transition-all duration-500 shadow-2xl"
                                    >
                                        <div className="grid grid-cols-2 gap-8 relative z-10">
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <Sun className="w-3.5 h-3.5" /> نقطة الدخول
                                                </span>
                                                <input
                                                    type="time"
                                                    value={shift.start}
                                                    onChange={(e) => updateShift(idx, 'start', e.target.value)}
                                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-center text-[14px] font-black text-white [color-scheme:dark] outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                                                    <Moon className="w-3.5 h-3.5" /> نقطة الانصراف
                                                </span>
                                                <input
                                                    type="time"
                                                    value={shift.end}
                                                    onChange={(e) => updateShift(idx, 'end', e.target.value)}
                                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-center text-[14px] font-black text-white [color-scheme:dark] outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col items-center gap-3">
                                            <div className="h-px w-24 bg-white/5" />
                                            <div className="flex items-center gap-3 text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">
                                                <Coffee className="w-4 h-4" /> Shift Layer {idx + 1}
                                            </div>
                                        </div>

                                        {shifts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeShift(idx)}
                                                className="absolute -top-3 -left-3 w-11 h-11 rounded-[1.5rem] bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-500/40 hover:scale-110 active:scale-90 transition-all z-20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}

                                        <MousePointer2 className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-900 opacity-0 group-hover/shift-edit:opacity-100 transition-all duration-500" />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-6 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={loading || selectedDays.length === 0}
                            className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[13px] transition-all shadow-2xl shadow-primary/40 hover:bg-primary/90 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'مزامنة معايير الدوام' : 'اعتماد البنية التشغيلية'}</span>
                                    <ShieldCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-[12px] font-black text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95 uppercase tracking-widest"
                        >
                            إلغاء العملية
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
