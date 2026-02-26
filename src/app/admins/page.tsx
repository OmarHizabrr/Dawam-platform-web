'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FirestoreApi } from '@/lib/firebase/firestoreApi';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
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
    KeyRound,
    Users,
    Fingerprint,
    ShieldAlert,
    Contact2,
    Search,
    UserCheck,
    Zap,
    TrendingUp,
    ShieldHalf,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import AppCard from '@/components/ui/AppCard';

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

    // Admin Form fields
    const [adminName, setAdminName] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
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
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
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
                updatedAt: new Date().toISOString(),
                ownerId: user.uid
            };

            if (isEditMode && editingAdminId) {
                const adminRef = FirestoreApi.Api.getAdminRef(user.uid, editingAdminId);
                await FirestoreApi.Api.updateData({ docRef: adminRef, data: adminData });
            } else {
                const adminId = FirestoreApi.Api.getNewId("admins");
                const adminRef = FirestoreApi.Api.getAdminRef(user.uid, adminId);
                await FirestoreApi.Api.setData({ docRef: adminRef, data: { ...adminData, createdAt: new Date().toISOString() } });
            }

            closeModal();
        } catch (error) {
            console.error("Error saving admin:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المسؤول؟ سيتم إبطال كافة صلاحيات الوصول الخاصة به فوراً.")) return;
        try {
            const adminRef = FirestoreApi.Api.getAdminRef(user.uid, adminId);
            await FirestoreApi.Api.deleteData(adminRef);
        } catch (error) {
            console.error("Error deleting admin:", error);
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

    if (!mounted) return null;

    const filteredAdmins = admins.filter(admin =>
        searchQuery === '' ||
        (admin.name && admin.name.includes(searchQuery)) ||
        (admin.username && admin.username.includes(searchQuery))
    );

    return (
        <DashboardLayout>
            <PageHeader
                title="إدارة الوحدات الإدارية"
                subtitle="تعيين المسؤولين الفرعيين، مراقبة سجلات الوصول، وإدارة مفاتيح التشغيل للنظام."
                icon={ShieldAlert}
                breadcrumb="الإعدادات المتقدمة"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 px-7 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-[12px] transition-all shadow-2xl shadow-violet-500/30 flex items-center gap-2.5 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        <span>تعيين مسؤول فرعي</span>
                    </button>
                }
            />

            {/* Premium Control Layer */}
            <AppCard padding="none" className="mb-10 border-white/5 shadow-2xl surface-deep no-print overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative flex-1 group w-full">
                        <label className="text-meta mb-2 block px-1">البحث في السجلات الأمنية</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-600 group-focus-within:text-violet-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث بالاسم، معرف المستخدم، أو الدور..."
                                className="w-full h-11 bg-slate-950/60 border border-white/5 rounded-xl pr-12 pl-4 text-[13px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-8 py-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner">
                        <div className="text-center space-y-1 border-l border-white/5 pl-6">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">العدد الإجمالي</span>
                            <span className="text-2xl font-black text-white tabular-nums">{admins.length}</span>
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">الجلسات النشطة</span>
                            <span className="text-2xl font-black text-emerald-500 tabular-nums">01</span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                <AnimatePresence mode="popLayout">
                    {filteredAdmins.length === 0 ? (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-500 gap-10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-violet-500/2 rounded-full blur-[140px] pointer-events-none" />
                            <div className="w-32 h-32 rounded-[3.5rem] bg-slate-950 flex items-center justify-center border border-white/5 shadow-2xl relative group/empty overflow-hidden">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover/empty:opacity-100 transition-opacity"
                                />
                                <ShieldHalf className="w-14 h-14 text-slate-700 group-hover/empty:text-violet-500 transition-all duration-700" />
                            </div>
                            <div className="text-center space-y-3 relative z-10">
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">فراغ في منظومة الأمان</h3>
                                <p className="text-meta !text-[11px] max-w-[400px] mx-auto leading-relaxed">
                                    {searchQuery ? 'لم نتمكن من العثور على أي مسؤول يحمل مفاتيح الدخول لهذه المعطيات.' : 'باشر بتعيين الكوادر الإدارية لتوزيع صلاحيات التحكم والإشراف.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="h-11 px-8 rounded-xl bg-violet-600/10 border border-violet-600/20 text-[11px] font-black text-violet-500 hover:text-white hover:bg-violet-600 transition-all uppercase tracking-widest active:scale-95 shadow-xl shadow-violet-600/5"
                            >
                                تعيين مسؤول جديد
                            </button>
                        </div>
                    ) : (
                        filteredAdmins.map((admin, idx) => (
                            <motion.div
                                key={admin.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.6, ease: "circOut" }}
                            >
                                <AppCard padding="none" className="group overflow-hidden border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] h-full flex flex-col relative surface-deep hover:translate-y-[-10px] transition-all duration-700">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-15 transition-all duration-1000 pointer-events-none group-hover:rotate-12 group-hover:scale-125">
                                        <Fingerprint className="w-32 h-32" />
                                    </div>

                                    <div className="p-8 flex-1 space-y-8 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-600/10 flex items-center justify-center text-violet-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner">
                                                <UserCheck className="w-8 h-8" />
                                            </div>
                                            <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 active:scale-90"
                                                >
                                                    <Pencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                    className="w-11 h-11 rounded-xl bg-rose-500/10 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-90"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white group-hover:text-violet-500 transition-colors tracking-tighter truncate leading-none">
                                                {admin.name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.6)] animate-pulse" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Standard Admin Protocol</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/[0.03]">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] px-1">الهوية التشغيلية</label>
                                                <div className="px-5 py-3 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-between group-hover:border-violet-500/20 transition-all shadow-inner">
                                                    <div className="flex items-center gap-3">
                                                        <KeyRound className="w-4 h-4 text-violet-500/60" />
                                                        <span className="text-[13px] font-black text-slate-400 tabular-nums lowercase">{admin.username}</span>
                                                    </div>
                                                    <Zap className="w-3.5 h-3.5 text-slate-800 opacity-20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-8 py-5 bg-white/[0.01] border-t border-white/5 flex items-center justify-between relative overflow-hidden">
                                        <div className="absolute inset-0 bg-violet-600/5 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                        <div className="flex items-center gap-3 relative z-10">
                                            <History className="w-4 h-4 text-slate-700" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter leading-none">
                                                {new Date(admin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/10 text-[9px] font-black text-violet-500 uppercase tracking-widest relative z-10 shadow-inner group-hover:bg-violet-500 group-hover:text-white transition-all duration-500">
                                            Role: Sub
                                        </div>
                                    </div>
                                </AppCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Admin Provisioning Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={isEditMode ? 'تحديث بروتوكول المسؤول' : 'تعيين هوية إدارية جديدة'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSaveAdmin} className="space-y-10 p-4">
                    <div className="space-y-8">
                        <div className="space-y-4 group">
                            <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest">
                                <User className="w-4.5 h-4.5 text-violet-500" /> الاسم الإداري الكامل
                            </label>
                            <input
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                placeholder="مثال: المهندس عبدالمجيد محمد"
                                required
                                className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[13px] font-black text-white focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all placeholder:text-slate-800 shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 group">
                                <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest">
                                    <Fingerprint className="w-4.5 h-4.5 text-violet-500" /> معرّف الدخول
                                </label>
                                <input
                                    type="text"
                                    value={adminUsername}
                                    onChange={(e) => setAdminUsername(e.target.value)}
                                    placeholder="Login ID..."
                                    required
                                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl px-4 text-[13px] font-black text-white focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all placeholder:text-slate-800 shadow-inner lowercase"
                                />
                            </div>

                            <div className="space-y-4 group">
                                <label className="text-meta px-1 flex items-center gap-3 uppercase tracking-widest">
                                    <Lock className="w-4.5 h-4.5 text-violet-500" /> مفتاح التشفير
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Secure Key..."
                                        required
                                        className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-xl pr-4 pl-12 text-[13px] font-black text-white focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all placeholder:text-slate-800 shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-700 hover:text-white transition-colors active:scale-90"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-5 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !adminName || !adminUsername || !adminPassword}
                            className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-[12px] transition-all shadow-2xl shadow-violet-500/40 active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 uppercase tracking-[0.2em] group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تحديث بيانات الاعتماد' : 'اعتماد وتفعيل المسؤول'}</span>
                                    <ShieldCheck className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-8 h-11 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black transition-all border border-white/5 text-[12px] uppercase tracking-widest active:scale-95"
                        >
                            تراجع
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
