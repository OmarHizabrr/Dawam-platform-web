'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import PeriodFilter from '@/components/PeriodFilter';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CircleDollarSign,
    Plus,
    Pencil,
    Trash2,
    Users,
    Calendar as CalendarIcon,
    Wallet,
    FileText,
    Check,
    X,
    ChevronDown,
    Search,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalariesPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [salaries, setSalaries] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // حقول الراتب
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [salaryAmount, setSalaryAmount] = useState('');
    const [salaryCurrency, setSalaryCurrency] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [salaryNote, setSalaryNote] = useState('');

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSalary, setEditingSalary] = useState<any>(null);

    // فلاتر البحث والفترة
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
            fetchEmployees(parsedUser.uid);
            fetchCurrencies(parsedUser.uid);
        }
    }, []);

    const fetchEmployees = async (uid: string) => {
        const empColRef = collection(db, "employees", uid, "employees");
        const snapshot = await getDocs(empColRef);
        const empList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setEmployees(empList);
    };

    const fetchCurrencies = (uid: string) => {
        const currColRef = collection(db, "currencies", uid, "currencies");
        onSnapshot(query(currColRef), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            setCurrencies(list);
            if (list.length > 0 && !salaryCurrency) {
                setSalaryCurrency(list[0].symbol || list[0].name);
            }
        });
    };

    useEffect(() => {
        if (!user || employees.length === 0) return;

        const unsubscribes = employees.map(emp => {
            const salaryColRef = collection(db, "salarys", emp.id, "salarys");
            return onSnapshot(salaryColRef, (snapshot) => {
                const empSalaries = snapshot.docs.map(doc => ({
                    id: doc.id,
                    empId: emp.id,
                    empName: emp.name,
                    ...doc.data()
                }));

                setSalaries(prev => {
                    const filtered = prev.filter(s => s.empId !== emp.id);
                    const merged = [...filtered, ...empSalaries];
                    return merged.sort((a, b) => (b.createTimes?.seconds || 0) - (a.createTimes?.seconds || 0));
                });
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user, employees]);

    const handleSaveSalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || selectedEmployees.length === 0) return;

        setLoading(true);
        try {
            if (isEditMode && editingSalary) {
                const salaryRef = FirestoreApi.Api.getSalaryRef(editingSalary.empId, editingSalary.id);
                await FirestoreApi.Api.updateData({
                    docRef: salaryRef,
                    data: {
                        amount: salaryAmount,
                        currency: salaryCurrency,
                        startDate: startDate,
                        endDate: endDate,
                        paymentDate: paymentDate,
                        note: salaryNote,
                    }
                });
            } else {
                const promises = selectedEmployees.map(async (empId) => {
                    const salaryId = FirestoreApi.Api.getNewId("salarys");
                    const salaryRef = FirestoreApi.Api.getSalaryRef(empId, salaryId);

                    return FirestoreApi.Api.setData({
                        docRef: salaryRef,
                        data: {
                            amount: salaryAmount,
                            currency: salaryCurrency,
                            startDate: startDate,
                            endDate: endDate,
                            paymentDate: paymentDate,
                            note: salaryNote,
                        }
                    });
                });

                await Promise.all(promises);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving salary:", error);
            alert("حدث خطأ أثناء حفظ بيانات الراتب");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSalary = async (empId: string, salaryId: string) => {
        if (!confirm("هل أنت متأكد من حذف سجل الراتب هذا؟")) return;
        try {
            const salaryRef = FirestoreApi.Api.getSalaryRef(empId, salaryId);
            await FirestoreApi.Api.deleteData(salaryRef);
        } catch (error) {
            console.error("Error deleting salary:", error);
            alert("حدث خطأ أثناء حذف الراتب");
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setEditingSalary(null);
        setSelectedEmployees([]);
        setSalaryAmount('');
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setPaymentDate(today);
        setSalaryNote('');
        if (currencies.length > 0) {
            setSalaryCurrency(currencies[0].symbol || currencies[0].name);
        }
        setIsModalOpen(true);
    };

    const openEditModal = (salary: any) => {
        setIsEditMode(true);
        setEditingSalary(salary);
        setSelectedEmployees([salary.empId]);
        setSalaryAmount(salary.amount);
        setStartDate(salary.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(salary.endDate || new Date().toISOString().split('T')[0]);
        setPaymentDate(salary.paymentDate || new Date().toISOString().split('T')[0]);
        setSalaryCurrency(salary.currency || (currencies.length > 0 ? (currencies[0].symbol || currencies[0].name) : ''));
        setSalaryNote(salary.note || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployees([]);
        setSalaryAmount('');
        setSalaryNote('');
    };

    const toggleEmployeeSelection = (empId: string) => {
        if (isEditMode) return;
        setSelectedEmployees(prev =>
            prev.includes(empId)
                ? prev.filter(id => id !== empId)
                : [...prev, empId]
        );
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
                            الرواتب
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            إدارة صرف الرواتب للموظفين ومتابعة السجلات التاريخية
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>إضافة سجل راتب</span>
                    </button>
                </motion.header>

                <PeriodFilter
                    startDate={filterStartDate}
                    endDate={filterEndDate}
                    onStartChange={setFilterStartDate}
                    onEndChange={setFilterEndDate}
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="بحث باسم الموظف..."
                />

                {/* Salaries List Table */}
                <div className="glass rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">الموظف</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">المبلغ</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">عن الفترة</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-right">تاريخ الصرف</th>
                                    <th className="px-5 py-3 text-slate-500 font-black text-[9px] uppercase tracking-widest text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {(() => {
                                        const filtered = salaries.filter(s => {
                                            const isWithinDate = s.paymentDate >= filterStartDate && s.paymentDate <= filterEndDate;
                                            const matchesSearch = searchQuery === '' ||
                                                (s.empName && s.empName.includes(searchQuery));
                                            return isWithinDate && matchesSearch;
                                        });

                                        if (filtered.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={5} className="py-24 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                                <Info className="w-10 h-10" />
                                                            </div>
                                                            <p className="font-bold text-lg">لا يوجد سجلات رواتب في الفترة المختارة</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return filtered.map((salary, index) => (
                                            <motion.tr
                                                key={salary.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black transition-transform text-[11px]">
                                                            {salary.empName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-primary transition-colors text-[13px]">{salary.empName}</div>
                                                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[150px] leading-tight">{salary.note || 'بدون ملاحظات'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-black text-emerald-400 tracking-tighter">{salary.amount}</span>
                                                        <span className="text-[8px] font-black text-slate-500 uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{salary.currency}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 leading-tight">
                                                            <span className="text-[7.5px] text-slate-600 uppercase">Start:</span> {salary.startDate}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 leading-tight">
                                                            <span className="text-[7.5px] text-slate-600 uppercase">End:</span> {salary.endDate}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                                                        <CalendarIcon className="w-3 h-3 text-primary" />
                                                        {salary.paymentDate}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(salary)}
                                                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all flex items-center justify-center"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSalary(salary.empId, salary.id)}
                                                            className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/10 transition-all flex items-center justify-center"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    })()}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Component */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل سجل الراتب' : 'إضافة راتب جديد'}
                >
                    <form onSubmit={handleSaveSalary} className="space-y-6">
                        {/* Multi-select Employees */}
                        {!isEditMode && (
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <Users className="w-3 h-3" /> اختيار الموظفين المستحقين
                                </label>

                                <div className="glass p-3 rounded-xl min-h-[60px] border-white/5 flex flex-wrap gap-1.5 transition-all">
                                    <AnimatePresence>
                                        {selectedEmployees.length === 0 ? (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-slate-600 text-[11px] font-medium italic p-1"
                                            >
                                                لم يتم اختيار أي موظف بعد...
                                            </motion.span>
                                        ) : (
                                            selectedEmployees.map(id => {
                                                const emp = employees.find(e => e.id === id);
                                                return (
                                                    <motion.div
                                                        key={id}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="bg-primary/20 text-primary border border-primary/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-black shadow-lg shadow-primary/10"
                                                    >
                                                        <span>{emp?.name}</span>
                                                        <button
                                                            onClick={() => toggleEmployeeSelection(id)}
                                                            className="hover:scale-125 transition-transform"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                    {employees.map(emp => {
                                        const isSelected = selectedEmployees.includes(emp.id);
                                        return (
                                            <button
                                                key={emp.id}
                                                type="button"
                                                onClick={() => toggleEmployeeSelection(emp.id)}
                                                className={cn(
                                                    "px-2.5 py-2 rounded-lg text-[9px] font-black transition-all border text-center uppercase tracking-wider",
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[0.98]"
                                                        : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                                                )}
                                            >
                                                {emp.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <Wallet className="w-3 h-3" /> مبلغ الراتب
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={salaryAmount}
                                        onChange={(e) => setSalaryAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-white font-black text-sm focus:border-emerald-500/50 outline-none transition-all pl-12"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500 opacity-50 text-[11px]">
                                        $
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <CircleDollarSign className="w-3 h-3" /> العملة
                                </label>
                                <div className="relative group">
                                    <select
                                        value={salaryCurrency}
                                        onChange={(e) => setSalaryCurrency(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-white font-black text-[13px] focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        {currencies.length === 0 && <option value="" className="bg-slate-900">لا يوجد عملات</option>}
                                        {currencies.map(curr => (
                                            <option key={curr.id} value={curr.symbol || curr.name} className="bg-slate-900">{curr.name} ({curr.symbol})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                    <CalendarIcon className="w-3 h-3" /> تاريخ الصرف
                                </label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2 text-white font-black text-[13px] focus:border-primary/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <CalendarIcon className="w-3 h-3" /> الفترة التي يغطيها الراتب
                            </label>
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-3 rounded-xl border border-white/5 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center z-10 hidden md:flex text-slate-600">
                                    <ChevronDown className="-rotate-90 w-3 h-3" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block px-0.5">من تاريخ</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-2 text-[13px] text-white font-bold focus:border-primary/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block px-0.5">إلى تاريخ</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3 py-2 text-[13px] text-white font-bold focus:border-primary/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <FileText className="w-3 h-3" /> ملاحظات إضافية
                            </label>
                            <textarea
                                value={salaryNote}
                                onChange={(e) => setSalaryNote(e.target.value)}
                                placeholder="أدخل أي ملاحظات هنا..."
                                rows={2}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-primary/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || (!isEditMode && selectedEmployees.length === 0)}
                                className={cn(
                                    "flex-1 py-2.5 rounded-lg font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50",
                                    isEditMode ? "bg-primary text-white shadow-primary/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                                )}
                            >
                                {loading ? 'جاري الحفظ...' :
                                    <>
                                        <span>{isEditMode ? 'تحديث السجل' : 'تأكيد الصرف'}</span>
                                        <Check className="w-4 h-4" />
                                    </>
                                }
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg font-bold transition-all border border-white/5 text-xs"
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
