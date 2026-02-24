'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/firebase/authService';
import styles from '../login/login.module.css'; // إعادة استخدام نفس التصاميم
import Link from 'next/link';

export default function RegisterPage() {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={styles.container} style={{ background: '#0f172a' }} />;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        setLoading(true);

        try {
            await AuthService.Api.register({ name, email, password });
            window.location.href = '/profile';
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('هذا البريد الإلكتروني مستخدم بالفعل');
            } else if (err.code === 'auth/weak-password') {
                setError('كلمة المرور ضعيفة جداً');
            } else {
                setError('فشل إنشاء الحساب. تأكد من البيانات.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glow} />
            <div className={styles.card}>
                <div className={styles.logo}>
                    <h1>Dawam</h1>
                    <p>إنشاء حساب جديد</p>
                </div>

                <form className={styles.form} onSubmit={handleRegister}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">الاسم الكامل</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="الاسم الثلاثي"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">البريد الإلكتروني</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">كلمة المرور</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                        </button>
                    </div>
                </form>

                <div className={styles.footer}>
                    <span>لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link></span>
                </div>
            </div>
        </div>
    );
}
