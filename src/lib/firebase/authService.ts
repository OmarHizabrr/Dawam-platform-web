import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from "firebase/auth";
import { auth } from "./clientApp";
import { FirestoreApi } from "./firestoreApi";

/**
 * كلاس AuthService للتعامل مع عمليات المصادقة
 * يربط بين Firebase Auth و FirestoreApi
 */
export class AuthService {
    private static _instance: AuthService;

    public static get Api(): AuthService {
        if (!AuthService._instance) {
            AuthService._instance = new AuthService();
        }
        return AuthService._instance;
    }

    private constructor() { }

    /**
     * إنشاء حساب جديد وحفظ البيانات في Firestore
     */
    async register({ name, email, password }: { name: string; email: string; password: string }): Promise<User> {
        // 1. إنشاء الحساب في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;

        // 2. تحديث الاسم في الملف الشخصي لـ Firebase Auth
        await updateProfile(user, { displayName: name });

        // 3. تحديث البيانات المحلية للمستخدم لكي يستخدمها FirestoreApi في الحقول التلقائية
        const userData = {
            uid: user.uid,
            displayName: name,
            email: user.email,
            photoURL: user.photoURL || '',
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(userData));
        }

        // 4. حفظ بيانات المستخدم في جدول users في Firestore
        const userRef = FirestoreApi.Api.getDocument("users", user.uid);
        await FirestoreApi.Api.setData({
            docRef: userRef,
            data: {
                name: name,
                email: email,
                uid: user.uid,
            },
        });

        return user;
    }

    /**
     * تسجيل الدخول وتحديث البيانات المحلية
     */
    async login(email: string, password: string): Promise<User> {
        const userCredential = await signInWithEmailAndPassword(auth!, email, password);
        const user = userCredential.user;

        // تحديث البيانات المحلية
        const userData = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email,
            photoURL: user.photoURL || '',
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(userData));
        }

        return user;
    }

    /**
     * تسجيل الخروج
     */
    async logout(): Promise<void> {
        await signOut(auth!);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userData');
        }
    }
}
