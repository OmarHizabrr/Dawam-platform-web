'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query, where, getDocs, collectionGroup, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    CircleDollarSign,
    Hourglass,
    ShieldCheck,
    TrendingUp,
    PieChart,
    Plus,
    Settings,
    LayoutDashboard,
    ArrowUpRight,
    Activity,
    LineChart,
    BarChart,
    Wallet,
    CalendarCheck,
    Briefcase
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';
import { cn } from '@/lib/utils';

export default function StatsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalSalaries: 0,
        totalSalaryAmount: 0,
        totalAdmins: 0,
        totalLeaveTypes: 0,
        totalAllocations: 0,
        totalCurrencies: 0,
    });
    const [loading, setLoading] = useState(true);
    const [attendanceDist, setAttendanceDist] = useState({ present: 0, absent: 0, late: 0, leave: 0, total: 0 });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // 1. Employees Count
                const employeesRef = collection(db, "employees", parsedUser.uid, "employees");
                const unsubEmp = onSnapshot(employeesRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalEmployees: snapshot.size }));
                });

                // 2. Salaries Aggregation (Using collectionGroup for cross-employee data)
                const salariesRef = query(collectionGroup(db, "salarys"), where("createdBy", "==", parsedUser.uid));
                const unsubSal = onSnapshot(salariesRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalSalaries: snapshot.size }));
                    let total = 0;
                    snapshot.docs.forEach(doc => {
                        const data = doc.data() as any;
                        total += (parseFloat(data.amount) || 0);
                    });
                    setStats(prev => ({ ...prev, totalSalaryAmount: total }));
                });

                // 3. Admins Count
                const adminsRef = collection(db, "admins", parsedUser.uid, "admins");
                const unsubAdmins = onSnapshot(adminsRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalAdmins: snapshot.size }));
                });

                // 4. Leave Allocations
                const allocationsRef = collection(db, "leaveAllocations", parsedUser.uid, "allocations");
                const unsubAlloc = onSnapshot(allocationsRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalAllocations: snapshot.size }));
                });

                // 5. Leave Types
                const leaveTypesRef = collection(db, "leaveTypes", parsedUser.uid, "types");
                const unsubTypes = onSnapshot(leaveTypesRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalLeaveTypes: snapshot.size }));
                });

                // 6. Currencies
                const currenciesRef = collection(db, "currencies", parsedUser.uid, "currencies");
                const unsubCurr = onSnapshot(currenciesRef, (snapshot) => {
                    setStats(prev => ({ ...prev, totalCurrencies: snapshot.size }));
                });

                // 7. Attendance Distribution
                const attendanceRef = query(collectionGroup(db, "attendance"), where("createdBy", "==", parsedUser.uid));
                const unsubAtt = onSnapshot(attendanceRef, (snapshot) => {
                    let dist = { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
                    snapshot.docs.forEach(doc => {
                        const data = doc.data();
                        if (data.shifts && Array.isArray(data.shifts)) {
                            data.shifts.forEach((s: any) => {
                                dist.total++;
                                if (s.status === 'present') dist.present++;
                                else if (s.status === 'absent') dist.absent++;
                                else if (s.status === 'late') dist.late++;
                                else if (s.status === 'leave') dist.leave++;
                            });
                        }
                    });
                    setAttendanceDist(dist);

                    // Add to Recent Activity
                    const latestAtt = snapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as any))
                        .sort((a, b) => (b.createTimes?.toDate().getTime() || 0) - (a.createTimes?.toDate().getTime() || 0))
                        .slice(0, 3)
                        .map(data => ({
                            id: data.id,
                            type: 'attendance',
                            title: 'تسجيل حالة دوام',
                            desc: `تحديث سجل حضور للموظف`,
                            time: data.createTimes?.toDate(),
                            icon: CalendarCheck
                        }));
                    updateRecentActivities(latestAtt, 'attendance');
                });

                // 8. Recent Activity Feed Listeners
                const employeesFeedQuery = query(collectionGroup(db, "employees"), where("createdBy", "==", parsedUser.uid), orderBy("createTimes", "desc"), limit(5));
                const salariesFeedQuery = query(collectionGroup(db, "salarys"), where("createdBy", "==", parsedUser.uid), orderBy("createTimes", "desc"), limit(5));
                const allocationsFeedQuery = query(collectionGroup(db, "leaveAllocations"), where("createdBy", "==", parsedUser.uid), orderBy("createTimes", "desc"), limit(5));

                const unsubFeedEmp = onSnapshot(employeesFeedQuery, (snapshot) => {
                    const acts = snapshot.docs.map(doc => {
                        const data = doc.data() as any;
                        return {
                            id: doc.id,
                            type: 'employee',
                            title: 'إضافة موظف جديد',
                            desc: `تم إضافة ${data.name} للنظام`,
                            time: data.createTimes?.toDate(),
                            icon: Users
                        };
                    });
                    updateRecentActivities(acts, 'employee');
                });

                const unsubFeedSal = onSnapshot(salariesFeedQuery, (snapshot) => {
                    const acts = snapshot.docs.map(doc => {
                        const data = doc.data() as any;
                        return {
                            id: doc.id,
                            type: 'salary',
                            title: 'صرف مستحق مالي',
                            desc: `تم صرف ${data.amount} ${data.currency}`,
                            time: data.createTimes?.toDate(),
                            icon: CircleDollarSign
                        };
                    });
                    updateRecentActivities(acts, 'salary');
                });

                const unsubFeedAlloc = onSnapshot(allocationsFeedQuery, (snapshot) => {
                    const acts = snapshot.docs.map(doc => {
                        const data = doc.data() as any;
                        return {
                            id: doc.id,
                            type: 'allocation',
                            title: 'تخصيص رصيد إجازة',
                            desc: `تحديث أرصدة الإجازات السنوية`,
                            time: data.createTimes?.toDate(),
                            icon: Hourglass
                        };
                    });
                    updateRecentActivities(acts, 'allocation');
                });

                setLoading(false);
                return () => {
                    unsubEmp();
                    unsubSal();
                    unsubAdmins();
                    unsubAlloc();
                    unsubTypes();
                    unsubCurr();
                    unsubAtt();
                    unsubFeedEmp();
                    unsubFeedSal();
                    unsubFeedAlloc();
                };
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const updateRecentActivities = (newActs: any[], category: string) => {
        setRecentActivities(prev => {
            const filtered = prev.filter(a => a.type !== category);
            const merged = [...filtered, ...newActs].sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0));
            return merged.slice(0, 6); // More slots for richness
        });
    }

    if (!mounted) return null;

    const kpiData = [
        { label: 'إجمالي الموظفين', value: stats.totalEmployees, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'نشط', sub: 'موظف' },
        { label: 'إجمالي النقدي المصروف', value: stats.totalSalaryAmount.toLocaleString(), icon: CircleDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'محاسبي', sub: 'إجمالي' },
        { label: 'تخصيصات الإجازة', value: stats.totalAllocations, icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: 'إدارة', sub: 'طلب' },
        { label: 'المركونات الأمنية', value: stats.totalAdmins, icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-500/10', trend: 'أمان', sub: 'مسؤول' },
    ];

    return (
        <DashboardLayout>
            <PageHeader
                title="لوحة التحكم المركزية"
                subtitle="نظرة استراتيجية شاملة على أداء الموارد البشرية والعمليات المالية للمؤسسة."
                icon={Activity}
                breadcrumb="نظام دوام"
            />

            <div className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {kpiData.map((kpi, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <AppCard className="group relative overflow-hidden h-full border-white/5 shadow-2xl">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner", kpi.bg, kpi.color)}>
                                        <kpi.icon className="w-7 h-7" />
                                    </div>
                                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.trend}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-meta">{kpi.label}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white tracking-tighter leading-none">
                                            {kpi.value}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{kpi.sub}</span>
                                    </div>
                                </div>
                                {/* Technical Background Polish */}
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <kpi.icon className="w-full h-full" />
                                </div>
                            </AppCard>
                        </motion.div>
                    ))}
                </div>

                {/* Analytical Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <AppCard className="h-full border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">توزيع الحضور والغياب</h3>
                                    <p className="text-meta mt-1">المعدل التشغيلي لهذا الأسبوع</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="h-11 px-5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 leading-none">الأسبوعي</button>
                                    <button className="h-11 px-5 rounded-xl bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all active:scale-95 leading-none">الشهري</button>
                                </div>
                            </div>

                            <div className="h-[280px] flex items-center justify-center bg-slate-950/40 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                                {/* Dynamic Background Pattern */}
                                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
                                </div>
                                <div className="text-center space-y-4 relative z-10">
                                    {attendanceDist.total === 0 ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                                <Activity className="w-8 h-8 text-slate-800" />
                                            </div>
                                            <p className="text-meta !text-slate-600">لم يتم تسجيل بيانات حضور حتى الآن</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-12">
                                            <div className="flex flex-col items-center">
                                                <div className="text-6xl font-black text-emerald-500 tracking-tighter mb-1">
                                                    {Math.round((attendanceDist.present / attendanceDist.total) * 100)}%
                                                </div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">معدل الانضباط</div>
                                            </div>
                                            <div className="w-px h-20 bg-white/5" />
                                            <div className="flex flex-col items-center">
                                                <div className="text-6xl font-black text-rose-500 tracking-tighter mb-1">
                                                    {Math.round((attendanceDist.absent / attendanceDist.total) * 100)}%
                                                </div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">معدل الغياب</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                {[
                                    { label: 'حضور', val: attendanceDist.total > 0 ? `${Math.round((attendanceDist.present / attendanceDist.total) * 100)}%` : '0%', color: 'bg-emerald-500' },
                                    { label: 'تأخير', val: attendanceDist.total > 0 ? `${Math.round((attendanceDist.late / attendanceDist.total) * 100)}%` : '0%', color: 'bg-amber-500' },
                                    { label: 'غياب', val: attendanceDist.total > 0 ? `${Math.round((attendanceDist.absent / attendanceDist.total) * 100)}%` : '0%', color: 'bg-rose-500' },
                                    { label: 'إجازة', val: attendanceDist.total > 0 ? `${Math.round((attendanceDist.leave / attendanceDist.total) * 100)}%` : '0%', color: 'bg-blue-500' }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                            <span className="text-meta">{item.label}</span>
                                        </div>
                                        <div className="text-2xl font-black text-white tracking-tighter group-hover:text-primary transition-colors">{item.val}</div>
                                    </div>
                                ))}
                            </div>
                        </AppCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <AppCard className="h-full border-white/5 shadow-2xl">
                            <h3 className="text-xl font-black text-white tracking-tight mb-8">نشاطات النظام الأخيرة</h3>
                            <div className="space-y-6">
                                {recentActivities.length === 0 ? (
                                    <div className="py-10 text-center text-meta opacity-40">لا توجد نشاطات مؤخراً</div>
                                ) : (
                                    recentActivities.map((log, i) => (
                                        <div key={i} className="flex gap-4 group cursor-pointer">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex flex-shrink-0 items-center justify-center text-slate-500 group-hover:bg-primary/20 group-hover:text-primary transition-all shadow-inner">
                                                <log.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col gap-1 border-b border-white/5 pb-4 w-full">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[13px] font-black text-white group-hover:text-primary transition-colors">{log.title}</span>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase">
                                                        {log.time ? format(log.time, 'HH:mm', { locale: ar }) : '---'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[11px] font-bold text-slate-500">{log.desc}</p>
                                                    <span className="text-[9px] font-black text-slate-800 uppercase bg-white/5 px-2 py-0.5 rounded-md">
                                                        {log.time ? format(log.time, 'eeee', { locale: ar }) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="w-full h-11 mt-6 rounded-xl bg-slate-950/50 border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all active:scale-95">عرض سجل العمليات الكامل</button>
                        </AppCard>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
