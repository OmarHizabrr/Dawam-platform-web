import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>Dawam</h1>
          <p>أهلاً بك في نظام الدوام</p>
        </div>
        
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">البريد الإلكتروني</label>
            <input type="email" id="email" placeholder="example@email.com" />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">كلمة المرور</label>
            <input type="password" id="password" placeholder="••••••••" />
          </div>
          
          <div className={styles.actions}>
            <button type="submit" className={styles.loginButton}>دخول</button>
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
