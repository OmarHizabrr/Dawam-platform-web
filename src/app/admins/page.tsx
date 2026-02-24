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
    ShieldCheck,
    Plus,
    Pencil,
    Trash2,
    User,
    Lock,
    Eye,
    EyeOff,
    Check,
    X,
    Shield,
    Calendar,
    UserCircle2,
    Info,
    KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminsPage() {
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // حقول المسؤول
    const [adminName, setAdminName] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            const adminsColRef = collection(db, "admins", parsedUser.uid, "admins");
            const unsubscribe = onSnapshot(query(adminsColRef), (snapshot) => {
                const adminList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAdmins(adminList);
            });

            return () => unsubscribe();
        }
    }, []);

    const handleSaveAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const adminData = {
                name: adminName,
                username: adminUsername,
                password: adminPassword,
                createdAt: new Date().toISOString(),
                ownerId: user.uid
            };

            if (isEditMode && editingAdminId) {
                const adminRef = FirestoreApi.Api.getAdminRef(user.uid, editingAdminId);
                await FirestoreApi.Api.updateData({ docRef: adminRef, data: adminData });
            } else {
                const adminId = FirestoreApi.Api.getNewId("admins");
                const adminRef = FirestoreApi.Api.getAdminRef(user.uid, adminId);
                await FirestoreApi.Api.setData({ docRef: adminRef, data: adminData });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving admin:", error);
            alert("حدث خطأ أثناء حفظ بيانات المسؤول");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المسؤول؟")) return;
        try {
            const adminRef = FirestoreApi.Api.getAdminRef(user.uid, adminId);
            await FirestoreApi.Api.deleteData(adminRef);
        } catch (error) {
            console.error("Error deleting admin:", error);
            alert("حدث خطأ أثناء حذف المسؤول");
        }
    };

    const openEditModal = (admin: any) => {
        setAdminName(admin.name);
        setAdminUsername(admin.username);
        setAdminPassword(admin.password);
        setEditingAdminId(admin.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingAdminId(null);
        setAdminName('');
        setAdminUsername('');
        setAdminPassword('');
        setShowPassword(false);
    };

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
                            إدارة المسؤولين
                        </h1>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                            إضافة وإدارة المسؤولين الفرعيين الذين لديهم صلاحية الوصول للنظام بمختلف المهام
                            <span className="w-1 h-1 rounded-full bg-violet-500 animate-pulse" />
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-violet-500/20 transition-all active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        <span>إضافة مسؤول</span>
                    </button>
                </motion.header>

                <div className="mb-10 max-w-md">
                    <SearchFilter
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="بحث عن مسؤول بالاسم أو المعرف..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {(() => {
                            const filtered = admins.filter(admin =>
                                searchQuery === '' ||
                                (admin.name && admin.name.includes(searchQuery)) ||
                                (admin.username && admin.username.includes(searchQuery))
                            );

                            if (filtered.length === 0) {
                                return (
                                    <div className="col-span-full py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                <Shield className="w-10 h-10" />
                                            </div>
                                            <p className="font-bold text-lg">{searchQuery === '' ? 'لا يوجد مسؤولين مضافين حالياً' : 'لا يوجد نتائج تطابق البحث'}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return filtered.map((admin, index) => (
                                <motion.div
                                    key={admin.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative glass p-4 rounded-xl border border-white/5 shadow-xl hover:shadow-2xl hover:border-violet-500/20 transition-all overflow-hidden"
                                >
                                    <div className="absolute -right-3 -top-3 text-[80px] font-black text-white/[0.02] pointer-events-none group-hover:text-violet-500/[0.05] transition-colors leading-none">
                                        <ShieldCheck />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform border border-violet-500/10">
                                                <UserCircle2 className="w-5 h-5" />
                                            </div>

                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/10 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-black text-white mb-1 group-hover:text-violet-500 transition-colors uppercase tracking-tight truncate">{admin.name}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">
                                            <KeyRound className="w-3 h-3 text-violet-500/70" />
                                            ID: <span className="text-slate-400">{admin.username}</span>
                                        </div>

                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-violet-500 animate-pulse" />
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Admin</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-tighter">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(admin.createdAt).toLocaleDateString('en-GB')}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        })()}
                    </AnimatePresence>
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={isEditMode ? 'تعديل بيانات المسؤول' : 'إضافة مسؤول فرعي جديد'}
                >
                    <form onSubmit={handleSaveAdmin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <User className="w-3 h-3" /> الاسم الكامل للمسؤول
                            </label>
                            <input
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                placeholder="مثال: م. علي صالح"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-violet-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <KeyRound className="w-3 h-3" /> اسم المستخدم (معرف الدخول)
                            </label>
                            <input
                                type="text"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                                placeholder="مثلاً: admin_24"
                                required
                                className="w-full bg-slate-900/50 border border-white/5 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:border-violet-500/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 px-1 flex items-center gap-2 uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> كلمة مرور النظام
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                    placeholder="أدخل كلمة مرور..."
                                    required
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg pr-4 pl-10 py-2.5 text-[13px] text-white focus:border-violet-500/50 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-black text-sm transition-all shadow-xl shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'جاري الحفظ...' : (
                                    <>
                                        <span>{isEditMode ? 'تحديث البيانات' : 'تفعيل الصلاحية'}</span>
                                        <Check className="w-4 h-4" />
                                    </>
                                )}
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
