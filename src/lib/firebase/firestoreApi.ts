import {
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    deleteDoc,
    query,
    where,
    limit,
    orderBy,
    onSnapshot,
    getCountFromServer,
    collectionGroup,
    serverTimestamp,
    deleteField,
    getDocs,
    DocumentReference,
    CollectionReference,
    QueryDocumentSnapshot,
    DocumentSnapshot,
    QuerySnapshot,
    Query,
} from "firebase/firestore";
import { db } from "./clientApp";

/**
 * كلاس FirestoreApi للتعامل مع قاعدة البيانات Firestore
 * يتبع القواعد المحددة للتعامل مع البيانات والمسارات
 */
export class FirestoreApi {
    // === Singleton ===
    private static _instance: FirestoreApi;

    public static get Api(): FirestoreApi {
        if (!FirestoreApi._instance) {
            FirestoreApi._instance = new FirestoreApi();
        }
        return FirestoreApi._instance;
    }

    private constructor() { }

    // ==============================
    // دوال مرجعية بسيطة
    // ==============================

    /** إرجاع معرف جديد لمستند في حلقة */
    getNewId(collectionName: string): string {
        return doc(collection(db, collectionName)).id;
    }

    /** إرجاع مرجع إلى حلقة رئيسية */
    getCollection(collectionName: string): CollectionReference {
        return collection(db, collectionName);
    }

    /** إرجاع مرجع لمستند داخل حلقة */
    getDocument(collectionName: string, documentId: string): DocumentReference {
        return doc(db, collectionName, documentId);
    }

    /** إرجاع مرجع لحلقة فرعية داخل مستند */
    getSubCollection(collectionName: string, documentId: string, subCollectionName: string): CollectionReference {
        return collection(db, collectionName, documentId, subCollectionName);
    }

    /** إرجاع مرجع لمستند داخل حلقة فرعية */
    getSubDocument(collectionName: string, documentId: string, subCollectionName: string, subDocumentId: string): DocumentReference {
        return doc(db, collectionName, documentId, subCollectionName, subDocumentId);
    }

    // ==============================
    // دوال CRUD عامة
    // ==============================

    /** إنشاء أو تعيين بيانات مستند - النقطة المركزية لكل عمليات الكتابة */
    async setData({
        docRef,
        data,
        merge = true,
    }: {
        docRef: DocumentReference;
        data: any;
        merge?: boolean;
    }): Promise<void> {
        const userData = this._getUserData();

        const newData = {
            ...data,
            createdByName: userData.displayName || '',
            createdByImageUrl: userData.photoURL || '',
            createdBy: userData.uid || '',
            createTimes: serverTimestamp(),
            updatedTimes: serverTimestamp(),
        };

        await setDoc(docRef, newData, { merge });
    }

    /** تحديث بيانات مستند - النقطة المركزية لكل عمليات التحديث */
    async updateData({
        docRef,
        data,
    }: {
        docRef: DocumentReference;
        data: any;
    }): Promise<void> {
        const userData = this._getUserData();
        const updatedData = { ...data };

        const hasFieldValueDelete = Object.values(updatedData).some(
            (value) => value === deleteField()
        );

        if (!hasFieldValueDelete) {
            if (!updatedData.updateByName) {
                updatedData.updateByName = (userData.displayName || '').trim();
            }
            if (!updatedData.updateByImageUrl) {
                updatedData.updateByImageUrl = (userData.photoURL || '').trim();
            }
            updatedData.updatedTimes = serverTimestamp();
        }

        await updateDoc(docRef, updatedData);
    }

    /** جلب بيانات مستند */
    async getData(docRef: DocumentReference): Promise<any | null> {
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
    }

    /** حذف مستند */
    async deleteData(docRef: DocumentReference): Promise<void> {
        await deleteDoc(docRef);
    }

    // ==============================
    // دوال للعمل مع حلقات
    // ==============================

