'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hourglass,
    Plus,
    Pencil,
    Trash2,
    User,
    Calendar,
    Clock,
    FileText,
    Check,
    X,
    ClipboardList,
    TrendingUp,
    Info,
    LayoutList,
    Briefcase,
    CalendarDays,
    Search,
    Filter,
    ArrowLeftRight,
    Milestone,
    History,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';
import RangeDateTimePicker from '@/components/ui/RangeDateTimePicker';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

export default function LeaveAllocationPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAllocationId, setEditingAllocationId] = useState<string | null>(null);

    // Filter state
    const [dateRange, setRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Form fields
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('minutes');
    const [allocRange, setAllocRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });
    const [note, setNote] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchInitialData(parsedUser.uid);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const fetchInitialData = async (uid: string) => {
        // Fetch Employees
        const empColRef = collection(db, "employees", uid, "employees");
        onSnapshot(query(empColRef), (snapshot) => {
            setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Leave Types
        const typesColRef = collection(db, "leaveTypes", uid, "types");
        onSnapshot(query(typesColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeaveTypes(list);
            if (list.length > 0 && !selectedTypeId) setSelectedTypeId(list[0].id);
        });

        // Fetch Allocations
        const allocColRef = collection(db, "leaveAllocations", uid, "allocations");
        onSnapshot(query(allocColRef), (snapshot) => {
            setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    };

    const handleSaveAllocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedEmpId || !selectedTypeId) return;

        setLoading(true);
        try {
            const emp = employees.find(e => e.id === selectedEmpId);
            const type = leaveTypes.find(t => t.id === selectedTypeId);

            const allocationData = {
                employeeId: selectedEmpId,
                employeeName: emp?.name,
                typeId: selectedTypeId,
                typeName: type?.name,
                amount: parseFloat(amount),
                unit: unit,
                startDate: allocRange.start ? format(allocRange.start, 'yyyy-MM-dd') : null,
                endDate: allocRange.end ? format(allocRange.end, 'yyyy-MM-dd') : null,
                note: note,
                updatedAt: new Date().toISOString(),
            };

            if (isEditMode && editingAllocationId) {
                const allocRef = FirestoreApi.Api.getLeaveAllocationRef(user.uid, editingAllocationId);
                await FirestoreApi.Api.updateData({ docRef: allocRef, data: allocationData });
            } else {
                const allocId = FirestoreApi.Api.getNewId("leaveAllocations");
                const allocRef = FirestoreApi.Api.getLeaveAllocationRef(user.uid, allocId);
                await FirestoreApi.Api.setData({ docRef: allocRef, data: { ...allocationData, createdAt: new Date().toISOString() } });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving allocation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllocation = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا التخصيص؟")) return;
        try {
            const allocRef = FirestoreApi.Api.getLeaveAllocationRef(user.uid, id);
            await FirestoreApi.Api.deleteData(allocRef);
        } catch (error) {
            console.error("Error deleting allocation:", error);
        }
    };

    const setPeriodToMonth = () => {
        setAllocRange({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
        });
    };

    const setPeriodToYear = () => {
        const now = new Date();
        setAllocRange({
            start: new Date(now.getFullYear(), 0, 1),
            end: new Date(now.getFullYear(), 11, 31)
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingAllocationId(null);
        setSelectedEmpId('');
        setAmount('');
        setNote('');
    };

    const openEditModal = (alloc: any) => {
        setSelectedEmpId(alloc.employeeId);
        setSelectedTypeId(alloc.typeId);
        setAmount(alloc.amount.toString());
        setUnit(alloc.unit);
        setAllocRange({
            start: alloc.startDate ? parseISO(alloc.startDate) : null,
            end: alloc.endDate ? parseISO(alloc.endDate) : null
        });
        setNote(alloc.note || '');
        setEditingAllocationId(alloc.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    if (!mounted) return null;

    const filteredAllocations = allocations.filter(alloc => {
        const start = dateRange.start || new Date(0);
        const end = dateRange.end || new Date();

        const aStart = new Date(alloc.startDate);
        const aEnd = new Date(alloc.endDate);

        const isWithinDate = (aStart >= start && aStart <= end) || (aEnd >= start && aEnd <= end);
        const matchesSearch = searchQuery === '' ||
            (alloc.employeeName && alloc.employeeName.includes(searchQuery)) ||
            (alloc.typeName && alloc.typeName.includes(searchQuery));

        return isWithinDate && matchesSearch;
    });

    return (
        <DashboardLayout>
            <PageHeader
                title="تخصيص رصيد الإجازات"
                subtitle="أتمتة عملية منح الأرصدة السنوية والمستحقات الزمنية للكادر الوظيفي."
                icon={Milestone}
                breadcrumb="الموارد البشرية"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        <span>منح رصيد إجازة</span>
                    </button>
                }
            />

            {/* Premium Analytical Filter Layer */}
            <AppCard padding="none" className="mb-0 border-white/5 shadow-2xl bg-slate-900/40 relative z-40">
                <div className="p-6 md:p-7 flex flex-col xl:flex-row items-end gap-6">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1">البحث في السجلات</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="اسم الموظف أو نوع الإجازة..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="w-full xl:w-[460px] group">
                        <label className="text-meta mb-2 block px-1">النطاق الزمني للتخصيص</label>
                        <RangeDateTimePicker
                            value={dateRange}
                            onChange={(val) => setRange(val)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <button className="flex-1 xl:w-11 xl:h-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10 active:scale-90 shadow-xl group">
                            <Filter className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </AppCard>

            <div className="h-6" />

            {/* High-Fidelity Allocation Ledger */}
            <AppCard padding="none" className="overflow-hidden border-white/5 shadow-2xl surface-deep">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5 text-right">
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-3 text-meta">
                                        الموظف <User className="w-3.5 h-3.5" />
                                    </div>
                                </th>
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-3 text-meta">
                                        تصنيف الاستحقاق <ClipboardList className="w-3.5 h-3.5" />
                                    </div>
                                </th>
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-3 text-meta">
                                        القيمة الممنوحة <TrendingUp className="w-3.5 h-3.5" />
                                    </div>
                                </th>
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-3 text-meta">
                                        صلاحية الرصيد <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                </th>
                                <th className="px-10 py-6 text-left">
                                    <span className="text-meta text-left block">الإجراءات</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredAllocations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-48 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                                        <div className="flex flex-col items-center gap-10 relative z-10">
                                            <div className="w-32 h-32 rounded-[3.5rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty overflow-hidden">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute inset-0 bg-primary/10 rounded-[3.5rem] blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity"
                                                />
                                                <Hourglass className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-all duration-700" />
                                            </div>
                                            <div className="text-center space-y-3">
                                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">فراغ في سجلات التخصيص</h3>
                                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">لم يتم رصد أي أرصدة ممنوحة في هذه الفترة. باشر بمنح الأرصدة للموظفين لبدء دورة الإجازات.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="h-11 px-8 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-black text-primary hover:text-white hover:bg-primary transition-all uppercase tracking-widest active:scale-95 shadow-xl shadow-primary/5"
                                            >
                                                تخصيص رصيد موظف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAllocations.map((alloc, idx) => (
                                    <tr key={alloc.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 text-primary font-black text-base shadow-inner group-hover:scale-110 transition-transform">
                                                    {alloc.employeeName?.charAt(0) || "؟"}
                                                </div>
                                                <div className="space-y-1.5 flex flex-col">
                                                    <span className="text-[17px] font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                                                        {alloc.employeeName}
                                                    </span>
                                                    {alloc.note && (
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 max-w-[220px]">
                                                            {alloc.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/10 inline-flex items-center gap-2 group-hover:bg-primary/20 transition-all">
                                                <Activity className="w-3.5 h-3.5 text-primary" />
                                                <span className="text-[11px] font-black text-primary uppercase tracking-widest">{alloc.typeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-baseline gap-2.5">
                                                    <span className="text-[22px] font-black text-emerald-400 tracking-tighter tabular-nums">
                                                        {alloc.amount}
                                                    </span>
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                        {alloc.unit === 'minutes' ? 'دقيقة' : 'يوم'}
                                                    </span>
                                                </div>
                                                <div className="w-20 h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '65%' }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full bg-emerald-500/40"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                                    <span className="text-[13px] font-black text-slate-500 tabular-nums">انطلاق: {alloc.startDate}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                                                    <span className="text-[13px] font-black text-white tabular-nums">نهاية: {alloc.endDate}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-left">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(alloc)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90"
                                                >
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAllocation(alloc.id)}
                                                    className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </AppCard>

            {/* Allocation Ledger Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تعديل تخصيص الرصيد' : 'منح رصيد استحقاق'}
                maxWidth="max-w-4xl"
            >
                <form onSubmit={handleSaveAllocation} className="space-y-10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <User className="w-4 h-4 text-primary" /> كادر الموظفين
                            </label>
                            <select
                                value={selectedEmpId}
                                onChange={(e) => setSelectedEmpId(e.target.value)}
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">اختر الموظف...</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <ClipboardList className="w-4 h-4 text-primary" /> نوع الاستحقاق
                            </label>
                            <select
                                value={selectedTypeId}
                                onChange={(e) => setSelectedTypeId(e.target.value)}
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="">حدد نوع الإجازة...</option>
                                {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-primary" /> قيمة الرصيد
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="00"
                                    required
                                    className="flex-1 h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[18px] font-black text-emerald-400 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-inner tabular-nums"
                                />
                                <div className="w-24 h-11 bg-slate-950 border border-white/5 rounded-xl relative">
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full h-full bg-transparent px-3 text-[13px] font-black text-slate-500 outline-none appearance-none cursor-pointer text-center group-hover:text-primary transition-colors"
                                    >
                                        <option value="minutes">دقائق</option>
                                        <option value="days">أيام</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-meta flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-primary" /> نافذة الصلاحية
                                </label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={setPeriodToMonth} className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10 hover:bg-primary/20 transition-all">شهر</button>
                                    <button type="button" onClick={setPeriodToYear} className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10 hover:bg-primary/20 transition-all">سنة</button>
                                </div>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                <RangeDateTimePicker
                                    value={allocRange}
                                    onChange={(val) => setAllocRange(val)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-meta px-2 flex items-center gap-3">
                            <FileText className="w-4 h-4 text-primary" /> مبررات التخصيص
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="تدوين أي ملاحظات إدارية حول هذا الاستحقاق..."
                            rows={4}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none shadow-inner placeholder:text-slate-800"
                        />
                    </div>

                    <div className="flex gap-5 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !selectedEmpId || !selectedTypeId}
                            className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[13px] transition-all shadow-2xl shadow-primary/30 hover:bg-primary/90 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تأكيد تعديل الرصيد' : 'اعتماد المنح نهائياً'}</span>
                                    <Check className="w-4.5 h-4.5" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 h-11 rounded-xl bg-white/5 font-black text-[12px] text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95"
                        >
                            تراجع
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
