'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/firebase/clientApp';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    CircleDollarSign,
    Hourglass,
    ShieldCheck,
    TrendingUp,
    PieChart,
    ChevronLeft,
    Plus,
    Settings,
    LayoutDashboard
} from 'lucide-react';
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
    });
    const [loading, setLoading] = useState(true);

    const [attendanceDist, setAttendanceDist] = useState({ present: 0, absent: 0, late: 0, leave: 0 });
    const [salaryTrend, setSalaryTrend] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchStats(parsedUser.uid);
            } catch (e) {
                console.error("StatsPage: Error parsing user data:", e);
            }
        }
    }, []);

    const fetchStats = async (uid: string) => {
        setLoading(true);
        try {
            // 1. Employees Count
            const empCol = collection(db, "employees", uid, "employees");
            onSnapshot(empCol, (snap) => {
                const emps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setStats(prev => ({ ...prev, totalEmployees: snap.size }));

                // Fetch today's attendance for all emps
                const today = new Date().toISOString().split('T')[0];
                let todayStats = { present: 0, absent: 0, late: 0, leave: 0 };

                const fetchAttendancePromises = emps.map(emp => {
                    const attRef = collection(db, "attendance", emp.id, "attendance");
                    const q = query(attRef, where("__name__", "==", today));
                    return getDocs(q).then(attSnap => {
                        if (!attSnap.empty) {
                            const data = attSnap.docs[0].data();
                            if (data.shifts && Array.isArray(data.shifts)) {
                                data.shifts.forEach((s: any) => {
                                    if (s.status === 'present') todayStats.present++;
                                    else if (s.status === 'absent') todayStats.absent++;
                                    else if (s.status === 'late') todayStats.late++;
                                    else if (s.status === 'leave') todayStats.leave++;
                                });
                            }
                        }
                    }).catch(err => console.error(`Error fetching attendance for emp ${emp.id}:`, err));
                });

                Promise.all(fetchAttendancePromises).then(() => {
                    setAttendanceDist({ ...todayStats });
                });
            }, (err) => console.error("Error in employees snapshot:", err));

            // 2. Admins Count
            const adminCol = collection(db, "admins", uid, "admins");
            onSnapshot(adminCol, (snap) => {
                setStats(prev => ({ ...prev, totalAdmins: snap.size }));
            }, (err) => console.error("Error in admins snapshot:", err));

            // 3. Salaries & Monthly Amount & Trend
            const salCol = collection(db, "salaries", uid, "salaries");
            onSnapshot(salCol, (snap) => {
                const list = snap.docs.map(doc => doc.data() as any);
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const currentMonthSalaries = list.filter((s: any) =>
                    s.paymentDate && s.paymentDate >= startOfMonth && s.paymentDate <= endOfMonth
                );
                const totalAmount = currentMonthSalaries.reduce((sum: number, s: any) => sum + (parseFloat(s.amount) || 0), 0);

                // Monthly Trend (Last 6 months)
                const trend: any = {};
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    trend[monthKey] = 0;
                }

                list.forEach((s: any) => {
                    if (s.paymentDate) {
                        const mKey = s.paymentDate.substring(0, 7);
                        if (trend[mKey] !== undefined) {
                            trend[mKey] += parseFloat(s.amount) || 0;
                        }
                    }
                });

                setSalaryTrend(Object.entries(trend).map(([month, amount]) => ({ month, amount: amount as number })));

                setStats(prev => ({
                    ...prev,
                    totalSalaries: snap.size,
                    totalSalaryAmount: totalAmount
                }));
            }, (err) => console.error("Error in salaries snapshot:", err));

            // 4. Leave Types & Allocations
            const typesCol = collection(db, "leaveTypes", uid, "types");
            onSnapshot(typesCol, (snap) => {
                setStats(prev => ({ ...prev, totalLeaveTypes: snap.size }));
            }, (err) => console.error("Error in leaveTypes snapshot:", err));

            const allocCol = collection(db, "leaveAllocations", uid, "allocations");
            onSnapshot(allocCol, (snap) => {
                setStats(prev => ({ ...prev, totalAllocations: snap.size }));
            }, (err) => console.error("Error in allocations snapshot:", err));

        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <DashboardLayout><div>جاري تسجيل الدخول...</div></DashboardLayout>;
    }

    const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, scale: 1.005 }}
            className="glass-dark p-3.5 rounded-xl flex flex-col gap-3 group transition-all duration-500 relative overflow-hidden shadow-xl"
        >
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[30px] -mr-4 -mt-4 group-hover:bg-white/10 transition-colors" />

            <div className="flex justify-between items-start relative z-10">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:shadow-lg transition-all duration-500" style={{ boxShadow: `0 0 10px ${color}10` }}>
                    <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" style={{ color }} />
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                    إحصائيات حية
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-1 px-0.5">{title}</div>
                <div className="text-xl font-black text-white tracking-tighter mb-1.5">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {subValue && (
                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white/5 rounded-md w-fit group-hover:bg-white/10 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                        <span className="text-[11px] font-bold text-slate-400">{subValue}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                <LayoutDashboard className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">المؤشرات الرئيسية</span>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-l from-white via-white to-white/40 bg-clip-text text-transparent">
                            نظرة عامة على النظام
                        </h1>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-xl">
                            مرحباً بك مجدداً <span className="text-white font-black">{user.displayName}</span>. إليك تحليل شامل لأداء المؤسسة لليوم.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="h-9 px-4 rounded-lg bg-white text-slate-950 font-black text-[10px] hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                            <Plus className="w-3 h-3" /> إضافة سريعة
                        </button>
                        <button className="h-9 w-9 rounded-lg glass border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="إجمالي الموظفين"
                        value={stats.totalEmployees}
                        icon={Users}
                        color="#3b82f6"
                        subValue="نمو مستمر في الكادر"
                    />
                    <StatCard
                        title="مدفوعات الشهر الحالي"
                        value={stats.totalSalaryAmount}
                        icon={CircleDollarSign}
                        color="#10b981"
                        subValue="إجمالي الرواتب المصروفة"
                    />
                    <StatCard
                        title="طلبات الإجازة"
                        value={stats.totalAllocations}
                        icon={Hourglass}
                        color="#f43f5e"
                        subValue="تخصيصات نشطة"
                    />
                    <StatCard
                        title="صلاحيات المسؤولين"
                        value={stats.totalAdmins}
                        icon={ShieldCheck}
                        color="#8b5cf6"
                        subValue="أمان وتحكم كامل"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-3 glass-dark rounded-xl p-5 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-5">
                            <div className="space-y-0.5">
                                <h3 className="text-base font-black flex items-center gap-2 text-white">
                                    <PieChart className="w-4.5 h-4.5 text-primary" /> توزيع الحضور
                                </h3>
                                <p className="text-slate-500 text-[11px] font-bold pr-7">مراقبة لحظية للحالة</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                                <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        <div className="flex flex-col xl:flex-row items-center gap-10">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <div className="absolute inset-3 rounded-full border border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-inner" />
                                <svg width="180" height="180" viewBox="0 0 42 42" className="transform -rotate-90 relative z-10">
                                    {(() => {
                                        const total = attendanceDist.present + attendanceDist.absent + attendanceDist.late + attendanceDist.leave;
                                        if (total === 0) return <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />;

                                        let offset = 0;
                                        const colors = ['#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];
                                        const values = [attendanceDist.present, attendanceDist.absent, attendanceDist.late, attendanceDist.leave];

                                        return values.map((val, i) => {
                                            const percent = (val / total) * 100;
                                            const stroke = (percent * 100) / 100;
                                            const circle = (
                                                <circle
                                                    key={i}
                                                    cx="21" cy="21" r="15.915"
                                                    fill="transparent"
                                                    stroke={colors[i]}
                                                    strokeWidth="3.5"
                                                    strokeDasharray={`${stroke} ${100 - stroke}`}
                                                    strokeDashoffset={-offset}
                                                    className="transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]"
                                                    strokeLinecap="round"
                                                />
                                            );
                                            offset += stroke;
                                            return circle;
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                    <span className="text-4xl font-black text-white leading-none mb-1">
                                        {attendanceDist.present + attendanceDist.absent + attendanceDist.late + attendanceDist.leave}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center">إجمالي الكادر</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                                {[
                                    { label: 'حاضر', val: attendanceDist.present, color: '#3b82f6', desc: 'في الموعد' },
                                    { label: 'غائب', val: attendanceDist.absent, color: '#f43f5e', desc: 'بدون إذن' },
                                    { label: 'متأخر', val: attendanceDist.late, color: '#f59e0b', desc: 'تأخير' },
                                    { label: 'إجازة', val: attendanceDist.leave, color: '#8b5cf6', desc: 'موافق عليها' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group/item">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <div className="text-2xl font-black text-white mb-1">{item.val}</div>
                                        <div className="text-[10px] font-bold text-slate-600 group-hover/item:text-slate-400 transition-colors">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 glass-dark rounded-xl p-5 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-transparent opacity-50" />

                        <div className="flex items-center justify-between mb-5">
                            <div className="space-y-0.5">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <TrendingUp className="w-4.5 h-4.5 text-emerald-400" /> تحليل الرواتب
                                </h3>
                                <p className="text-slate-500 text-[11px] font-bold pr-7">المصروفات لآخر 6 أشهر</p>
                            </div>
                        </div>

                        <div className="h-32 flex items-end gap-3 mb-5 px-1">
                            {salaryTrend.map((s, i) => {
                                const max = Math.max(...salaryTrend.map(x => x.amount)) || 1;
                                const height = (s.amount / max) * 100;
                                return (
                                    <div key={i} className="flex-1 group/bar relative h-full flex items-end justify-center">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 1.5, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                                            className="w-full bg-gradient-to-t from-emerald-600/40 via-emerald-500/20 to-emerald-400/10 rounded-md min-h-[4px] relative group-hover/bar:from-emerald-500 group-hover/bar:to-emerald-400 border-t border-white/5 transition-all duration-500"
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-2.5 py-1 rounded text-[10px] font-black opacity-0 group-hover/bar:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap z-30 scale-50 group-hover/bar:scale-100">
                                                {s.amount.toLocaleString()} <span className="text-[8px] opacity-60">ريال</span>
                                            </div>
                                            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-0 group-hover/bar:opacity-20 transition-opacity" />
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-4 px-2">
                            {salaryTrend.map((s, i) => (
                                <span key={i} className="text-[11px] font-black text-slate-600 uppercase tracking-tighter hover:text-white transition-colors cursor-default">
                                    {new Date(s.month).toLocaleDateString('ar-SA', { month: 'short' })}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                        <h2 className="text-lg font-black flex items-center gap-2 px-3 text-white/80">
                            <Plus className="w-4 h-4 text-primary" /> الوصول السريع للخدمات
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'سجل الحضور', desc: 'إدارة فترات الدوام', icon: Hourglass, path: '/attendance', color: '#3b82f6', bg: 'from-blue-500/10' },
                            { name: 'دليل الموظفين', desc: 'تحرير ونبذة كاملة', icon: Users, path: '/employees', color: '#10b981', bg: 'from-emerald-500/10' },
                            { name: 'كشف الرواتب', desc: 'صرف وتسجيل مالي', icon: CircleDollarSign, path: '/salaries', color: '#f59e0b', bg: 'from-amber-500/10' },
                            { name: 'إعدادات النظام', desc: 'تخصيص كامل للنظام', icon: Settings, path: '/settings', color: '#64748b', bg: 'from-slate-500/10' },
                        ].map((item: any, idx) => (
                            <motion.a
                                key={idx}
                                href={item.path}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn("glass-dark p-4 rounded-xl flex flex-col items-center text-center group transition-all duration-500 relative overflow-hidden bg-gradient-to-b to-transparent", item.bg)}
                            >
                                <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rounded-bl-xl -mr-4 -mt-4 rotate-45 group-hover:bg-white/10 transition-colors" />

                                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-500 shadow-inner mb-3 relative z-10">
                                    <item.icon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ color: item.color }} />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <span className="block font-black text-sm text-white group-hover:text-primary transition-colors">{item.name}</span>
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.desc}</span>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
