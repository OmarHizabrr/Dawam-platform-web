'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import PeriodFilter from '@/components/PeriodFilter';
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
    CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // فلاتر البحث والفترة
    const [filterStartDate, setFilterStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [filterEndDate, setFilterEndDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });
    const [searchQuery, setSearchQuery] = useState('');

    // حقول التخصيص
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [amount, setAmount] = useState(''); // الكمية بالدقائق أو الأيام حسب الاتفاق
    const [unit, setUnit] = useState('minutes'); // minutes | days
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchInitialData(parsedUser.uid);
        }
    }, []);

    const fetchInitialData = async (uid: string) => {
        // جلب الموظفين
        const empColRef = collection(db, "employees", uid, "employees");
        onSnapshot(query(empColRef), (snapshot) => {
            setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // جلب أنواع الإجازات
        const typesColRef = collection(db, "leaveTypes", uid, "types");
        onSnapshot(query(typesColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeaveTypes(list);
            if (list.length > 0 && !selectedTypeId) setSelectedTypeId(list[0].id);
        });

        // جلب التخصيصات
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
                startDate: startDate,
                endDate: endDate,
                note: note,
                createdAt: new Date().toISOString(),
            };

            if (isEditMode && editingAllocationId) {
                const allocRef = FirestoreApi.Api.getLeaveAllocationRef(user.uid, editingAllocationId);
                await FirestoreApi.Api.updateData({ docRef: allocRef, data: allocationData });
            } else {
                const allocId = FirestoreApi.Api.getNewId("leaveAllocations");
                const allocRef = FirestoreApi.Api.getLeaveAllocationRef(user.uid, allocId);
                await FirestoreApi.Api.setData({ docRef: allocRef, data: allocationData });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving allocation:", error);
            alert("حدث خطأ أثناء حفظ التخصيص");
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
            alert("حدث خطأ أثناء الحذف");
        }
    };

    const setPeriodToMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const setPeriodToYear = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
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
        setStartDate(alloc.startDate);
        setEndDate(alloc.endDate);
        setNote(alloc.note || '');
        setEditingAllocationId(alloc.id);
        setIsEditMode(true);
        setIsModalOpen(true);
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
                            تخصيص أرصدة الإجازات
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            إدارة وتوزيع رصيد الإجازات السنوية والمرضية لكل موظف على حدة
                            <span className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-pink-500/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>تخصيص رصيد</span>
                    </button>
                </motion.header>

                <div className="no-print">
                    <PeriodFilter
                        startDate={filterStartDate}
                        endDate={filterEndDate}
                        onStartChange={setFilterStartDate}
                        onEndChange={setFilterEndDate}
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="بحث باسم الموظف أو نوع الإجازة..."
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-xl overflow-hidden border border-white/5 shadow-2xl mt-8"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">الموظف</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">نوع الإجازة</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">الرصيد المخصص</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">فترة الصلاحية</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {(() => {
                                        const filtered = allocations.filter(alloc => {
                                            const isWithinDate = (alloc.startDate >= filterStartDate && alloc.startDate <= filterEndDate) ||
                                                (alloc.endDate >= filterStartDate && alloc.endDate <= filterEndDate) ||
                                                (alloc.startDate <= filterStartDate && alloc.endDate >= filterEndDate);

                                            const matchesSearch = searchQuery === '' ||
                                                (alloc.employeeName && alloc.employeeName.includes(searchQuery)) ||
                                                (alloc.typeName && alloc.typeName.includes(searchQuery));

                                            return isWithinDate && matchesSearch;
                                        });

                                        if (filtered.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={5} className="py-24 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                                <Hourglass className="w-10 h-10" />
                                                            </div>
                                                            <p className="font-bold text-lg">لا يوجد تخصيصات أرصدة في هذه الفترة</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return filtered.map((alloc, idx) => (
                                            <motion.tr
                                                key={alloc.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 font-black transition-transform">
                                                            <User className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="font-bold text-white group-hover:text-pink-500 transition-colors uppercase tracking-tight text-[13px]">{alloc.employeeName}</div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 font-bold text-slate-500 text-[9px] uppercase">
                                                        <ClipboardList className="w-3 h-3 text-pink-500/70" />
                                                        {alloc.typeName}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-1.5 font-black text-sm text-emerald-400 tracking-tighter">
                                                        {alloc.amount}
                                                        <span className="text-[8px] text-slate-500 uppercase tracking-widest">{alloc.unit === 'minutes' ? 'دقيقة' : 'يوم'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 leading-tight">
                                                            <span className="text-[7.5px] text-slate-600 uppercase">Start:</span> {alloc.startDate}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 leading-tight">
                                                            <span className="text-[7.5px] text-slate-600 uppercase">End:</span> {alloc.endDate}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(alloc)}
                                                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAllocation(alloc.id)}
                                                            className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/10 flex items-center justify-center"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ));
                                    })()}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل تخصيص الرصيد' : 'تخصيص رصيد إجازة جديد'}
                >
                    <form onSubmit={handleSaveAllocation} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <User className="w-3 h-3" /> اختيار الموظف
                                </label>
                                <select
                                    value={selectedEmpId}
                                    onChange={(e) => setSelectedEmpId(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-pink-500/50 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900">اختر الموظف...</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id} className="bg-slate-900">{emp.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <ClipboardList className="w-3 h-3" /> نوع الإجازة
                                </label>
                                <select
                                    value={selectedTypeId}
                                    onChange={(e) => setSelectedTypeId(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-pink-500/50 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-900">اختر النوع...</option>
                                    {leaveTypes.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <TrendingUp className="w-3 h-3" /> مقدار الرصيد
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="ادخل العدد..."
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-white font-black text-sm focus:border-pink-500/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <LayoutList className="w-3 h-3" /> وحدة الاحتساب
                                </label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2 text-[13px] text-white font-black focus:border-pink-500/50 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="minutes" className="bg-slate-900">دقائق</option>
                                    <option value="days" className="bg-slate-900">أيام</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                                    <CalendarDays className="w-3 h-3" /> فترة الصلاحية
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={setPeriodToMonth}
                                        className="text-[8px] font-black px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-500 rounded-full border border-white/5 uppercase transition-all"
                                    >
                                        هذا الشهر
                                    </button>
                                    <button
                                        type="button"
                                        onClick={setPeriodToYear}
                                        className="text-[8px] font-black px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-500 rounded-full border border-white/5 uppercase transition-all"
                                    >
                                        هذه السنة
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-600 uppercase px-1">تاريخ البداية</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-white font-black [color-scheme:dark] outline-none focus:border-pink-500/50 transition-all text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-600 uppercase px-1">تاريخ الانتهاء</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-white font-black [color-scheme:dark] outline-none focus:border-pink-500/50 transition-all text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <FileText className="w-3 h-3" /> ملاحظات إدارية
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="مثال: رصيد إضافي..."
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-pink-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-pink-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : (
                                    <>
                                        <span>{isEditMode ? 'تحديث التخصيص' : 'إتمام التخصيص'}</span>
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
