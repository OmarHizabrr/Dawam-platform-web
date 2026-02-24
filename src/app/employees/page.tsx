'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    User,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Check,
    IdCard,
    Lock,
    Briefcase,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // حقول الموظف
    const [empName, setEmpName] = useState('');
    const [empJobId, setEmpJobId] = useState('');
    const [empPassword, setEmpPassword] = useState('');
    const [empPlanId, setEmpPlanId] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            // جلب الموظفين
            const empColRef = collection(db, "employees", parsedUser.uid, "employees");
            const q = query(empColRef);
            const unsubscribeEmps = onSnapshot(q, (snapshot) => {
                const empList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEmployees(empList);
            });

            // جلب باقات الدوام
            const plansColRef = collection(db, "attendancePlans", parsedUser.uid, "plans");
            const unsubscribePlans = onSnapshot(query(plansColRef), (snapshot) => {
                const plansList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPlans(plansList);
            });

            return () => {
                unsubscribeEmps();
                unsubscribePlans();
            };
        }
    }, [mounted]);

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
            alert("حدث خطأ أثناء حفظ بيانات الموظف");
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
            alert("حدث خطأ أثناء حذف الموظف");
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

    if (!mounted || !user) {
        return <div className="bg-[#0f172a] min-h-screen" />;
    }

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
                            الموظفين
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            إدارة بيانات الموظفين المسجلين في النظام
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                    >
                        <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>إضافة موظف</span>
                    </button>
                </motion.header>

                <div className="mb-10">
                    <SearchFilter
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="بحث باسم الموظف أو الرقم الوظيفي..."
                    />
                </div>

                {/* List of Employees */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {(() => {
                            const filtered = employees.filter(emp =>
                                searchQuery === '' ||
                                (emp.name && emp.name.includes(searchQuery)) ||
                                (emp.jobId && emp.jobId.includes(searchQuery))
                            );

                            if (filtered.length === 0) {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-full py-24 flex flex-col items-center justify-center text-slate-500 gap-4"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                            <Info className="w-10 h-10" />
                                        </div>
                                        <p className="font-bold text-lg">
                                            {searchQuery === '' ? 'لا يوجد موظفين حالياً' : 'لا يوجد موظفين يطابقون البحث'}
                                        </p>
                                    </motion.div>
                                );
                            }

                            return filtered.map((emp, index) => (
                                <motion.div
                                    key={emp.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass p-4 rounded-xl group hover:border-primary/30 transition-all"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-primary/20 to-emerald-400/20 flex items-center justify-center shadow-inner group-hover:from-primary group-hover:to-emerald-400 transition-all duration-500">
                                                <User className="w-5.5 h-5.5 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(emp)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all"
                                                    title="تعديل"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/10 transition-all"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5">
                                            <h3 className="text-base font-black text-white group-hover:text-primary transition-colors truncate">
                                                {emp.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                                <IdCard className="w-3.5 h-3.5" />
                                                {emp.jobId}
                                            </div>
                                        </div>

                                        {emp.planId && (
                                            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                                                    <Briefcase className="w-3 h-3" />
                                                    {plans.find(p => p.id === emp.planId)?.name || 'باقة غير معروفة'}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ));
                        })()}
                    </AnimatePresence>
                </div>

                {/* Modal Component */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                >
                    <form onSubmit={handleSaveEmployee} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <User className="w-3 h-3" /> اسم الموظف
                            </label>
                            <input
                                type="text"
                                value={empName}
                                onChange={(e) => setEmpName(e.target.value)}
                                placeholder="الاسم الكامل"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <IdCard className="w-3 h-3" /> الرقم الوظيفي
                            </label>
                            <input
                                type="text"
                                value={empJobId}
                                onChange={(e) => setEmpJobId(e.target.value)}
                                placeholder="مثال: 2025001"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> كلمة المرور
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={empPassword}
                                    onChange={(e) => setEmpPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all pl-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <Briefcase className="w-3 h-3" /> باقة الدوام
                            </label>
                            <select
                                value={empPlanId}
                                onChange={(e) => setEmpPlanId(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">اختر باقة الدوام...</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id} className="bg-slate-900">{plan.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-black text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : <span>{isEditMode ? 'تحديث البيانات' : 'حفظ الموظف'} <Check className="w-4 h-4" /></span>}
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold text-xs transition-all border border-white/5"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
