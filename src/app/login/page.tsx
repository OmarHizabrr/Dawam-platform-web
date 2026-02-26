'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/firebase/authService';
import { auth, googleProvider } from '@/lib/firebase/clientApp';
import { signInWithPopup } from 'firebase/auth';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Activity,
  Clock,
  Fingerprint,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.Api.login(email, password);
      // استخدام window.location للخروج التام من حالة المصادقة القديمة وتحديث الحالة
      window.location.href = '/stats';
    } catch (err: any) {
      console.error(err);
      setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التحقق من بياناتك.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
        window.location.href = '/stats';
      }
    } catch (err: any) {
      console.error(err);
      setError('فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden selection:bg-violet-500/30">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-blue-500 p-0.5 shadow-2xl shadow-violet-500/20"
          >
            <div className="w-full h-full bg-slate-900 rounded-[2.3rem] flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Dawam<span className="text-violet-500">.</span>
            </h1>
            <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] translate-x-1">
              Platform Ecosystem
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative group">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">ابدأ تسجيل الدخول</h2>
              <p className="text-[13px] font-bold text-slate-500">أدخل بيانات اعتمادك للوصول إلى لوحة التحكم الإدارية.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-[13px] font-black"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                <div className="relative group/field">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">كلمة المرور</label>
                  <button type="button" className="text-[11px] font-black text-violet-500 hover:text-violet-400 uppercase tracking-widest">نسيت كلمة المرور؟</button>
                </div>
                <div className="relative group/field">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within/field:text-violet-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-[15px] font-black text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[15px] transition-all shadow-2xl shadow-violet-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 group/btn"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>دخول للنظام</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform rotate-180" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">أو عبر</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-[13px] transition-all flex items-center justify-center gap-3 active:scale-95 group/google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover/google:scale-110 transition-transform">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>الاستمرار بواسطة جوجل</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-6">
          <p className="text-[13px] font-bold text-slate-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-violet-500 hover:text-violet-400 font-black transition-colors">
              إنشاء حساب جديد
            </Link>
          </p>

          <div className="flex items-center justify-center gap-6 opacity-30 grayscale">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">Secure Biometric ready</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Atmospheric Micro-elements */}
      <div className="absolute top-10 right-10 text-white/5 rotate-12 pointer-events-none">
        <Sparkles className="w-32 h-32" />
      </div>
    </div>
  );
}