    /** جلب مستندات من حلقة مع فلترة محددة وحد */
    async getDocuments(
        colRef: CollectionReference,
        whereField?: string,
        isEqualTo?: any,
        limitVal?: number
    ): Promise<QueryDocumentSnapshot[]> {
        let q: Query = colRef;
        if (whereField) {
            q = query(q, where(whereField, "==", isEqualTo));
        }
        if (limitVal) {
            q = query(q, limit(limitVal));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs;
    }

    /** تدفق مباشر للحلقة مع دعم فلتر */
    collectionStream(
        colRef: CollectionReference,
        options?: {
            whereField?: string,
            isEqualTo?: any,
            limit?: number,
            orderByField?: string,
            descending?: boolean
        }
    ) {
        let q: Query = colRef;
        if (options?.whereField) {
            q = query(q, where(options.whereField, "==", options.isEqualTo));
        }
        if (options?.orderByField) {
            q = query(q, orderBy(options.orderByField, options.descending ? "desc" : "asc"));
        }
        if (options?.limit) {
            q = query(q, limit(options.limit));
        }
        return onSnapshot(q, (snapshot) => {
            // يمكن للمستدعي الاشتراك في التغييرات
        });
    }

    /** جلب جميع المستندات من حلقة */
    async getAllDocuments(colRef: CollectionReference, limitVal?: number): Promise<DocumentSnapshot[]> {
        const q = limitVal ? query(colRef, limit(limitVal)) : query(colRef);
        const snapshot = await getDocs(q);
        return snapshot.docs;
    }

    // ==============================
    // دوال متداخلة (parent-child)
    // ==============================

    async setNested({
        parentCollection,
        parentId,
        subCollection,
        documentId,
        data,
        merge = true,
    }: {
        parentCollection: string;
        parentId: string;
        subCollection: string;
        documentId: string;
        data: any;
        merge?: boolean;
    }): Promise<void> {
        const docRef = this.getSubDocument(parentCollection, parentId, subCollection, documentId);
        await this.setData({ docRef, data, merge });
    }

    async updateNested({
        parentCollection,
        parentId,
        subCollection,
        documentId,
        data,
    }: {
        parentCollection: string;
        parentId: string;
        subCollection: string;
        documentId: string;
        data: any;
    }): Promise<void> {
        const docRef = this.getSubDocument(parentCollection, parentId, subCollection, documentId);
        await this.updateData({ docRef, data });
    }

    async getNested(
        parentCollection: string,
        parentId: string,
        subCollection: string,
        documentId: string
    ): Promise<any | null> {
        const docRef = this.getSubDocument(parentCollection, parentId, subCollection, documentId);
        return this.getData(docRef);
    }

    async deleteNested(
        parentCollection: string,
        parentId: string,
        subCollection: string,
        documentId: string
    ): Promise<void> {
        const docRef = this.getSubDocument(parentCollection, parentId, subCollection, documentId);
        await this.deleteData(docRef);
    }

    // ==============================
    // دوال الإحصائيات
    // ==============================

    async getCollectionCount(collectionName: string): Promise<number> {
        const colRef = this.getCollection(collectionName);
        const snapshot = await getCountFromServer(colRef);
        return snapshot.data().count;
    }

    async getSubCollectionCount(
        parentCollection: string,
        parentId: string,
        subCollection: string
    ): Promise<number> {
        const colRef = this.getSubCollection(parentCollection, parentId, subCollection);
        const snapshot = await getCountFromServer(colRef);
        return snapshot.data().count;
    }

    async getAllCount(collectionName: string): Promise<number> {
        const q = query(collectionGroup(db, collectionName));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    }


    // ==============================
    // دوال مساعدة خاصة
    // ==============================

    /** مسار الموظفين: employees/userid/employees/employeesid */
    getEmployeeRef(userId: string, employeeId: string): DocumentReference {
        return this.getSubDocument("employees", userId, "employees", employeeId);
    }

    /** مسار الرواتب: salarys/employeeid/salarys/salaryid */
    getSalaryRef(employeeId: string, salaryId: string): DocumentReference {
        return this.getSubDocument("salarys", employeeId, "salarys", salaryId);
    }

    /** مسار العملات: currencies/userid/currencies/currencyid */
    getCurrencyRef(userId: string, currencyId: string): DocumentReference {
        return this.getSubDocument("currencies", userId, "currencies", currencyId);
    }

    /** مسار الدوام: attendance/employeeid/attendance/attendanceid */
    getAttendanceRef(employeeId: string, attendanceId: string): DocumentReference {
        return this.getSubDocument("attendance", employeeId, "attendance", attendanceId);
    }

    /** مسار باقات الدوام: attendancePlans/userid/plans/planid */
    getAttendancePlanRef(userId: string, planId: string): DocumentReference {
        return this.getSubDocument("attendancePlans", userId, "plans", planId);
    }

    /** مسار المسؤولين: admins/ownerid/admins/adminid */
    getAdminRef(ownerId: string, adminId: string): DocumentReference {
        return this.getSubDocument("admins", ownerId, "admins", adminId);
    }

    /** مسار أنواع الإجازات: leaveTypes/userid/types/typeid */
    getLeaveTypeRef(userId: string, typeId: string): DocumentReference {
        return this.getSubDocument("leaveTypes", userId, "types", typeId);
    }

    /** مسار تخصيص الإجازات: leaveAllocations/userid/allocations/allocationid */
    getLeaveAllocationRef(userId: string, allocationId: string): DocumentReference {
        return this.getSubDocument("leaveAllocations", userId, "allocations", allocationId);
    }

    private _getUserData(): any {
        // في بيئة الويب، نستخدم localStorage أو Session
        // بما أن StorageService غير موجود، سنقوم بمحاكاته هنا أو البحث عنه
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }
}
