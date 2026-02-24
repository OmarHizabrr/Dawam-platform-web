'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    Calendar as CalendarIcon,
    Clock,
    Search as SearchIcon,
    Filter as FilterIcon,
    Trash2 as TrashIcon,
    User as UserIcon,
    ClipboardCheck as ClipboardIcon,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import RangeDateTimePicker from '@/components/ui/RangeDateTimePicker';
import Modal from '@/components/ui/Modal';

interface DateTimeRange {
    start: Date | null;
    end: Date | null;
}

export default function AttendancePage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedEmpId, setSelectedEmpId] = useState('');

    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayPlan, setDayPlan] = useState<any>(null);
    const [recordShifts, setRecordShifts] = useState<any[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<DateTimeRange>(() => {
        const d = new Date();
        return {
            start: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        };
    });



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

        // جلب الباقات
        const plansColRef = collection(db, "attendancePlans", uid, "plans");
        onSnapshot(query(plansColRef), (snapshot) => {
            setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // جلب أنواع الإجازات
        const typesColRef = collection(db, "leaveTypes", uid, "types");
        onSnapshot(query(typesColRef), (snapshot) => {
            setLeaveTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    };

    // مراقبة سجلات الدوام للموظف المختار (في هذه الشاشة سنعرض الدوام للأيام الأخيرة)
    useEffect(() => {
        if (!selectedEmpId) {
            setAttendanceRecords([]);
            return;
        }

        const attColRef = collection(db, "attendance", selectedEmpId, "attendance");
        const unsub = onSnapshot(query(attColRef), (snapshot) => {
            const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAttendanceRecords(records.sort((a: any, b: any) => b.date.localeCompare(a.date)));
        });

        // جلب التخصيصات النشطة للموظف
        const allocColRef = collection(db, "leaveAllocations", user.uid, "allocations");
        const unsubAlloc = onSnapshot(query(allocColRef, where("employeeId", "==", selectedEmpId)), (snapshot) => {
            setAllocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsub();
            unsubAlloc();
        };
    }, [selectedEmpId, user]);

    // عند اختيار موظف وتاريخ، نقوم بجلب الباقة المرتبطة به
    useEffect(() => {
        if (!selectedEmpId) {
            setDayPlan(null);
            setRecordShifts([]);
            return;
        }

        const emp = employees.find(e => e.id === selectedEmpId);
        if (!emp || !emp.planId) {
            setDayPlan(null);
            setRecordShifts([{
                start: '08:00',
                end: '16:00',
                status: 'present',
                checkIn: '',
                checkOut: '',
                leaveTypeId: '',
                isCoveredByLeave: false,
                missingMinutes: 0,
                delayCoverage: []
            }]);
            return;
        }

        const plan = plans.find(p => p.id === emp.planId);
        if (plan) {
            setDayPlan(plan);
            // تجهيز الفترات من الباقة
            setRecordShifts(plan.shifts.map((s: any) => ({
                ...s,
                status: 'present',
                checkIn: s.start,
                checkOut: s.end,
                leaveTypeId: '',
                isCoveredByLeave: false,
                missingMinutes: 0,
                delayCoverage: []
            })));
        }
    }, [selectedEmpId, attendanceDate, employees, plans]);

    const balances = useMemo(() => {
        if (!selectedEmpId || allocations.length === 0) return {};

        const consumption: { [allocId: string]: number } = {};

        attendanceRecords.forEach(record => {
            if (record.shifts && Array.isArray(record.shifts)) {
                record.shifts.forEach((shift: any) => {
                    const delayCoverage = shift.delayCoverage || [];

                    if (shift.isCoveredByLeave && delayCoverage.length > 0) {
                        delayCoverage.forEach((cov: any) => {
                            if (!cov.typeId) return;
                            const alloc = allocations.find(a => a.typeId === cov.typeId && record.date >= a.startDate && record.date <= a.endDate);
                            if (alloc) {
                                let amount = parseFloat(cov.mins) || 0;
                                if (alloc.unit === 'days') amount = amount / 480;
                                consumption[alloc.id] = (consumption[alloc.id] || 0) + amount;
                            }
                        });
                    } else if (shift.leaveTypeId) {
                        const alloc = allocations.find(a => a.typeId === shift.leaveTypeId && record.date >= a.startDate && record.date <= a.endDate);
                        if (alloc) {
                            let amount = 0;
                            if (shift.isCoveredByLeave && shift.missingMinutes > 0) {
                                amount = parseFloat(shift.missingMinutes) || 0;
                                if (alloc.unit === 'days') amount = amount / 480;
                            } else if (shift.status !== 'present') {
                                if (alloc.unit === 'minutes') {
                                    const [h1, m1] = (shift.start || '00:00').split(':').map(Number);
                                    const [h2, m2] = (shift.end || '00:00').split(':').map(Number);
                                    amount = (h2 * 60 + m2) - (h1 * 60 + m1);
                                    if (amount < 0) amount += 24 * 60;
                                } else {
                                    amount = 1 / (record.shifts?.length || 1);
                                }
                            }
                            consumption[alloc.id] = (consumption[alloc.id] || 0) + amount;
                        }
                    }
                });
            }
        });

        const result: { [allocId: string]: number } = {};
        allocations.forEach(a => {
            const consumed = consumption[a.id] || 0;
            result[a.id] = Math.max(0, (parseFloat(a.amount) || 0) - consumed);
        });
        return result;
    }, [selectedEmpId, allocations, attendanceRecords]);

    const getStatusText = (status: string) => {
        switch (status) {
            case 'present': return 'حاضر';
            case 'absent': return 'غائب';
            case 'late': return 'متأخر';
            case 'leave': return 'إجازة';
            default: return status;
        }
    };

    const handleSaveAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmpId || recordShifts.length === 0) return;

        setLoading(true);
        try {
            const attendanceId = attendanceDate;
            const attRef = FirestoreApi.Api.getAttendanceRef(selectedEmpId, attendanceId);

            const emp = employees.find(e => e.id === selectedEmpId);
            await FirestoreApi.Api.setData({
                docRef: attRef,
                data: {
                    date: attendanceDate,
                    employeeId: selectedEmpId,
                    employeeName: emp?.name || 'غير معروف',
                    shifts: recordShifts,
                    planSnapshot: dayPlan || null,
                }
            });

            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert("حدث خطأ أثناء حفظ سجل الدوام");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAttendance = async (attendanceId: string) => {
        if (!selectedEmpId || !confirm("هل أنت متأكد من حذف سجل الدوام هذا؟")) return;

        try {
            const attRef = FirestoreApi.Api.getAttendanceRef(selectedEmpId, attendanceId);
            await FirestoreApi.Api.deleteData(attRef);
        } catch (error) {
            console.error("Error deleting attendance:", error);
            alert("حدث خطأ أثناء حذف سجل الدوام");
        }
    };



    const calculateMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const updateShiftRecord = (idx: number, field: string, value: any) => {
        setRecordShifts(prev => {
            const next = [...prev];
            const updatedShift = { ...next[idx], [field]: value };

            // Auto-calculate missing minutes if check-in or check-out changes
            if (field === 'checkIn' || field === 'checkOut' || field === 'status') {
                const plannedStart = calculateMinutes(updatedShift.start);
                const plannedEnd = calculateMinutes(updatedShift.end);

                if (updatedShift.status === 'absent' || updatedShift.status === 'leave') {
                    updatedShift.missingMinutes = plannedEnd - plannedStart;
                } else {
                    const actualIn = calculateMinutes(updatedShift.checkIn);
                    const actualOut = calculateMinutes(updatedShift.checkOut);

                    let lateMins = 0;
                    let earlyMins = 0;

                    if (updatedShift.checkIn && actualIn > plannedStart) {
                        lateMins = actualIn - plannedStart;
                    }
                    if (updatedShift.checkOut && actualOut < plannedEnd) {
                        earlyMins = plannedEnd - actualOut;
                    }

                    updatedShift.missingMinutes = lateMins + earlyMins;
                }
            }

            next[idx] = updatedShift;
            return next;
        });
    };

    if (!mounted || !user) return <div style={{ background: '#0f172a', minHeight: '100vh' }} />;


    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                                <ClipboardIcon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-[7.5px] font-black text-primary uppercase tracking-widest">إدارة الحضور</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            سجل الدوام اليومي
                        </h1>
                        <p className="text-slate-500 text-[9px] font-medium leading-relaxed">متابعة دقيقة وتسجيل ذكي لحضور وانصراف الفريق</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 group active:scale-95"
                        >
                            <CalendarIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>تسجيل تحضير</span>
                        </button>
                    </div>
                </header>

                {/* Filters Section */}
                <div className="glass p-3.5 rounded-xl border border-white/5 mb-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-40 transition-opacity" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                        <div className="space-y-1">
                            <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-0.5">
                                <SearchIcon className="w-2.5 h-2.5 text-primary" />
                                بحث سريع
                            </label>
                            <div className="relative overflow-hidden rounded-lg border border-white/5 bg-slate-950/40 focus-within:border-primary/50 transition-all">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="اسم الموظف..."
                                    className="w-full px-3 py-1.5 text-white outline-none placeholder:text-slate-700 bg-transparent text-[10px] font-medium h-9"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-0.5">
                                <FilterIcon className="w-2.5 h-2.5 text-emerald-400" />
                                النطاق الزمني
                            </label>
                            <div className="[&_button]:h-9 [&_button]:rounded-lg [&_button]:text-[10px]">
                                <RangeDateTimePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصفية النتائج:</span>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                        <select
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            className="bg-white/5 border border-white/5 hover:border-white/10 rounded-lg px-4 py-2 text-[11px] text-white outline-none transition-all cursor-pointer font-bold h-9"
                        >
                            <option value="" className="bg-slate-900">كل الموظفين</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id} className="bg-slate-900">{emp.name}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedEmpId('');
                            }}
                            className="px-4 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white text-[10px] font-black transition-all border border-white/5 active:scale-95 h-9"
                        >
                            إعادة ضبط الفلاتر
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-dark rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-5 py-2.5 text-right text-[7.5px] font-black text-slate-600 uppercase tracking-widest">الموظف</th>
                                <th className="px-5 py-2.5 text-right text-[7.5px] font-black text-slate-600 uppercase tracking-widest">التاريخ</th>
                                <th className="px-5 py-2.5 text-right text-[7.5px] font-black text-slate-600 uppercase tracking-widest">الفترات والنمط</th>
                                <th className="px-5 py-2.5 text-center text-[7.5px] font-black text-slate-600 uppercase tracking-widest">التحكم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {!selectedEmpId ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center gap-4"
                                        >
                                            <div className="relative group/user scale-90">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center border border-white/10 group-hover/user:scale-105 transition-transform duration-500 shadow-xl">
                                                    <UserIcon className="w-6 h-6 text-primary animate-pulse-slow" />
                                                </div>
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded bg-slate-950 border border-white/10 flex items-center justify-center shadow-lg"
                                                >
                                                    <SearchIcon className="w-2.5 h-2.5 text-slate-500" />
                                                </motion.div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-white px-2">ابدأ باختيار الموظف</p>
                                                <p className="text-slate-500 text-[9px] font-bold max-w-[200px] mx-auto leading-relaxed">يرجى تحديد الموظف من القائمة أعلاه لعرض سجلات الدوام.</p>
                                            </div>
                                        </motion.div>
                                    </td>
                                </tr>
                            ) : (
                                (() => {
                                    const filtered = attendanceRecords.filter(rec => {
                                        const startStr = dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : '';
                                        const endStr = dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : startStr;

                                        const isWithinDate = !startStr || (rec.date >= startStr && rec.date <= endStr);
                                        const matchesSearch = searchQuery === '' ||
                                            (rec.employeeName && rec.employeeName.includes(searchQuery));
                                        return isWithinDate && matchesSearch;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-40 text-center">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex flex-col items-center gap-6"
                                                    >
                                                        <div className="w-24 h-24 rounded-[32px] bg-white/[0.02] flex items-center justify-center border border-white/5 shadow-inner">
                                                            <SearchIcon className="w-10 h-10 text-slate-600 opacity-30" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-2xl font-black text-slate-400 px-1 uppercase tracking-tight">لا توجد سجلات مطابقة</p>
                                                            <span className="text-slate-600 font-bold">جرب تغيير الفترة الزمنية المحددة للبحث</span>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return filtered.map(rec => (
                                        <tr key={rec.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                                            <td className="px-5 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary/20 to-blue-500/10 flex items-center justify-center text-primary font-black text-xs shadow-md border border-white/5 group-hover:scale-105 transition-transform">
                                                        {rec.employeeName?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="block font-black text-[12px] text-white group-hover:text-primary transition-colors duration-300">
                                                            {rec.employeeName || 'غير معروف'}
                                                        </span>
                                                        <span className="block text-[7px] text-slate-600 font-black uppercase tracking-widest">موظف مسجل</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black text-[12px] mb-0.5 leading-none">{rec.date}</span>
                                                    <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest leading-none">{(format as any)(new Date(rec.date), 'EEEE', { locale: ar })}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {rec.shifts?.map((s: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/5 rounded-lg transition-colors hover:bg-white/10 shadow-sm group/tag">
                                                            <div className="flex flex-col">
                                                                <span className="text-white font-black text-[9px] leading-none mb-0.5">{s.checkIn} - {s.checkOut}</span>
                                                                <span className="text-[6px] text-slate-600 font-bold uppercase tracking-widest text-left">P{idx + 1}</span>
                                                            </div>
                                                            <div className="w-px h-2.5 bg-white/10" />
                                                            <div className={cn(
                                                                "flex items-center gap-1 px-1 py-0.5 rounded font-black text-[6.5px] uppercase tracking-wider",
                                                                s.status === 'present' ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                                                            )}>
                                                                <div className={cn("w-0.5 h-0.5 rounded-full", s.status === 'present' ? "bg-emerald-400" : "bg-rose-400")} />
                                                                {getStatusText(s.status)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-center">
                                                <button
                                                    onClick={() => handleDeleteAttendance(rec.id)}
                                                    className="w-7 h-7 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 transition-all border border-white/5 hover:border-rose-500/20 active:scale-95 flex items-center justify-center mx-auto"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ));
                                })()
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Main Action Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="تسجيل تحضير / تقديم طلب"
            >
                <form onSubmit={handleSaveAttendance} className="space-y-5 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <label className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 px-0.5">
                                <UserIcon className="w-2.5 h-2.5 text-primary" />
                                الموظف
                            </label>
                            <div className="relative overflow-hidden rounded-lg border border-white/5 bg-slate-950/40 focus-within:border-primary/50 transition-all">
                                <select
                                    value={selectedEmpId}
                                    onChange={(e) => setSelectedEmpId(e.target.value)}
                                    required
                                    className="w-full bg-transparent border-none px-3 py-1.5 text-white focus:ring-0 outline-none appearance-none cursor-pointer text-[10px] font-bold h-9"
                                >
                                    <option value="" className="bg-slate-900">اختر موظفاً...</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id} className="bg-slate-900">{emp.name}</option>)}
                                </select>
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 px-0.5">
                                <CalendarIcon className="w-2.5 h-2.5 text-emerald-400" />
                                التاريخ
                            </label>
                            <div className="relative group [&_button]:h-9 [&_button]:rounded-lg [&_button]:text-[10px]">
                                <RangeDateTimePicker
                                    value={dateRange}
                                    onChange={(val: DateTimeRange) => {
                                        setDateRange(val);
                                        if (val.start) setAttendanceDate((format as any)(val.start, "yyyy-MM-dd"));
                                    }}
                                    placeholder="اختر التاريخ..."
                                />
                            </div>
                        </div>
                    </div>

                    {dayPlan && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-2.5 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    <ClipboardIcon className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] text-primary font-black uppercase tracking-widest leading-none mb-0.5">الباقة المطبقة</span>
                                    <span className="text-[12px] font-black text-white">{dayPlan.name}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRecordShifts(prev => prev.map(s => ({ ...s, status: 'leave' })))}
                                className="px-2.5 py-1 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 border border-accent/20 flex items-center gap-1.5"
                            >
                                <span className="text-xs">🏝️</span>
                                إجازة اليوم
                            </button>
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-0.5">
                            <h3 className="text-sm font-black text-white flex items-center gap-2">
                                <div className="w-1 h-4 bg-primary rounded-full" />
                                تفاصيل الفترات
                            </h3>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{recordShifts.length} فترات مجدولة</span>
                        </div>

                        <div className="space-y-3">
                            {recordShifts.map((shift, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative p-4 bg-white/[0.02] rounded-xl border border-white/5 space-y-4 hover:bg-white/[0.04] transition-colors group/shift"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white font-black text-xs border border-white/5 shadow-lg group-hover/shift:bg-primary group-hover/shift:border-primary/50 transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest leading-none mb-0.5">الموعد המجدول</span>
                                                <span className="text-[12px] font-black text-white">{shift.start} - {shift.end}</span>
                                            </div>
                                        </div>

                                        <div className="relative overflow-hidden rounded-lg border border-white/5 bg-slate-950/40 focus-within:border-primary/50 transition-all min-w-[100px]">
                                            <select
                                                value={shift.status}
                                                onChange={(e) => updateShiftRecord(idx, 'status', e.target.value)}
                                                className="w-full bg-transparent border-none px-2.5 py-1 text-white focus:ring-0 outline-none appearance-none cursor-pointer text-[9px] font-bold pr-7 h-8"
                                            >
                                                <option value="present" className="bg-slate-900">✅ حاضر</option>
                                                <option value="absent" className="bg-slate-900">❌ غائب</option>
                                                <option value="late" className="bg-slate-900">⏰ متأخر</option>
                                                <option value="leave" className="bg-slate-900">🏖️ إجازة</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <ChevronDown className="w-2 h-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-0.5">الحضور الفعلي</label>
                                            <div className="relative group/input text-left">
                                                <input
                                                    type="time"
                                                    value={shift.checkIn}
                                                    onChange={(e) => updateShiftRecord(idx, 'checkIn', e.target.value)}
                                                    className="w-full bg-slate-950/40 border border-white/5 rounded-lg px-3 py-2 text-white outline-none focus:border-primary/50 transition-all text-xs font-black"
                                                />
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-hover/input:text-primary transition-colors">
                                                    <Clock className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-0.5">الانصراف الفعلي</label>
                                            <div className="relative group/input text-left">
                                                <input
                                                    type="time"
                                                    value={shift.checkOut}
                                                    onChange={(e) => updateShiftRecord(idx, 'checkOut', e.target.value)}
                                                    className="w-full bg-slate-950/40 border border-white/5 rounded-lg px-3 py-2 text-white outline-none focus:border-primary/50 transition-all text-xs font-black"
                                                />
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-hover/input:text-primary transition-colors">
                                                    <Clock className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {shift.missingMinutes > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-black/5"
                                        >
                                            <div className="flex items-center gap-3 text-amber-500">
                                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">تأخير / نقص</span>
                                                    <span className="text-xs font-black text-amber-500/90 leading-none">المطلوب تغطيته: <span className="text-sm">{shift.missingMinutes}</span> د</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">التغطية؟</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newVal = !shift.isCoveredByLeave;
                                                        updateShiftRecord(idx, 'isCoveredByLeave', newVal);
                                                        if (!newVal) updateShiftRecord(idx, 'delayCoverage', []);
                                                        else updateShiftRecord(idx, 'leaveTypeId', '');
                                                    }}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                                                        shift.isCoveredByLeave ? "bg-primary shadow-[0_0_12px_rgba(59,130,246,0.3)]" : "bg-slate-700"
                                                    )}
                                                >
                                                    <motion.div
                                                        layout
                                                        className="w-4 h-4 bg-white rounded-full shadow-lg"
                                                        animate={{ x: shift.isCoveredByLeave ? 0 : -24 }}
                                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {shift.status !== 'present' && !shift.isCoveredByLeave && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-4 mt-4 border-t border-white/5"
                                        >
                                            <label className="text-[9px] font-black text-accent uppercase tracking-widest px-1">تغطية الحالة برصيد إجازة</label>
                                            <div className="relative overflow-hidden rounded-xl border border-accent/20 bg-accent/5 focus-within:border-accent transition-all">
                                                <select
                                                    value={shift.leaveTypeId || ''}
                                                    onChange={(e) => {
                                                        const type = leaveTypes.find(t => t.id === e.target.value);
                                                        updateShiftRecord(idx, 'leaveTypeId', e.target.value);
                                                        updateShiftRecord(idx, 'leaveTypeName', type?.name || '');
                                                    }}
                                                    className="w-full bg-transparent border-none px-4 py-3 text-white focus:ring-0 outline-none appearance-none cursor-pointer text-xs font-bold pr-10"
                                                >
                                                    <option value="" className="bg-slate-900">-- لا توجد تغطية --</option>
                                                    {allocations
                                                        .filter(a => attendanceDate >= a.startDate && attendanceDate <= a.endDate)
                                                        .map(a => {
                                                            const remaining = balances[a.id] || 0;
                                                            const isDay = a.unit === 'days';
                                                            return (
                                                                <option key={a.id} value={a.typeId} className="bg-slate-900">
                                                                    {a.typeName} (متبقي: {isDay ? remaining.toFixed(2) : Math.round(remaining)} {isDay ? 'يوم' : 'د'})
                                                                </option>
                                                            );
                                                        })
                                                    }
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
                                                    <ChevronDown className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {shift.isCoveredByLeave && shift.missingMinutes > 0 && (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-accent">توزيع التغطية بالتفصيل:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentCoverage = shift.delayCoverage || [];
                                                        updateShiftRecord(idx, 'delayCoverage', [...currentCoverage, { typeId: '', typeName: '', mins: 0 }]);
                                                    }}
                                                    className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold"
                                                >
                                                    + إضافة نوع
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {(shift.delayCoverage || []).map((cov: any, cIdx: number) => (
                                                    <div key={cIdx} className="flex gap-2 items-center bg-slate-900/50 p-2 rounded-xl border border-white/5">
                                                        <select
                                                            value={cov.typeId}
                                                            onChange={(e) => {
                                                                const nextCovArr = [...shift.delayCoverage];
                                                                const type = allocations.find(t => t.typeId === e.target.value);
                                                                nextCovArr[cIdx] = { ...nextCovArr[cIdx], typeId: e.target.value, typeName: type?.typeName || '' };
                                                                updateShiftRecord(idx, 'delayCoverage', nextCovArr);
                                                            }}
                                                            className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0"
                                                        >
                                                            <option value="">اختر النوع...</option>
                                                            {allocations
                                                                .filter(a => attendanceDate >= a.startDate && attendanceDate <= a.endDate)
                                                                .map(a => {
                                                                    const remaining = balances[a.id] || 0;
                                                                    const isDay = a.unit === 'days';
                                                                    return (
                                                                        <option key={a.id} value={a.typeId}>
                                                                            {a.typeName} ({isDay ? remaining.toFixed(2) : Math.round(remaining)} {isDay ? 'يوم' : 'دقيقة'})
                                                                        </option>
                                                                    );
                                                                })
                                                            }
                                                        </select>
                                                        <input
                                                            type="number"
                                                            value={cov.mins}
                                                            onChange={(e) => {
                                                                const nextCovArr = [...shift.delayCoverage];
                                                                nextCovArr[cIdx] = { ...nextCovArr[cIdx], mins: parseInt(e.target.value) || 0 };
                                                                updateShiftRecord(idx, 'delayCoverage', nextCovArr);
                                                            }}
                                                            placeholder="دقائق"
                                                            className="w-20 bg-slate-800 border-none rounded-lg p-1.5 text-xs text-center"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const nextCovArr = shift.delayCoverage.filter((_: any, i: number) => i !== cIdx);
                                                                updateShiftRecord(idx, 'delayCoverage', nextCovArr);
                                                            }}
                                                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-black text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading ? 'جاري الحفظ...' : <span>تثبيت وتسجيل <Check className="w-4 h-4" /></span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold text-xs transition-all border border-white/5 active:scale-95"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}

