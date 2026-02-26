'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    User,
    Pencil,
    Trash2,
    Users,
    IdCard,
    Lock,
    Briefcase,
    Info,
    EyeOff,
    Eye,
    Check,
    Search,
    Shield,
    Fingerprint,
    ExternalLink,
    Mail,
    Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

export default function EmployeesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form fields
    const [empName, setEmpName] = useState('');
    const [empJobId, setEmpJobId] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [empPlanId, setEmpPlanId] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchData(parsedUser.uid);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
    }, []);

    const fetchData = (uid: string) => {
        const empColRef = collection(db, "employees", uid, "employees");
        onSnapshot(query(empColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEmployees(list);
        });

        const plansColRef = collection(db, "attendancePlans", uid, "plans");
        onSnapshot(query(plansColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlans(list);
        });
    };

    const handleSaveEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            if (isEditMode && editingEmpId) {
                const empRef = FirestoreApi.Api.getEmployeeRef(user.uid, editingEmpId);
                await FirestoreApi.Api.updateData({
                    docRef: empRef,
                    data: {
                        name: empName,
                        jobId: empJobId,
                        password: empPassword,
                        planId: empPlanId,
                    }
                });
            } else {
                const empId = FirestoreApi.Api.getNewId("employees");
                const empRef = FirestoreApi.Api.getEmployeeRef(user.uid, empId);

                await FirestoreApi.Api.setData({
                    docRef: empRef,
                    data: {
                        name: empName,
                        jobId: empJobId,
                        password: empPassword,
                        planId: empPlanId,
                    }
                });
            }
            closeModal();
        } catch (error) {
            console.error("Error saving employee:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (empId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
        if (!user) return;

        try {
            const empRef = FirestoreApi.Api.getEmployeeRef(user.uid, empId);
            await FirestoreApi.Api.deleteData(empRef);
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const openEditModal = (emp: any) => {
        setEmpName(emp.name);
        setEmpJobId(emp.jobId || '');
        setEmpPassword(emp.password || '');
        setEmpPlanId(emp.planId || '');
        setEditingEmpId(emp.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingEmpId(null);
        setEmpName('');
        setEmpJobId('');
        setEmpPassword('');
        setEmpPlanId('');
        setShowPassword(false);
    };

    if (!mounted) return null;

    const filteredEmployees = employees.filter(emp =>
        searchQuery === '' ||
        (emp.name && emp.name.includes(searchQuery)) ||
        (emp.jobId && emp.jobId.includes(searchQuery))
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="إدارة الكادر البشري"
                subtitle="تحكم مركزي في بيانات الموظفين، الصلاحيات، وباقات الدوام التشغيلية."
                icon={Users}
                breadcrumb="المستندات الإدارية"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[12px] transition-all shadow-2xl shadow-primary/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <UserPlus className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
                        <span>إضافة موظف جديد</span>
                    </button>
                }
            />

            {/* Smart Search Bar Section */}
            <AppCard padding="none" className="mb-8 border-white/5 shadow-2xl bg-slate-900/40">
                <div className="p-6 md:p-8">
                    <div className="relative group max-w-2xl">
                        <label className="text-meta mb-2.5 block px-1 flex items-center gap-2">
                            البحث الذكي في قاعدة بيانات الموظفين
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث باسم الموظف، الرقم الوظيفي، أو المسمى..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </AppCard>

            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredEmployees.length === 0 ? (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
                            <div className="w-32 h-32 rounded-[3rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                                />
                                <Users className="w-14 h-14 text-slate-700 group-hover/empty:text-primary transition-colors" />
                            </div>
                            <div className="text-center space-y-3 relative z-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">سجل الموظفين فارغ</h3>
                                <p className="text-meta !text-[11px] max-w-sm mx-auto leading-relaxed">لم نجد أي سجلات متطابقة في قاعدة البيانات. ابدأ بإضافة الكوادر البشرية لتنشيط الأنظمة الذكية.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-8 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95"
                            >
                                إضافة أول موظف الآن
                            </button>
                        </div>
                    ) : (
                        filteredEmployees.map((emp, idx) => (
                            <motion.div
                                key={emp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <AppCard padding="none" className="group h-full flex flex-col surface-deep">
                                    <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent overflow-hidden">
                                        <div className="absolute top-5 left-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-10">
                                            <button
                                                onClick={() => openEditModal(emp)}
                                                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white text-slate-300 hover:text-slate-950 backdrop-blur-md transition-all flex items-center justify-center border border-white/10"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEmployee(emp.id)}
                                                className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white backdrop-blur-md transition-all flex items-center justify-center border border-rose-500/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                    </div>

                                    <div className="px-8 pb-8 -mt-12 relative z-10 flex-1 flex flex-col">
                                        <div className="w-24 h-24 rounded-xl bg-slate-950 border-[6px] border-[#020617] flex items-center justify-center shadow-2xl mb-5 group-hover:scale-110 transition-transform duration-700 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <User className="w-11 h-11 text-primary/40 group-hover:text-primary transition-colors relative z-10" />
                                        </div>

                                        <div className="space-y-6 flex-1 flex flex-col">
                                            <div>
                                                <h3 className="text-[19px] font-black text-white tracking-tighter group-hover:text-primary transition-colors truncate">
                                                    {emp.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-meta !text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                        {emp.jobId}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-meta !text-slate-700">نشط</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group/field">
                                                    <Briefcase className="w-4 h-4 text-slate-600 group-hover/field:text-primary transition-colors" />
                                                    <span className="text-[11px] font-black text-white truncate">
                                                        {plans.find(p => p.id === emp.planId)?.name || 'غير محدد'}
                                                    </span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group/id">
                                                    <Fingerprint className="w-4 h-4 text-slate-600 group-hover/id:text-primary transition-colors" />
                                                    <span className="text-meta !text-[8px]">المعرف الحيوي</span>
                                                </div>
                                            </div>

                                            <button className="w-full mt-auto h-11 rounded-xl bg-white/[0.03] hover:bg-white text-slate-500 hover:text-slate-950 transition-all border border-white/5 flex items-center justify-center gap-2.5 text-[11px] font-black uppercase tracking-widest active:scale-95 group/btn">
                                                <span>استعراض الملف الشامل</span>
                                                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </AppCard>
                            </motion.div>
                        )))
                    }
                </div>
            </AnimatePresence>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تحديث السجل الوظيفي' : 'اعتماد كادر جديد'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveEmployee} className="space-y-10 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <User className="w-4 h-4 text-primary" /> قاعدة الاسم الكامل
                            </label>
                            <input
                                type="text"
                                value={empName}
                                onChange={(e) => setEmpName(e.target.value)}
                                placeholder="الاسم الرباعي الرسمي..."
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner placeholder:text-slate-800"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <IdCard className="w-4 h-4 text-primary" /> الهوية الوظيفية
                            </label>
                            <input
                                type="text"
                                value={empJobId}
                                onChange={(e) => setEmpJobId(e.target.value)}
                                placeholder="الرقم التعريفي (ID)..."
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <Lock className="w-4 h-4 text-primary" /> مفتاح التشفير (Access)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={empPassword}
                                    onChange={(e) => setEmpPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none pl-12 shadow-inner placeholder:text-slate-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5.5 h-5.5" /> : <Eye className="w-5.5 h-5.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-meta px-2 flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-primary" /> بروتوكول الدوام
                            </label>
                            <select
                                value={empPlanId}
                                onChange={(e) => setEmpPlanId(e.target.value)}
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[14px] font-black text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer shadow-inner"
                            >
                                <option value="">اختر باقة الدوام...</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="glass-premium rounded-[2.5rem] p-10 border border-white/5 flex flex-col items-center gap-6 group text-center">
                        <div className="flex gap-10">
                            <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <p className="text-meta">E-Mail Gateway</p>
                            </div>
                            <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <p className="text-meta">Cellular Auth</p>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">توسيع البيانات متاح عبر الملف الشخصي المتقدم</p>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 rounded-xl bg-primary text-white font-black text-[13px] transition-all shadow-2xl shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تحديث السجل المركب' : 'إتمام عملية الاعتماد'}</span>
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
