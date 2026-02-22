'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/clientApp';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success - Next.js will handle redirect if we add a listener or just push router
      window.location.href = '/';
    } catch (err: any) {
      console.error(err);
      setError('خطأ في البريد الإلكتروني أو كلمة المرور');
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
          <p>أهلاً بك في نظام الدوام</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.errorMessage}>{error}</div>}

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

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
            <a href="#" className={styles.forgotPassword}>نسيت كلمة المرور؟</a>
          </div>
        </form>

        <div className={styles.footer}>
          <span>ليس لديك حساب؟ <a href="#">إنشاء حساب جديد</a></span>
        </div>
      </div>
    </div>
  );
}
