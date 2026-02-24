'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query } from 'firebase/firestore';
import SearchFilter from '@/components/SearchFilter';
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
    ChevronDown,
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchInitialData(parsedUser.uid);
        }
    }, []);

    const fetchInitialData = async (uid: string) => {
        setLoading(true);
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
    }, [selectedEmpId]);

    const leaveSummary = useMemo(() => {
        if (!selectedEmpId) return [];

        const empAllocations = allocations.filter(a => a.employeeId === selectedEmpId);
        const empUsage: LeaveUsage[] = [];

        attendanceRecords.forEach(record => {
            if (record.shifts && Array.isArray(record.shifts)) {
                record.shifts.forEach((shift: any, idx: number) => {
                    const delayCoverage = shift.delayCoverage || [];
                    if (shift.isCoveredByLeave && delayCoverage.length > 0) {
                        delayCoverage.forEach((cov: any) => {
                            if (!cov.typeId) return;
                            const alloc = empAllocations.find(a => a.typeId === cov.typeId && record.date >= a.startDate && record.date <= a.endDate);
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
                        const alloc = empAllocations.find(a => a.typeId === shift.leaveTypeId && record.date >= a.startDate && record.date <= a.endDate);
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
            const used = empUsage
                .filter(u => u.leaveTypeId === alloc.typeId && u.date >= alloc.startDate && u.date <= alloc.endDate)
                .reduce((sum, u) => sum + u.amount, 0);

            return {
                ...alloc,
                used: used,
                remaining: alloc.amount - used,
                usageHistory: empUsage.filter(u => u.leaveTypeId === alloc.typeId && u.date >= alloc.startDate && u.date <= alloc.endDate)
            };
        });
    }, [selectedEmpId, allocations, attendanceRecords]);

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
                            أرصدة واستهلاك الإجازات
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            نظام متطور لمتابعة الأرصدة المتبقية والاستهلاكات التفصيلية لكل موظف بكفاءة
                            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        </p>
                    </div>

                    <div className="relative group min-w-[280px]">
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                            <User className="w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pr-9 pl-9 py-2 text-xs text-white font-bold hover:border-blue-500/30 focus:border-blue-500 focus:ring-4 ring-blue-500/10 outline-none appearance-none transition-all cursor-pointer shadow-inner"
                        >
                            <option value="">-- اختر موظف من القائمة --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id} className="bg-slate-900">{emp.name} ({emp.jobId})</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                    </div>
                </motion.header>

                <AnimatePresence mode="wait">
                    {!selectedEmpId ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="py-16 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                                    <Box className="w-8 h-8" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500 shadow-xl">
                                    <Info className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-white">انتظار اختيار الموظف</h2>
                                <p className="text-slate-500 font-bold text-xs max-w-[240px] mx-auto">يرجى اختيار موظف من القائمة العلوية لعرض التقرير.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {leaveSummary.length === 0 ? (
                                    <div className="col-span-full py-20 glass rounded-[32px] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-slate-600 gap-4">
                                        <History className="w-12 h-12" />
                                        <p className="font-black text-lg text-slate-500">لا يوجد رصيد إجازات مخصص لهذا الموظف حالياً في النظام</p>
                                    </div>
                                ) : (
                                    leaveSummary.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group glass p-5 rounded-xl border border-white/5 hover:border-blue-500/20 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                                        >
                                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{item.typeName}</h3>
                                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                                            {item.startDate} ← {item.endDate}
                                                        </div>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <PieChart className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter block text-center">المخصص</span>
                                                        <div className="text-center font-black text-white text-base tracking-tighter">{item.amount}<span className="text-[8px] text-slate-700 mr-0.5">{item.unit === 'minutes' ? 'د' : 'ي'}</span></div>
                                                    </div>
                                                    <div className="space-y-0.5 border-x border-white/5">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter block text-center">المستهلك</span>
                                                        <div className="text-center font-black text-amber-500 text-base tracking-tighter">{item.used.toFixed(1)}<span className="text-[8px] text-amber-500/50 mr-0.5">{item.unit === 'minutes' ? 'د' : 'ي'}</span></div>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter block text-center">المتبقي</span>
                                                        <div className="text-center font-black text-emerald-500 text-base tracking-tighter">{item.remaining.toFixed(1)}<span className="text-[8px] text-emerald-500/50 mr-0.5">{item.unit === 'minutes' ? 'د' : 'ي'}</span></div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                        <span className="text-slate-500">نسبة الاستهلاك</span>
                                                        <span className="text-blue-500">{((item.used / item.amount) * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, (item.used / item.amount) * 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Detailed History Table */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <TrendingDown className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-white uppercase tracking-tight">سجل الاستهلاك</h3>
                                            <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest">تتبع دقيق لكل استهلاك من الرصيد</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 px-3 py-0.5 rounded-full border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        {leaveSummary.flatMap(s => s.usageHistory).length} سجل
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/5">
                                                <th className="px-6 py-3 text-slate-500 font-bold text-[9px] uppercase tracking-widest text-right">التاريخ</th>
                                                <th className="px-6 py-3 text-slate-500 font-bold text-[9px] uppercase tracking-widest text-right">الفئة</th>
                                                <th className="px-6 py-3 text-slate-500 font-bold text-[9px] uppercase tracking-widest text-right">الفترة</th>
                                                <th className="px-6 py-3 text-slate-500 font-bold text-[9px] uppercase tracking-widest text-right">الكمية</th>
                                                <th className="px-6 py-3 text-slate-500 font-bold text-[9px] uppercase tracking-widest text-center">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {leaveSummary.every(s => s.usageHistory.length === 0) ? (
                                                <tr>
                                                    <td colSpan={5} className="py-24 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-600 gap-4">
                                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                                <CheckCircle2 className="w-8 h-8" />
                                                            </div>
                                                            <p className="font-bold">لا توجد عمليات استهلاك مسجلة حتى الآن</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                leaveSummary.flatMap(s => s.usageHistory).sort((a, b) => b.date.localeCompare(a.date)).map((usage, idx) => (
                                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                                        <td className="px-6 py-2.5 font-bold text-white group-hover:text-blue-500 transition-colors text-xs">
                                                            {usage.date}
                                                        </td>
                                                        <td className="px-6 py-2.5">
                                                            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/10 text-[8px] font-bold text-blue-400 uppercase">
                                                                <ArrowDownLeft className="w-2.5 h-2.5" />
                                                                {usage.leaveTypeName}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2.5 font-bold text-slate-500 uppercase text-[9px]">
                                                            فترة {usage.shiftIndex + 1}
                                                        </td>
                                                        <td className="px-6 py-2.5 font-black text-sm text-amber-500 tracking-tighter">
                                                            {usage.amount.toFixed(1)}
                                                            <span className="text-[8px] text-slate-700 mr-1 uppercase">{usage.unit === 'minutes' ? 'د' : 'ي'}</span>
                                                        </td>
                                                        <td className="px-6 py-2.5">
                                                            <div className="flex justify-center">
                                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
