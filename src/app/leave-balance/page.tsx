'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    User,
    Calendar,
    Clock,
    History,
    TrendingDown,
    CheckCircle2,
    Info,
    Tag,
    ChevronDown,
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    Box,
    Sparkles,
    Activity,
    UserCheck,
    Briefcase,
    Zap,
    Layers,
    ShieldCheck
} from 'lucide-react';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

interface LeaveUsage {
    date: string;
    shiftIndex: number;
    leaveTypeId: string;
    leaveTypeName: string;
    amount: number;
    unit: string;
    note?: string;
}

export default function LeaveBalancePage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [loading, setLoading] = useState(true);

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
        const empCol = collection(db, "employees", uid, "employees");
        onSnapshot(query(empCol), (snap) => {
            setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const typesCol = collection(db, "leaveTypes", uid, "types");
        onSnapshot(query(typesCol), (snap) => {
            setLeaveTypes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const allocCol = collection(db, "leaveAllocations", uid, "allocations");
        onSnapshot(query(allocCol), (snap) => {
            setAllocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        setLoading(false);
    };

    useEffect(() => {
        if (!selectedEmpId) {
            setAttendanceRecords([]);
            return;
        }

        const attCol = collection(db, "attendance", selectedEmpId, "attendance");
        const unsub = onSnapshot(query(attCol), (snap) => {
            setAttendanceRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsub();
        return () => unsub();
    }, [selectedEmpId]);

    const leaveSummary = useMemo(() => {
        if (!selectedEmpId) return [];

        const empAllocations = allocations.filter(a => a.employeeId === selectedEmpId);
        const empUsage: LeaveUsage[] = [];

        attendanceRecords.forEach(record => {
            if (record.date && record.shifts && Array.isArray(record.shifts)) {
                const recordDate = parseISO(record.date);
                record.shifts.forEach((shift: any, idx: number) => {
                    const delayCoverage = shift.delayCoverage || [];
                    if (shift.isCoveredByLeave && delayCoverage.length > 0) {
                        delayCoverage.forEach((cov: any) => {
                            if (!cov.typeId) return;
                            const alloc = empAllocations.find(a => {
                                if (a.typeId !== cov.typeId || !a.startDate || !a.endDate) return false;
                                const start = parseISO(a.startDate);
                                const end = parseISO(a.endDate);
                                return isWithinInterval(recordDate, { start: startOfDay(start), end: endOfDay(end) });
                            });
                            const unit = alloc?.unit || 'days';
                            let amount = parseFloat(cov.mins) || 0;
                            if (unit === 'days') amount = amount / 480;
                            if (amount > 0) {
                                empUsage.push({
                                    date: record.date, shiftIndex: idx, leaveTypeId: cov.typeId, leaveTypeName: cov.typeName || 'غير معروف', amount: amount, unit: unit,
                                });
                            }
                        });
                    } else if (shift.leaveTypeId) {
                        const alloc = empAllocations.find(a => {
                            if (a.typeId !== shift.leaveTypeId || !a.startDate || !a.endDate) return false;
                            const start = parseISO(a.startDate);
                            const end = parseISO(a.endDate);
                            return isWithinInterval(recordDate, { start: startOfDay(start), end: endOfDay(end) });
                        });
                        let amount = 0;
                        let unit = alloc?.unit || 'days';
                        if (shift.isCoveredByLeave && shift.missingMinutes > 0) {
                            amount = parseFloat(shift.missingMinutes) || 0;
                            if (unit === 'days') amount = amount / 480;
                        } else if (shift.status !== 'present') {
                            if (unit === 'minutes') {
                                const start = shift.start || '00:00';
                                const end = shift.end || '00:00';
                                const [h1, m1] = start.split(':').map(Number);
                                const [h2, m2] = end.split(':').map(Number);
                                amount = (h2 * 60 + m2) - (h1 * 60 + m1);
                                if (amount < 0) amount += 24 * 60;
                            } else {
                                amount = 1 / record.shifts.length;
                            }
                        }
                        if (amount > 0) {
                            empUsage.push({
                                date: record.date, shiftIndex: idx, leaveTypeId: shift.leaveTypeId, leaveTypeName: shift.leaveTypeName || 'غير معروف', amount: amount, unit: unit,
                            });
                        }
                    }
                });
            }
        });

        return empAllocations.map(alloc => {
            if (!alloc.startDate || !alloc.endDate) return { ...alloc, used: 0, remaining: alloc.amount, usageHistory: [] };
            const allocStart = parseISO(alloc.startDate);
            const allocEnd = parseISO(alloc.endDate);
            const used = empUsage
                .filter(u => {
                    if (u.leaveTypeId !== alloc.typeId || !u.date) return false;
                    const uDate = parseISO(u.date);
                    return isWithinInterval(uDate, { start: startOfDay(allocStart), end: endOfDay(allocEnd) });
                })
                .reduce((sum, u) => sum + u.amount, 0);

            return {
                ...alloc,
                used: used,
                remaining: alloc.amount - used,
                usageHistory: empUsage.filter(u => {
                    if (u.leaveTypeId !== alloc.typeId || !u.date) return false;
                    const uDate = parseISO(u.date);
                    return isWithinInterval(uDate, { start: startOfDay(allocStart), end: endOfDay(allocEnd) });
                })
            };
        });
    }, [selectedEmpId, allocations, attendanceRecords]);

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <PageHeader
                title="مؤشرات استهلاك الأرصدة"
                subtitle="تحليل ذكي للحصص الزمنية المتبقية ومعدلات الاستهلاك الفعلي للموارد البشرية."
                icon={Activity}
                breadcrumb="المؤشرات التحليلية"
                actions={
                    <div className="relative group min-w-[340px]">
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                            <UserCheck className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-all" />
                        </div>
                        <select
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl pr-14 pl-12 text-[13px] font-black text-white hover:border-primary/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none appearance-none transition-all cursor-pointer shadow-2xl"
                        >
                            <option value="">-- يرجى اختيار الموظف المستهدف --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobId || 'بدون معرف'})</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <ChevronDown className="w-4.5 h-4.5 text-slate-500" />
                        </div>
                    </div>
                }
            />

            <AnimatePresence mode="wait">
                {!selectedEmpId ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="py-44 flex flex-col items-center justify-center text-center space-y-10 opacity-30"
                    >
                        <div className="w-40 h-40 rounded-[3.5rem] bg-slate-900 flex items-center justify-center border border-white/5 relative shadow-inner">
                            <Layers className="w-20 h-20 text-slate-500" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"
                            />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-white tracking-tight">بانتظار البيانات الإدخالية</h2>
                            <p className="text-meta !text-[12px] max-w-[400px] mx-auto leading-relaxed">قم باختيار الموظف من القائمة المنسدلة أعلاه لتوليد التقرير الزمني للأرصدة.</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                        {/* High-Fidelity Quota Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {leaveSummary.length === 0 ? (
                                <div className="col-span-full py-48 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden bg-slate-950/40 rounded-[3rem] border border-white/5 shadow-2xl">
                                    <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                                        />
                                        <Zap className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                                    </div>
                                    <div className="text-center space-y-3 relative z-10">
                                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">سجل الأرصدة معطل</h3>
                                        <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">لا يوجد سجل أرصدة مخصص لهذا الموظف حالياً. يرجى التوجه لوحدة تخصيص الأرصدة لتنشيط الحساب.</p>
                                    </div>
                                </div>
                            ) : (
                                leaveSummary.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <AppCard padding="none" className="group overflow-hidden border-white/5 shadow-2xl surface-deep relative h-full">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-16 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                            <div className="p-8 space-y-8 relative z-10">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tighter">{item.typeName}</h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tabular-nums">
                                                                {item.startDate} ← {item.endDate}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                        <PieChart className="w-7 h-7" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-6 p-6 rounded-[2rem] bg-slate-950/60 border border-white/5 shadow-inner">
                                                    <div className="text-center space-y-2">
                                                        <span className="text-meta !text-[9px] !text-slate-600">المخصص</span>
                                                        <div className="font-black text-white text-[20px] tracking-tighter tabular-nums">
                                                            {item.amount}
                                                            <span className="text-[11px] text-slate-700 mr-1">{item.unit === 'minutes' ? 'د' : 'ي'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center space-y-2 border-x border-white/5 px-2">
                                                        <span className="text-meta !text-[9px] !text-slate-600">المستهلك</span>
                                                        <div className="font-black text-rose-500 text-[20px] tracking-tighter tabular-nums">
                                                            {item.used.toFixed(1)}
                                                            <span className="text-[11px] opacity-40 mr-1">{item.unit === 'minutes' ? 'د' : 'ي'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <span className="text-meta !text-[9px] !text-slate-600">المتبقي</span>
                                                        <div className="font-black text-emerald-400 text-[20px] tracking-tighter tabular-nums">
                                                            {item.remaining.toFixed(1)}
                                                            <span className="text-[11px] opacity-40 mr-1">{item.unit === 'minutes' ? 'د' : 'ي'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <span className="text-meta !text-[10px]">معدل الاستنزاف</span>
                                                            <span className="text-[20px] font-black text-white tabular-nums tracking-tighter">{((item.used / item.amount) * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <Activity className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors animate-pulse" />
                                                    </div>
                                                    <div className="h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (item.used / item.amount) * 100)}%` }}
                                                            transition={{ duration: 2, ease: "circOut" }}
                                                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-8 py-5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">تحديث فوري</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">عرض التقرير</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </AppCard>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Transactional Ledger */}
                        <AppCard padding="none" className="overflow-hidden border-white/5 shadow-2xl surface-deep">
                            <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner">
                                        <History className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[20px] font-black text-white tracking-tighter uppercase">شريط الاستهلاك الزمني</h3>
                                        <p className="text-meta !text-[11px]">مراجعة كافة عمليات الخصم والتغطية الآلية المعتمجة.</p>
                                    </div>
                                </div>
                                <div className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-3">
                                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                                    <span className="text-[13px] font-black text-white tabular-nums">{leaveSummary.flatMap(s => s.usageHistory).length} سجل موثق</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.03] border-b border-white/5 text-right">
                                            <th className="px-10 py-6 text-meta">التاريخ الزمني</th>
                                            <th className="px-10 py-6 text-meta">المصدر المالي/الزمني</th>
                                            <th className="px-10 py-6 text-meta">نافذة العمل</th>
                                            <th className="px-10 py-6 text-meta">الخصم المحتسب</th>
                                            <th className="px-10 py-6 text-center text-meta">توثيق الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {leaveSummary.every(s => s.usageHistory.length === 0) ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-32 text-center">
                                                    <div className="flex flex-col items-center gap-8 opacity-20">
                                                        <Box className="w-20 h-20 text-slate-500" />
                                                        <div className="text-2xl font-black text-white tracking-tight leading-none">لم يتم تسجيل حركات استهلاك بالرصيد</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            leaveSummary.flatMap(s => s.usageHistory).sort((a, b) => b.date.localeCompare(a.date)).map((usage, idx) => (
                                                <tr key={idx} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-10 py-7">
                                                        <span className="text-[16px] font-black text-white tabular-nums tracking-tighter group-hover:text-primary transition-colors">
                                                            {usage.date}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/10 w-fit flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,1)]" />
                                                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">{usage.leaveTypeName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <span className="text-[13px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 leading-none">
                                                            <Sparkles className="w-4 h-4 text-slate-700" />
                                                            النوبة رقم {usage.shiftIndex + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-[20px] font-black text-rose-500 tracking-tighter tabular-nums">-{usage.amount.toFixed(1)}</span>
                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{usage.unit === 'minutes' ? 'دقيقة' : 'يوم'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-7">
                                                        <div className="flex justify-center">
                                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                                                                <CheckCircle2 className="w-5 h-5 shadow-2xl" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </AppCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
