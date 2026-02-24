'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query } from 'firebase/firestore';
import PeriodFilter from '@/components/PeriodFilter';
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
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [allAttendance, setAllAttendance] = useState<any[]>([]); // Flat list for all emps
    const [allSalaries, setAllSalaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterStartDate, setFilterStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [filterEndDate, setFilterEndDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });
    const [searchQuery, setSearchQuery] = useState('');

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
        return employees.map(emp => {
            const empAtt = allAttendance.filter(r =>
                r.employeeId === emp.id &&
                r.date >= filterStartDate &&
                r.date <= filterEndDate
            );

            const empSal = allSalaries.filter(s =>
                s.employeeId === emp.id &&
                s.paymentDate >= filterStartDate &&
                s.paymentDate <= filterEndDate
            );

            // Calc attendance stats
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
    }, [employees, allAttendance, allSalaries, filterStartDate, filterEndDate, searchQuery]);

    const handlePrint = () => {
        window.print();
    };

    if (!mounted || !user) return <div className="bg-[#0f172a] min-h-screen" />;

    return (
        <DashboardLayout>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-header { display: block !important; margin-bottom: 2rem; border-bottom: 2px solid #334155; padding-bottom: 1rem; }
                    .report-container { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    table { border: 1px solid #cbd5e1 !important; color: black !important; width: 100% !important; border-collapse: collapse !important; }
                    th { background: #f1f5f9 !important; color: black !important; border: 1px solid #cbd5e1 !important; padding: 12px !important; }
                    td { border: 1px solid #cbd5e1 !important; color: black !important; padding: 12px !important; }
                    .glass { background: transparent !important; border: none !important; backdrop-filter: none !important; box-shadow: none !important; }
                    .text-slate-400, .text-slate-500 { color: #64748b !important; }
                    .bg-white\\/5 { background: transparent !important; }
                }
            `}</style>

            <div className="report-container max-w-7xl mx-auto px-4 py-8">
                <motion.header
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="no-print flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
                >
                    <div>
                        <h1 className="text-xl font-black mb-1 bg-gradient-to-l from-white to-white/60 bg-clip-text text-transparent">
                            التقارير الشهرية
                        </h1>
                        <p className="text-[9px] text-slate-500 font-medium flex items-center gap-1.5">
                            تحليل شامل للحضور والأداء المالي والملاحظات الإدارية
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                    >
                        <Printer className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>طباعة التقرير الشامل</span>
                    </button>
                </motion.header>

                <div className="hidden print:block text-center border-b-2 border-slate-900 pb-8 mb-12">
                    <h1 className="text-3xl font-black mb-2">منصة دوام لإدارة الموارد البشرية</h1>
                    <p className="text-lg text-slate-600 font-bold">تقرير أداء الموظفين التفصيلي</p>
                    <div className="flex justify-center gap-12 mt-6">
                        <div className="text-sm font-bold bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                            الفترة: {filterStartDate} إلى {filterEndDate}
                        </div>
                        <div className="text-sm font-bold bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                            تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}
                        </div>
                    </div>
                </div>

                <div className="no-print">
                    <PeriodFilter
                        startDate={filterStartDate}
                        endDate={filterEndDate}
                        onStartChange={setFilterStartDate}
                        onEndChange={setFilterEndDate}
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="بحث عن موظف بالاسم أو الرقم الوظيفي..."
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
                                <tr className="bg-white/5 border-b border-white/5 print:bg-slate-50">
                                    <th className="px-5 py-3 text-slate-600 font-bold text-[9px] uppercase tracking-widest print:text-black">الموظف</th>
                                    <th className="px-5 py-3 text-slate-600 font-bold text-[9px] uppercase tracking-widest print:text-black">أيام الحضور</th>
                                    <th className="px-5 py-3 text-slate-600 font-bold text-[9px] uppercase tracking-widest print:text-black">ملخص الفترات (ح/غ/إ/م)</th>
                                    <th className="px-5 py-3 text-slate-600 font-bold text-[9px] uppercase tracking-widest print:text-black">المستحقات</th>
                                    <th className="px-5 py-3 text-slate-600 font-bold text-[9px] uppercase tracking-widest text-center print:text-black">التقييم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 print:divide-slate-200">
                                <AnimatePresence mode="popLayout">
                                    {aggregatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-600 gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-700">
                                                        <Info className="w-8 h-8" />
                                                    </div>
                                                    <p className="font-bold text-base">لا توجد بيانات متاحة بالفترة المختارة</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        aggregatedData.map((emp, idx) => (
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="group hover:bg-white/[0.02] transition-colors print:hover:bg-transparent"
                                            >
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] print:hidden">
                                                            {emp.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-primary transition-colors text-xs print:text-black">{emp.name}</div>
                                                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{emp.jobId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                                                        <span className="text-[10px] font-black text-emerald-400 print:text-black">{emp.stats.workingDays} يوم</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-white print:text-black">{emp.stats.presentShifts}</span>
                                                            <span className="text-[6.5px] font-black text-emerald-500 uppercase">حضور</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-white/5 print:bg-slate-200" />
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-white print:text-black">{emp.stats.absentShifts}</span>
                                                            <span className="text-[6.5px] font-black text-rose-500 uppercase">غياب</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-white/5 print:bg-slate-200" />
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-white print:text-black">{emp.stats.leaveShifts}</span>
                                                            <span className="text-[6.5px] font-black text-primary uppercase">إجازة</span>
                                                        </div>
                                                        <div className="w-px h-4 bg-white/5 print:bg-slate-200" />
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-black text-white print:text-black">{emp.stats.lateShifts}</span>
                                                            <span className="text-[6.5px] font-black text-amber-500 uppercase">تأخير</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-black text-white tracking-tighter print:text-black">{emp.stats.totalPaid.toLocaleString()}</span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase">ريال</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <div className={cn(
                                                            "px-3 py-1.5 rounded-lg text-[9px] font-black text-center min-w-[90px] border shadow-sm",
                                                            emp.stats.absentShifts > 3
                                                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        )}>
                                                            {emp.stats.absentShifts > 3 ? (
                                                                <span className="flex items-center justify-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" /> مراجعة
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> منتظم
                                                                </span>
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
                </motion.div>

                <div className="no-print mt-10 glass p-5 rounded-xl border-white/5 flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white">إحصائيات ذكية</h3>
                            <p className="text-slate-500 text-[10px] font-medium">يتم احتساب التقييم بناءً على خوارزمية الحضور والغياب المتقدمة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-5 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold transition-all border border-white/5 active:scale-95 text-[10px]">
                            تصدير Excel
                        </button>
                        <button className="px-5 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold transition-all border border-white/5 active:scale-95 text-[10px]">
                            تصدير PDF
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
