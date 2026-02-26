'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query, orderBy, where, getDocs, deleteDoc } from 'firebase/firestore';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    Users,
    Calendar as CalendarIcon,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreVertical,
    Search,
    Plus,
    Filter,
    ArrowUpDown,
    Download,
    Trash2,
    CalendarCheck,
    History,
    ChevronDown,
    Calendar,
    Check
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';
import Modal from '@/components/ui/Modal';
import RangeDateTimePicker from '@/components/ui/RangeDateTimePicker';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportUtils';

export default function AttendancePage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Filters
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfDay(new Date()),
        end: endOfDay(new Date())
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Registration States
    const [regEmployeeId, setRegEmployeeId] = useState('');
    const [regDate, setRegDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [regShifts, setRegShifts] = useState<any[]>([{ name: 'الفترة الصباحية', checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
    const [regLoading, setRegLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            fetchData(parsed.uid);
        }
    }, []);

    const fetchData = (uid: string) => {
        const empCol = collection(db, "employees", uid, "employees");
        onSnapshot(empCol, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(list);
            setLoading(false);
        });

        const plansCol = collection(db, "attendancePlans", uid, "plans");
        onSnapshot(plansCol, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlans(list);
        });
    };

    useEffect(() => {
        if (!user || employees.length === 0) return;
        fetchAttendance();
    }, [user, selectedEmployee, dateRange, employees]);

    const fetchAttendance = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let allAttendance: any[] = [];
            const targetEmployees = selectedEmployee === 'all'
                ? employees
                : employees.filter(e => e.id === selectedEmployee);

            // Optimization: Boundary filtering via doc ID (date string)
            const startStr = dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : '0000-00-00';
            const endStr = dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : '9999-99-99';

            for (const emp of targetEmployees) {
                const attRef = collection(db, "attendance", emp.id, "attendance");
                const q = query(
                    attRef,
                    where("__name__", ">=", startStr),
                    where("__name__", "<=", endStr),
                    orderBy("__name__", "desc")
                );

                const snap = await getDocs(q);
                const empAtt = snap.docs.map(doc => ({
                    id: doc.id,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    ...doc.data()
                }));

                allAttendance = [...allAttendance, ...empAtt];
            }

            setAttendance(allAttendance.sort((a, b) => b.id.localeCompare(a.id)));
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isModalOpen || !regEmployeeId || !regDate) return;

        // Check if a record already exists in the fetched attendance state
        const existingRecord = attendance.find(record =>
            record.employeeId === regEmployeeId && record.id === regDate
        );

        if (existingRecord && existingRecord.shifts) {
            setRegShifts(existingRecord.shifts);
            return;
        }

        const emp = employees.find(e => e.id === regEmployeeId);
        if (!emp || !emp.planId) {
            setRegShifts([{ name: 'فترة افتراضية', checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
            return;
        }

        const plan = plans.find(p => p.id === emp.planId);
        if (!plan || !plan.shifts || !Array.isArray(plan.shifts)) {
            setRegShifts([{ name: 'فترة افتراضية', checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
            return;
        }

        const parts = regDate.split('-').map(Number);
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dayIndex = dateObj.getDay();

        const dayMap: { [key: number]: string } = {
            0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
        };
        const dayId = dayMap[dayIndex];

        if (plan.days && plan.days.includes(dayId)) {
            const planShifts = plan.shifts.map((s: any, idx: number) => ({
                name: (s.name || `فترة رقم ${idx + 1}`),
                checkIn: s.start || '08:00',
                checkOut: s.end || '16:00',
                status: 'present'
            }));
            setRegShifts(planShifts);
        } else {
            setRegShifts([{ name: 'يوم غير مجدول', checkIn: '00:00', checkOut: '00:00', status: 'absent' }]);
        }
    }, [regEmployeeId, regDate, isModalOpen, employees, plans, attendance]);

    const addRegShift = () => {
        setRegShifts(prev => [...prev, { name: `فترة إضافية ${prev.length + 1}`, checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
    };

    const removeRegShift = (index: number) => {
        if (regShifts.length === 1) return;
        setRegShifts(prev => prev.filter((_, i) => i !== index));
    };

    const updateRegShift = (index: number, field: string, value: any) => {
        setRegShifts(prev => {
            const newList = [...prev];
            newList[index] = { ...newList[index], [field]: value };
            return newList;
        });
    };

    const handleSaveAttendance = async () => {
        if (!user || !regEmployeeId || !regDate) return;
        setRegLoading(true);
        try {
            const attRef = FirestoreApi.Api.getAttendanceRef(regEmployeeId, regDate);
            await FirestoreApi.Api.setData({
                docRef: attRef,
                data: {
                    shifts: regShifts,
                }
            });
            setIsModalOpen(false);
            fetchAttendance();
            // Reset modal state
            setRegEmployeeId('');
            setRegShifts([{ name: 'الفترة الصباحية', checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
        } catch (error) {
            console.error("Error saving attendance:", error);
        } finally {
            setRegLoading(false);
        }
    };

    const handleDeleteAttendance = async (empId: string, dateId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
        try {
            const attRef = FirestoreApi.Api.getAttendanceRef(empId, dateId);
            await FirestoreApi.Api.deleteData(attRef);
            fetchAttendance();
        } catch (error) {
            console.error("Error deleting attendance:", error);
        }
    };

    const handleExport = () => {
        if (!attendance || attendance.length === 0) return;

        const flatData: any[] = [];
        attendance.forEach(record => {
            const emp = employees.find(e => e.id === record.employeeId);
            if (record.shifts && Array.isArray(record.shifts)) {
                record.shifts.forEach((shift: any) => {
                    flatData.push({
                        'التاريخ': record.date,
                        'اسم الموظف': emp?.name || 'غير معروف',
                        'المعرف الوظيفي': emp?.jobId || 'N/A',
                        'اسم الوردية': shift.name,
                        'دخول': shift.checkIn,
                        'خروج': shift.checkOut,
                        'الحالة': shift.status === 'present' ? 'حاضر' :
                            shift.status === 'absent' ? 'غائب' :
                                shift.status === 'late' ? 'متأخر' :
                                    shift.status === 'leave' ? 'إجازة' : shift.status
                    });
                });
            }
        });

        const startStr = dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : 'start';
        const endStr = dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : 'end';

        exportToCSV(flatData, `Attendance_${startStr}_to_${endStr}`);
    };


    const getStatusBadge = (status: string) => {
        const configs: any = {
            present: { label: 'حاضر', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
            absent: { label: 'غائب', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: XCircle },
            late: { label: 'متأخر', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle },
            leave: { label: 'إجازة', color: 'bg-primary/10 text-primary border-primary/20', icon: CalendarIcon }
        };
        const config = configs[status] || configs.present;
        const Icon = config.icon;

        return (
            <div className={cn("px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-2 w-fit uppercase tracking-widest", config.color)}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <PageHeader
                title="سجل الدوام الذكي"
                subtitle="مراقبة وإدارة التزام الكادر الوظيفي بدقة متناهية."
                icon={CalendarCheck}
                breadcrumb="الموارد البشرية"
                actions={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExport}
                            className="h-11 px-7 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[12px] hover:bg-white/10 transition-all flex items-center gap-2.5 backdrop-blur-xl active:scale-95 shadow-2xl"
                        >
                            <Download className="w-4 h-4 text-primary" /> تصدير السجلات
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95"
                        >
                            <Plus className="w-4.5 h-4.5" /> تسجيل حضور مباشر
                        </button>
                    </div>
                }
            />

            {/* Smart Filter Bar Section */}
            <AppCard padding="none" className="mb-6 border-white/5 shadow-2xl overflow-visible z-40 bg-slate-900/40">
                <div className="p-6 md:p-7 flex flex-col lg:flex-row items-end gap-6">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            الموظف المستهدف
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Users className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                            </div>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:bg-slate-950/80 shadow-inner"
                            >
                                <option value="all">كل الموظفين النشطين</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full lg:w-auto flex-1 group">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            النطاق الزمني للمعاينة
                        </label>
                        <RangeDateTimePicker
                            value={dateRange}
                            onChange={(val) => setDateRange(val)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button className="flex-1 lg:w-11 lg:h-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/10 active:scale-90 group">
                            <Filter className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={fetchAttendance}
                            className="flex-[3] lg:w-11 lg:h-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90 group"
                        >
                            <History className="w-4.5 h-4.5 group-hover:rotate-180 transition-all duration-700" />
                        </button>
                    </div>
                </div>
            </AppCard>

            {/* High-Fidelity Table Container */}
            <AppCard padding="none" className="overflow-hidden border-white/5 shadow-2xl surface-deep">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03] border-b border-white/5">
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center gap-3 text-meta">
                                        اليوم والتاريخ <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center gap-3 text-meta">
                                        الموظف <Users className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center gap-3 text-meta">
                                        حالة الفترات <Clock className="w-3 h-3" />
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
                                    <td colSpan={4} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <span className="text-meta !text-primary animate-pulse">جاري معاينة سجلات الدوام...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-40 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                                        <div className="flex flex-col items-center gap-10 relative z-10">
                                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                    className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                                                />
                                                <CalendarIcon className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">لا يوجد سجل نشاط</h3>
                                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">لم نتمكن من رصد أي بيانات حضور لهذه الفترة. يرجى مراجعة المرشحات أو تسجيل حركات جديدة.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="h-11 px-8 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95"
                                            >
                                                تسجيل حضور الآن
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[16px] font-black text-white tracking-tighter">
                                                    {format(new Date(item.id), "EEEE", { locale: ar })}
                                                </span>
                                                <span className="text-meta !text-slate-700 !text-[9px]">
                                                    {format(new Date(item.id), "yyyy-MM-dd", { locale: ar })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 text-primary font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                                                    {item.employeeName?.charAt(0) || "؟"}
                                                </div>
                                                <span className="text-[15px] font-black text-white tracking-tight group-hover:text-primary transition-colors">
                                                    {item.employeeName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-3">
                                                {item.shifts && Array.isArray(item.shifts) && item.shifts.map((shift: any, sIdx: number) => (
                                                    <div key={sIdx} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-primary/20 transition-all min-w-[160px] shadow-sm relative group/shift overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-1 h-full opacity-60" style={{
                                                            backgroundColor:
                                                                shift.status === 'present' ? '#10b981' :
                                                                    shift.status === 'absent' ? '#f43f5e' :
                                                                        shift.status === 'late' ? '#f59e0b' : '#3b82f6'
                                                        }} />
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-meta !text-slate-500 !text-[9px]">{shift.name}</span>
                                                            {getStatusBadge(shift.status)}
                                                        </div>
                                                        <div className="flex items-center gap-2.5 text-[12px] font-black text-white/90 tabular-nums">
                                                            <Clock className="w-3.5 h-3.5 text-slate-700" />
                                                            <span>{shift.checkIn || '--:--'}</span>
                                                            <span className="text-slate-800 tracking-widest px-1">→</span>
                                                            <span>{shift.checkOut || '--:--'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90">
                                                    <MoreVertical className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttendance(item.employeeId, item.id)}
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

            {/* Attendance Registration Modal */}
            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="تسجيل استحقاق حضور جديد"
                    maxWidth="max-w-2xl"
                >
                    <div className="space-y-8 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-meta px-2 flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-primary" /> الاسم التعريفي للموظف
                                </label>
                                <div className="relative group">
                                    <select
                                        value={regEmployeeId}
                                        onChange={(e) => setRegEmployeeId(e.target.value)}
                                        className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl pr-4 pl-10 text-[13px] font-black text-white focus:border-primary transition-all outline-none shadow-inner appearance-none hover:bg-slate-900/60 cursor-pointer"
                                    >
                                        <option value="">اختر من قائمة الكادر...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-meta px-2 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary" /> تاريخ السجل المستهدف
                                </label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        value={regDate}
                                        onChange={(e) => setRegDate(e.target.value)}
                                        className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-4 text-[13px] font-black text-white focus:border-primary transition-all outline-none shadow-inner cursor-pointer appearance-none"
                                    />
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-meta flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-primary" /> فترات الدوام التشغيلية
                                </label>
                                <button
                                    onClick={addRegShift}
                                    className="text-[11px] font-black text-primary hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                                >
                                    <Plus className="w-3.5 h-3.5" /> إضافة فترة
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {regShifts.map((shift, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <input
                                                value={shift.name}
                                                onChange={(e) => updateRegShift(idx, 'name', e.target.value)}
                                                className="bg-transparent border-none p-0 text-[14px] font-black text-white focus:ring-0 w-1/2"
                                                placeholder="اسم الفترة..."
                                            />
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={shift.status}
                                                    onChange={(e) => updateRegShift(idx, 'status', e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[11px] font-black text-white outline-none"
                                                >
                                                    <option value="present">حاضر</option>
                                                    <option value="absent">غائب</option>
                                                    <option value="late">متأخر</option>
                                                    <option value="leave">إجازة</option>
                                                </select>
                                                {regShifts.length > 1 && (
                                                    <button
                                                        onClick={() => removeRegShift(idx)}
                                                        className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest pr-1">الدخول</div>
                                                <input
                                                    type="time"
                                                    value={shift.checkIn}
                                                    onChange={(e) => updateRegShift(idx, 'checkIn', e.target.value)}
                                                    className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-4 text-[13px] font-black text-white focus:border-primary transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest pr-1">الخروج</div>
                                                <input
                                                    type="time"
                                                    value={shift.checkOut}
                                                    onChange={(e) => updateRegShift(idx, 'checkOut', e.target.value)}
                                                    className="w-full h-11 bg-slate-950 border border-white/5 rounded-xl px-4 text-[13px] font-black text-white focus:border-primary transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setRegEmployeeId('');
                                    setRegShifts([{ name: 'الفترة الصباحية', checkIn: '08:00', checkOut: '16:00', status: 'present' }]);
                                }}
                                className="px-8 h-11 rounded-xl bg-white/5 font-black text-[12px] text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95"
                            >
                                إغلاق النافذة
                            </button>
                            <button
                                onClick={handleSaveAttendance}
                                disabled={regLoading || !regEmployeeId}
                                className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[12px] shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {regLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" /> تأكيد السجل وحفظ البيانات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardLayout>
    );
}
