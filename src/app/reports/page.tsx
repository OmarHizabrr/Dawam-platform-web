'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Printer,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    Calendar as CalendarIcon,
    Search,
    Info,
    User,
    BarChart3,
    ArrowUpRight,
    Download,
    Share2,
    Filter,
    Layers,
    PieChart,
    Target,
    Zap,
    History,
    FileSpreadsheet,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';
import RangeDateTimePicker from '@/components/ui/RangeDateTimePicker';
import { startOfMonth, endOfMonth, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { exportToCSV } from '@/lib/exportUtils';

export default function ReportsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [allAttendance, setAllAttendance] = useState<any[]>([]);
    const [allSalaries, setAllSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });
    const [searchQuery, setSearchQuery] = useState('');

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
        setLoading(true);

        const empCol = collection(db, "employees", uid, "employees");
        onSnapshot(query(empCol), (snap) => {
            const emps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(emps);

            emps.forEach(emp => {
                const attCol = collection(db, "attendance", emp.id, "attendance");
                onSnapshot(query(attCol), (attSnap) => {
                    const records = attSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, employeeId: emp.id }));
                    setAllAttendance(prev => {
                        const filtered = prev.filter(r => r.employeeId !== emp.id);
                        return [...filtered, ...records];
                    });
                });
            });
        });

        const salCol = collection(db, "salaries", uid, "salaries");
        onSnapshot(query(salCol), (snap) => {
            setAllSalaries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
    };

    const aggregatedData = useMemo(() => {
        const start = dateRange.start || new Date(0);
        const end = dateRange.end || new Date();
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');

        return employees.map(emp => {
            const empAtt = allAttendance.filter(r => {
                if (r.employeeId !== emp.id || !r.date) return false;
                const rDate = parseISO(r.date);
                return isWithinInterval(rDate, { start: startOfDay(start), end: endOfDay(end) });
            });

            const empSal = allSalaries.filter(s => {
                if (s.employeeId !== emp.id || !s.paymentDate) return false;
                const sDate = parseISO(s.paymentDate);
                return isWithinInterval(sDate, { start: startOfDay(start), end: endOfDay(end) });
            });

            let presentShifts = 0;
            let absentShifts = 0;
            let leaveShifts = 0;
            let lateShifts = 0;
            let totalShifts = 0;

            empAtt.forEach(record => {
                if (record.shifts && Array.isArray(record.shifts)) {
                    record.shifts.forEach((s: any) => {
                        totalShifts++;
                        if (s.status === 'present') presentShifts++;
                        else if (s.status === 'absent') absentShifts++;
                        else if (s.status === 'leave') leaveShifts++;
                        else if (s.status === 'late') lateShifts++;
                    });
                }
            });

            const totalPaid = empSal.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

            return {
                ...emp,
                stats: {
                    workingDays: empAtt.length,
                    presentShifts,
                    absentShifts,
                    leaveShifts,
                    lateShifts,
                    totalShifts,
                    totalPaid
                }
            };
        }).filter(item =>
            searchQuery === '' ||
            (item.name && item.name.includes(searchQuery)) ||
            (item.jobId && item.jobId.includes(searchQuery))
        );
    }, [employees, allAttendance, allSalaries, dateRange, searchQuery]);

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        const exportData = aggregatedData.map(item => ({
            'اسم الموظف': item.name,
            'المعرف الوظيفي': item.jobId || 'N/A',
            'إجمالي أيام التواجد': item.stats.workingDays,
            'حضور (وردية)': item.stats.presentShifts,
            'تأخير (وردية)': item.stats.lateShifts,
            'غياب (وردية)': item.stats.absentShifts,
            'إجازة (وردية)': item.stats.leaveShifts,
            'إجمالي الورديات': item.stats.totalShifts,
            'إجمالي المستحقات المدفوعة': item.stats.totalPaid
        }));

        const startStr = dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : 'start';
        const endStr = dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : 'end';

        exportToCSV(exportData, `Report_${startStr}_to_${endStr}`);
    };

    if (!mounted) return null;

    return (
        <DashboardLayout>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                    .print-header { display: block !important; }
                    .report-container { width: 100% !important; margin: 0 !important; padding: 0 !important; max-width: none !important; }
                    table { width: 100% !important; border-collapse: collapse !important; border: 2px solid #000 !important; }
                    th { background: #f1f5f9 !important; color: #000 !important; border: 1px solid #000 !important; padding: 12px 8px !important; font-size: 10pt !important; font-weight: 900 !important; text-align: right !important; }
                    td { border: 1px solid #cbd5e1 !important; color: #000 !important; padding: 10px 8px !important; font-size: 9pt !important; text-align: right !important; font-weight: 500 !important; }
                    .text-emerald-500, .text-rose-500, .text-primary, .text-amber-500 { color: black !important; font-weight: 900 !important; }
                    .print-badge { border: 1px solid #000 !important; border-radius: 4px !important; padding: 2px 6px !important; }
                }
            `}</style>

            <PageHeader
                title="المحرك التحليلي للتقارير"
                subtitle="استقراء بيانات الأداء، الانضباط التشغيلي، والتدفقات المالية للهوية المؤسسية."
                icon={PieChart}
                breadcrumb="نظام التقارير"
                actions={
                    <div className="flex items-center gap-3 no-print">
                        <button
                            onClick={handlePrint}
                            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95 group"
                        >
                            <Printer className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                            <span>تصدير التقرير الرسمي</span>
                        </button>
                    </div>
                }
            />

            {/* Print Identity Layer */}
            <div className="hidden print:block text-right border-b-[5px] border-slate-950 pb-12 mb-12">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-950 tracking-tighter">منصة دوام الرقمية</h1>
                        <p className="text-[12px] text-slate-600 font-black uppercase tracking-[0.3em]">Institutional Resilience Engine</p>
                    </div>
                    <div className="text-left space-y-2">
                        <div className="text-[14px] font-black text-slate-950">إصدار التقارير: {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}</div>
                        <div className="text-[10px] text-slate-500 font-mono">UID_AUTH: {user?.uid?.slice(0, 12)}...</div>
                    </div>
                </div>
                <div className="bg-slate-100 p-8 rounded-[2rem] border-2 border-slate-200">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 text-center underline decoration-slate-300 underline-offset-8">بيان الأداء الوظيفي والاستحقاقات التفصيلي</h2>
                    <div className="flex justify-center gap-12">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">فترة التقرير</span>
                            <span className="text-[16px] font-black text-slate-900">{format(dateRange.start || new Date(), 'dd MMMM yyyy')} - {format(dateRange.end || new Date(), 'dd MMMM yyyy')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Intelligence Layer (Filters) */}
            <AppCard padding="none" className="mb-10 border-white/5 shadow-2xl relative z-40 no-print surface-deep overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-6 md:p-8 flex flex-col lg:flex-row items-end gap-6 relative z-10">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            محرك البحث المتقدم
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث بالاسم، الرقم الوظيفي، أو المسمى الإداري..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-[480px] group">
                        <label className="text-meta mb-2 block px-1 flex items-center gap-2">
                            النطاق الزمني للتحليل الإحصائي
                        </label>
                        <RangeDateTimePicker
                            value={dateRange}
                            onChange={(val) => setDateRange(val)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 lg:w-11 lg:h-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-90 group shadow-lg"
                            title="تصدير بيانات Excel"
                        >
                            <FileSpreadsheet className="w-4.5 h-4.5 group-hover:scale-110 transition-transform text-emerald-500" />
                        </button>
                        <button className="flex-1 lg:w-11 lg:h-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-90 group shadow-lg" title="مشاركة النتائج">
                            <Share2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform text-primary" />
                        </button>
                    </div>
                </div>
            </AppCard>

            {/* Reporting Ledger Section */}
            <AppCard padding="none" className="overflow-hidden border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] mb-12 surface-deep rounded-[3rem]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-10 py-6 text-right font-black text-[10px] text-slate-600 uppercase tracking-[0.3em]">بيانات الاعتماد الوظيفية</th>
                                <th className="px-10 py-6 text-right font-black text-[10px] text-slate-600 uppercase tracking-[0.3em]">تحليل التواجد التشغيلي</th>
                                <th className="px-10 py-6 text-right font-black text-[10px] text-slate-600 uppercase tracking-[0.3em] min-w-[300px]">توزيع الفترات الزمنية</th>
                                <th className="px-10 py-6 text-right font-black text-[10px] text-slate-600 uppercase tracking-[0.3em]">العوائد المالية</th>
                                <th className="px-10 py-6 text-center font-black text-[10px] text-slate-600 uppercase tracking-[0.3em]">مؤشر الكفاءة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            <AnimatePresence mode="popLayout">
                                {aggregatedData.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <td colSpan={5} className="px-10 py-48 text-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/2 rounded-full blur-[160px] pointer-events-none" />
                                            <div className="flex flex-col items-center gap-10 relative z-10">
                                                <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                                        className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity"
                                                    />
                                                    <Target className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                                                </div>
                                                <div className="text-center space-y-3">
                                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">نتائج تحليلية منعدمة</h3>
                                                    <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">يرجى معايرة النطاق الزمني أو معايير البحث الإحصائي لاستخلاص البيانات المطلوبة.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    aggregatedData.map((emp, idx) => (
                                        <motion.tr
                                            key={emp.id}
                                            initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                                            className="group hover:bg-primary/[0.02] transition-colors relative"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/30 to-slate-900 border border-primary/20 flex items-center justify-center text-white font-black text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
                                                        {emp.name?.charAt(0)}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="text-[18px] font-black text-white tracking-tighter group-hover:text-primary transition-colors leading-none">{emp.name}</div>
                                                        <div className="text-[11px] text-slate-600 font-black uppercase tracking-[0.2em]">{emp.jobId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/10 inline-flex items-center gap-3 transition-all group-hover:bg-emerald-500/20 group-hover:translate-x-[-5px]">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                                                    <span className="text-[14px] font-black text-emerald-400 tabular-nums">{emp.stats.workingDays} يوم حضور</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    {[
                                                        { val: emp.stats.presentShifts, label: 'حضور', color: 'text-emerald-500' },
                                                        { val: emp.stats.absentShifts, label: 'غياب', color: 'text-rose-500' },
                                                        { val: emp.stats.leaveShifts, label: 'إجازة', color: 'text-primary' },
                                                        { val: emp.stats.lateShifts, label: 'تأخير', color: 'text-amber-500' }
                                                    ].map((st, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-1.5 group/stat">
                                                            <span className="text-[20px] font-black text-white tabular-nums tracking-tighter group-hover/stat:scale-125 transition-transform">{st.val}</span>
                                                            <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-60", st.color)}>{st.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[24px] font-black text-white tracking-tighter tabular-nums">{emp.stats.totalPaid.toLocaleString()}</span>
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">S.R</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-emerald-500/60 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                                        <Zap className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Disbursed</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "px-6 py-3 rounded-[1.5rem] text-[12px] font-black text-center min-w-[150px] border shadow-2xl flex items-center justify-center gap-3 transition-all duration-700",
                                                        emp.stats.absentShifts > 3
                                                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/10 group-hover:bg-rose-500 group-hover:text-white"
                                                            : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-emerald-400/10 group-hover:bg-emerald-400 group-hover:text-white"
                                                    )}>
                                                        {emp.stats.absentShifts > 3 ? (
                                                            <>
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span className="uppercase tracking-widest">Alert Profile</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck className="w-4 h-4" />
                                                                <span className="uppercase tracking-widest">Optimal Performance</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </AppCard>

            {/* AI Insights & Analytical Narrative Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <AppCard padding="none" className="overflow-hidden border-white/5 relative bg-gradient-to-br from-primary/10 via-transparent to-transparent group">
                    <div className="p-10 flex items-center gap-10 relative z-10">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                            <TrendingUp className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tighter">تقرير الاتجاهات والأنماط</h3>
                            <p className="text-meta !text-[12px] uppercase tracking-widest opacity-60">تعتمد الخوارزمية معايير الانضباط اللحظية لتوليد تقارير أداء دقيقة.</p>
                            <button className="text-[11px] font-black text-primary hover:text-white flex items-center gap-2 uppercase tracking-[0.3em] pt-2 transition-colors">
                                فتح لوحة الذكاء <ChevronLeft className="w-4 h-4 translate-y-0.5" />
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                </AppCard>

                <AppCard padding="none" className="overflow-hidden border-white/5 relative bg-gradient-to-br from-amber-500/5 via-transparent to-transparent group">
                    <div className="p-10 flex items-center gap-10 relative z-10">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl group-hover:scale-110 group-hover:rotate-[-6deg] transition-all duration-700">
                            <Layers className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tighter">أرشفة البيانات الضخمة</h3>
                            <p className="text-meta !text-[12px] uppercase tracking-widest opacity-60">جميع التقارير تتم فهرستها وتشفيرها لضمان الوصول السريع للبيانات التاريخية.</p>
                            <button className="text-[11px] font-black text-amber-500 hover:text-white flex items-center gap-2 uppercase tracking-[0.3em] pt-2 transition-colors">
                                استعراض الأرشيف الرقمي <ChevronLeft className="w-4 h-4 translate-y-0.5" />
                            </button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                </AppCard>
            </div>
        </DashboardLayout>
    );
}
