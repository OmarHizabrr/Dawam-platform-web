'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CircleDollarSign,
    Plus,
    Pencil,
    Trash2,
    Users,
    Calendar as CalendarIcon,
    Wallet,
    FileText,
    Check,
    X,
    ChevronDown,
    Search,
    Info,
    DollarSign,
    ArrowUpDown,
    Download,
    TrendingUp,
    Filter,
    CreditCard,
    History,
    Receipt,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';
import Modal from '@/components/ui/Modal';
import RangeDateTimePicker from '@/components/ui/RangeDateTimePicker';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function SalariesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);
    const [allAttendance, setAllAttendance] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attLoading, setAttLoading] = useState(false);

    // Form Fields
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [salaryAmount, setSalaryAmount] = useState('');
    const [salaryCurrency, setSalaryCurrency] = useState('YMR');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [coverageRange, setCoverageRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });
    const [salaryNote, setSalaryNote] = useState('');

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSalary, setEditingSalary] = useState<any>(null);

    // Improved Filter State
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [attendanceStats, setAttendanceStats] = useState<{ totalWorkDays: number; totalLates: number; totalAbsents: number; totalLeaves: number } | null>(null);


    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchEmployees(parsedUser.uid);
                fetchCurrencies(parsedUser.uid);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const fetchEmployees = async (uid: string) => {
        const empColRef = collection(db, "employees", uid, "employees");
        const snapshot = await getDocs(empColRef);
        const empList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setEmployees(empList);
    };

    const fetchCurrencies = (uid: string) => {
        const currColRef = collection(db, "currencies", uid, "currencies");
        onSnapshot(query(currColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            setCurrencies(list);
            if (list.length > 0 && !salaryCurrency) {
                setSalaryCurrency(list[0].symbol || list[0].name);
            }
        });
    };

    useEffect(() => {
        if (!user || employees.length === 0) return;

        const unsubscribes = employees.map(emp => {
            // Salaries Listeners
            const salaryColRef = collection(db, "salarys", emp.id, "salarys");
            const unsubSal = onSnapshot(salaryColRef, (snapshot) => {
                const empSalaries = snapshot.docs.map(doc => ({
                    id: doc.id,
                    empId: emp.id,
                    empName: emp.name,
                    ...doc.data()
                }));

                setSalaries(prev => {
                    const filtered = prev.filter(s => s.empId !== emp.id);
                    const merged = [...filtered, ...empSalaries];
                    return merged.sort((a, b) => (b.createTimes?.seconds || 0) - (a.createTimes?.seconds || 0));
                });
            });

            // Attendance Listeners for Financial Insights
            const attColRef = collection(db, "attendance", emp.id, "attendance");
            const unsubAtt = onSnapshot(attColRef, (snapshot) => {
                const records = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    employeeId: emp.id
                }));
                setAllAttendance(prev => {
                    const filtered = prev.filter(r => r.employeeId !== emp.id);
                    return [...filtered, ...records];
                });
            });

            return () => {
                unsubSal();
                unsubAtt();
            };
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user, employees]);

    const handleSaveSalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || (selectedEmployees.length === 0 && !isEditMode)) return;

        setLoading(true);
        try {
            if (isEditMode && editingSalary) {
                const salaryRef = FirestoreApi.Api.getSalaryRef(editingSalary.empId, editingSalary.id);
                const dataToSave = {
                    amount: salaryAmount,
                    currency: salaryCurrency,
                    paymentDate,
                    startDate: coverageRange.start ? format(coverageRange.start, 'yyyy-MM-dd') : null,
                    endDate: coverageRange.end ? format(coverageRange.end, 'yyyy-MM-dd') : null,
                    note: salaryNote,
                };
                await FirestoreApi.Api.updateData({
                    docRef: salaryRef,
                    data: dataToSave
                });
            } else {
                const promises = selectedEmployees.map(async (empId) => {
                    const salaryId = FirestoreApi.Api.getNewId("salarys");
                    const salaryRef = FirestoreApi.Api.getSalaryRef(empId, salaryId);
                    const emp = employees.find(e => e.id === empId);

                    const dataToSave = {
                        amount: salaryAmount,
                        currency: salaryCurrency,
                        paymentDate,
                        startDate: coverageRange.start ? format(coverageRange.start, 'yyyy-MM-dd') : null,
                        endDate: coverageRange.end ? format(coverageRange.end, 'yyyy-MM-dd') : null,
                        note: salaryNote,
                        createdBy: user.uid,
                        createTimes: new Date(),
                        empId: empId,
                        empName: emp?.name
                    };

                    return FirestoreApi.Api.setData({
                        docRef: salaryRef,
                        data: dataToSave
                    });
                });

                await Promise.all(promises);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving salary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSalary = async (empId: string, salaryId: string) => {
        if (!confirm("هل أنت متأكد من حذف سجل الراتب هذا؟")) return;
        try {
            const salaryRef = FirestoreApi.Api.getSalaryRef(empId, salaryId);
            await FirestoreApi.Api.deleteData(salaryRef);
        } catch (error) {
            console.error("Error deleting salary:", error);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setEditingSalary(null);
        setSelectedEmployees([]);
        setSalaryAmount('');
        setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
        setCoverageRange({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
        });
        setSalaryNote('');
        if (currencies.length > 0) {
            setSalaryCurrency(currencies[0].symbol || currencies[0].name);
        } else {
            setSalaryCurrency('YMR');
        }
        setIsModalOpen(true);
    };

    const openEditModal = (salary: any) => {
        setIsEditMode(true);
        setEditingSalary(salary);
        setSelectedEmployees([salary.empId]);
        setSalaryAmount(salary.amount || '');
        setSalaryCurrency(salary.currency || 'YMR');
        setPaymentDate(salary.paymentDate || format(new Date(), 'yyyy-MM-dd'));
        setCoverageRange({
            start: salary.startDate ? parseISO(salary.startDate) : null,
            end: salary.endDate ? parseISO(salary.endDate) : null
        });
        setSalaryNote(salary.note || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployees([]);
        setSalaryAmount('');
        setSalaryNote('');
    };

    const toggleEmployeeSelection = (empId: string) => {
        if (isEditMode) return;
        setSelectedEmployees(prev =>
            prev.includes(empId)
                ? prev.filter(id => id !== empId)
                : [...prev, empId]
        );
    };

    useEffect(() => {
        if (!coverageRange.start || !coverageRange.end || selectedEmployees.length === 0) {
            setAttendanceStats(null);
            return;
        }

        const startStr = format(coverageRange.start, 'yyyy-MM-dd');
        const endStr = format(coverageRange.end, 'yyyy-MM-dd');

        let totalWorkDays = 0;
        let totalLates = 0;
        let totalAbsents = 0;
        let totalLeaves = 0;

        selectedEmployees.forEach(empId => {
            const empAtt = allAttendance.filter(r =>
                r.employeeId === empId &&
                r.id >= startStr &&
                r.id <= endStr
            );

            totalWorkDays += empAtt.length;

            empAtt.forEach(record => {
                if (record.shifts && Array.isArray(record.shifts)) {
                    record.shifts.forEach((s: any) => {
                        if (s.status === 'late') totalLates++;
                        else if (s.status === 'absent') totalAbsents++;
                        else if (s.status === 'leave') totalLeaves++;
                    });
                }
            });
        });

        setAttendanceStats({ totalWorkDays, totalLates, totalAbsents, totalLeaves });
    }, [selectedEmployees, coverageRange, allAttendance]);

    if (!mounted) return null;

    const filteredSalaries = salaries.filter(s => {
        const start = dateRange.start || new Date(0);
        const end = dateRange.end || new Date();
        const pDate = new Date(s.paymentDate);
        const isWithinDate = pDate >= start && pDate <= end;
        const matchesSearch = searchQuery === '' || (s.empName && s.empName.includes(searchQuery));
        return isWithinDate && matchesSearch;
    });

    const totalCalculatedSalaries = filteredSalaries.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    return (
        <DashboardLayout>
            <PageHeader
                title="إدارة المحفظة المالية"
                subtitle="أتمتة رواتب الموظفين ومتابعة المصروفات بدقة محاسبية متناهية."
                icon={Receipt}
                breadcrumb="المالية"
                actions={
                    <div className="flex items-center gap-4">
                        <button className="h-11 px-7 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[12px] hover:bg-white/10 transition-all flex items-center gap-2.5 backdrop-blur-xl active:scale-95 shadow-2xl">
                            <Download className="w-4 h-4 text-primary" /> تصدير الكشوفات
                        </button>
                        <button
                            onClick={openAddModal}
                            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95"
                        >
                            <Plus className="w-4.5 h-4.5" /> صرف استحقاق مالي
                        </button>
                    </div>
                }
            />

            {/* Financial Performance KPI Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <AppCard className="border-white/5 bg-primary/5 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-meta">إجمالي المصروفات التشغيلية</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-white tracking-tighter">{totalCalculatedSalaries.toLocaleString()}</h3>
                                <span className="text-[10px] font-black text-slate-600 uppercase">YMR (تقريبي)</span>
                            </div>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-white/5 shadow-2xl surface-deep">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 border border-white/5 shadow-inner">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-meta">عدد الحوالات المنفذة</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{filteredSalaries.length}</h3>
                        </div>
                    </div>
                </AppCard>
                <AppCard className="border-white/5 shadow-2xl surface-deep">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 border border-white/5 shadow-inner">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-meta">متوسط صرف الرواتب</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">
                                {filteredSalaries.length > 0 ? (totalCalculatedSalaries / filteredSalaries.length).toFixed(0).toLocaleString() : '0'}
                            </h3>
                        </div>
                    </div>
                </AppCard>
            </div>

            {/* Smart Financial Filter Section */}
            <AppCard padding="none" className="mb-6 border-white/5 shadow-2xl bg-slate-900/40 relative z-40">
                <div className="p-6 md:p-7 flex flex-col lg:flex-row items-end gap-6">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            البحث عن بيانات الموظف
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="أدخل اسم الموظف..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-[460px] group">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            النطاق الزمني للمعاملات المالية
                        </label>
                        <RangeDateTimePicker
                            value={dateRange}
                            onChange={(val) => setDateRange(val)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button className="flex-1 lg:w-11 lg:h-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10 active:scale-90 shadow-xl group">
                            <Filter className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </AppCard>

            {/* High-Fidelity Payroll Table */}
            <AppCard padding="none" className="overflow-hidden border-white/5 shadow-2xl surface-deep">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5 text-right">
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-meta">
                                        المستفيد <Users className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-meta">
                                        القيمة النقدية <CircleDollarSign className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-meta">
                                        مدة الاستحقاق <CalendarIcon className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-3 text-meta">
                                        تاريخ المعالجة <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <span className="text-meta text-left block">التحكم</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <span className="text-meta !text-primary animate-pulse">جاري سحب البيانات المالية...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSalaries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-48 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                                        <div className="flex flex-col items-center gap-10 relative z-10">
                                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                    className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                                                />
                                                <DollarSign className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">غياب السجلات المالية</h3>
                                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">لم نتمكن من رصد أي حوالات في النطاق الزمني المحدد. يرجى مراجعة المرشحات أو تسجيل دفعة جديدة.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="h-11 px-8 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95"
                                            >
                                                صرف راتب جديد
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSalaries.map((salary, idx) => (
                                    <tr key={salary.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 text-primary font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                                                    {salary.empName?.charAt(0) || "؟"}
                                                </div>
                                                <div className="space-y-1 flex flex-col">
                                                    <span className="text-[15px] font-black text-white tracking-tighter group-hover:text-primary transition-colors">
                                                        {salary.empName}
                                                    </span>
                                                    {salary.note && (
                                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 max-w-[200px]">
                                                            {salary.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[18px] font-black text-emerald-400 tracking-tighter tabular-nums">
                                                        {parseFloat(salary.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{salary.currency}</span>
                                                </div>
                                                <div className="w-16 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '100%' }}
                                                        transition={{ duration: 1 }}
                                                        className="h-full bg-emerald-500/40"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                    <span className="text-[12px] font-black text-slate-500 tabular-nums">{salary.startDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                    <span className="text-[12px] font-black text-white tabular-nums">{salary.endDate}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[14px] font-black text-white tracking-tighter tabular-nums">
                                                    {format(parseISO(salary.paymentDate), "yyyy-MM-dd")}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">مكتمل</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(salary)}
                                                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSalary(salary.empId, salary.id)}
                                                    className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Financial Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تعديل المعاملة المالية' : 'إصدار حوالة مستحقات'}
                maxWidth="max-w-4xl"
            >
                <form onSubmit={handleSaveSalary} className="space-y-10 p-4">
                    {!isEditMode && (
                        <div className="space-y-5">
                            <label className="text-meta px-2 block">تحديد المستفيدين من الكادر</label>

                            <div className="bg-slate-950/60 p-6 rounded-[2.5rem] border border-white/5 flex flex-wrap gap-3 min-h-[90px] transition-all shadow-inner relative group/selector">
                                <AnimatePresence>
                                    {selectedEmployees.length === 0 ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-slate-700 px-3 py-2">
                                            <Users className="w-5 h-5" />
                                            <span className="text-[14px] font-black">يرجى تمرير الماوس لتحديد الموظفين...</span>
                                        </motion.div>
                                    ) : (
                                        selectedEmployees.map(id => (
                                            <motion.div
                                                key={id}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3 text-[12px] font-black shadow-lg shadow-primary/5"
                                            >
                                                <span>{employees.find(e => e.id === id)?.name}</span>
                                                <button type="button" onClick={() => toggleEmployeeSelection(id)} className="hover:rotate-90 transition-transform">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto px-2 custom-scrollbar">
                                {employees.map(emp => {
                                    const isSelected = selectedEmployees.includes(emp.id);
                                    return (
                                        <button
                                            key={emp.id}
                                            type="button"
                                            onClick={() => toggleEmployeeSelection(emp.id)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-[12px] font-black transition-all border shrink-0",
                                                isSelected
                                                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/30"
                                                    : "bg-white/[0.03] text-slate-500 border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95"
                                            )}
                                        >
                                            {emp.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <Wallet className="w-4 h-4 text-primary" /> قيمة الدفعة
                            </label>
                            <input
                                type="number"
                                value={salaryAmount}
                                onChange={(e) => setSalaryAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-4 text-[16px] font-black text-emerald-400 focus:border-emerald-500 transition-all outline-none shadow-inner tabular-nums"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <CircleDollarSign className="w-4 h-4 text-primary" /> وحدة التداول
                            </label>
                            <select
                                value={salaryCurrency}
                                onChange={(e) => setSalaryCurrency(e.target.value)}
                                required
                                className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-4 text-[13px] font-black text-white focus:border-primary transition-all outline-none shadow-inner appearance-none cursor-pointer"
                            >
                                {currencies.map(curr => (
                                    <option key={curr.id} value={curr.symbol || curr.name}>{curr.name} ({curr.symbol})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-meta px-2 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary" /> تاريخ التسييل
                            </label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-4 text-[13px] font-black text-white focus:border-primary transition-all shadow-inner outline-none cursor-pointer appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-meta px-2">النطاق الزمني المغطى (الاستحقاق)</label>
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <RangeDateTimePicker
                                value={coverageRange}
                                onChange={(val) => setCoverageRange(val)}
                            />
                        </div>
                    </div>

                    {/* Attendance Insight Panel */}
                    {attendanceStats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-3xl bg-primary/[0.03] border border-primary/10 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <History className="w-16 h-16 text-primary" />
                            </div>
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-primary animate-pulse" />
                                    <h4 className="text-[14px] font-black text-white uppercase tracking-widest">مؤشرات الأداء للفترة المختارة</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أيام الحضور</p>
                                        <p className="text-2xl font-black text-white tabular-nums">{attendanceStats.totalWorkDays} <span className="text-[10px] text-slate-600">يوم</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">حالات التأخير</p>
                                        <p className="text-2xl font-black text-amber-500 tabular-nums">{attendanceStats.totalLates} <span className="text-[10px] text-slate-600">مرة</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أيام الغياب</p>
                                        <p className="text-2xl font-black text-rose-500 tabular-nums">{attendanceStats.totalAbsents} <span className="text-[10px] text-slate-600">يوم</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أيام الإجازة</p>
                                        <p className="text-2xl font-black text-primary tabular-nums">{attendanceStats.totalLeaves} <span className="text-[10px] text-slate-600">يوم</span></p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <label className="text-meta px-2 flex items-center gap-3">
                            <FileText className="w-4 h-4 text-primary" /> التوصيف المالي (سري)
                        </label>
                        <textarea
                            value={salaryNote}
                            onChange={(e) => setSalaryNote(e.target.value)}
                            placeholder="تدوين أي مكافآت، جزاءات، أو ملاحظات إدارية هنا..."
                            rows={4}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-[14px] font-black text-white focus:border-primary transition-all outline-none resize-none shadow-inner"
                        />
                    </div>

                    <div className="flex gap-5 pt-4">
                        <button
                            type="submit"
                            disabled={loading || (!isEditMode && selectedEmployees.length === 0)}
                            className={cn(
                                "flex-1 h-11 rounded-xl font-black text-[13px] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50",
                                isEditMode ? "bg-primary text-white shadow-primary/30" : "bg-emerald-600 text-white shadow-emerald-600/30"
                            )}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تأكيد التعديلات المالية' : 'اعتماد الحوالة نهائياً'}</span>
                                    <Check className="w-4.5 h-4.5" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 h-11 rounded-xl bg-white/5 font-black text-[12px] text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95"
                        >
                            إلغاء العملية
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
