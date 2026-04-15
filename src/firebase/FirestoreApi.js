import firebase from 'firebase/app';
import 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * StorageService Mock/Proxy for React
 * You can replace this with your actual state management (Redux, Context, or LocalStorage)
 */
export const StorageService = {
  getMap: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }
};

/**
 * FirestoreApi
 * - جميع عمليات الكتابة تمر عبر setData/updateData حصراً.
 * - لا توجد try/catch داخل الدوال (الأخطاء تذهب للمستدعي).
 * - يستخدم المسارات البسيطة المباشرة للوصول للمسارات المحددة في DATABASE_STRUCTURE.md
 * - كل وثيقة تحتوي على "data" كوثيقة فرعية
 */
class FirestoreApiClass {
  // === Singleton ===
  static instance = new FirestoreApiClass();
  static get Api() {
    return this.instance;
  }

  // ==============================
  // دوال مرجعية بسيطة (مثل Firestore الرسمي)
  // ==============================
  getNewId(collectionName) {
    return db.collection(collectionName).doc().id;
  }

  /**
   * إرجاع مرجع إلى حلقة رئيسية
   */
  getCollection(collectionName) {
    return db.collection(collectionName);
  }

  /**
   * إرجاع مرجع لمستند داخل حلقة
   */
  getDocument({ collectionName, documentId }) {
    return db.collection(collectionName).doc(documentId);
  }

  /**
   * إرجاع مرجع لحلقة فرعية داخل مستند
   */
  getSubCollection({ collectionName, documentId, subCollectionName }) {
    return db.collection(collectionName).doc(documentId).collection(subCollectionName);
  }

  /**
   * إرجاع مرجع لمستند داخل حلقة فرعية
   */
  getSubDocument({ collectionName, documentId, subCollectionName, subDocumentId }) {
    return db.collection(collectionName).doc(documentId).collection(subCollectionName).doc(subDocumentId);
  }

  // ==============================
  // دوال CRUD عامة تعمل على DocumentReference/CollectionReference
  // ==============================

  /**
   * إنشاء أو تعيين بيانات مستند (يدعم الدمج) — النقطة المركزية لكل عمليات الكتابة
   */
  async setData({ docRef, data, merge = true }) {
    // الحصول على بيانات المستخدم الحالي من التخزين المحلي
    const userData = StorageService.getMap('userData');

    // إنشاء خريطة جديدة تحتوي على البيانات الأصلية بالإضافة إلى الحقول الإضافية
    const newData = {
      ...data, 
      id: docRef.id, // Always include the document ID
      createdByName: userData['displayName'] || '',
      createdByImageUrl: userData['photoURL'] || '',
      createdBy: userData['uid'] || '',
      createTimes: firebase.firestore.FieldValue.serverTimestamp(),
      updatedTimes: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // حفظ البيانات في Firestore
    await docRef.set(newData, { merge });
  }

  /**
   * تحديث بيانات مستند — النقطة المركزية لكل عمليات التحديث
   */
  async updateData({ docRef, data }) {
    const userData = StorageService.getMap('userData');
    const updatedData = { ...data };

    // التحقق من وجود deleteField()
    const hasFieldValueDelete = Object.values(updatedData).some(
      (value) => value === firebase.firestore.FieldValue.delete()
    );

    const isMissingOrEmpty = (key) => {
      if (!(key in updatedData)) return true;
      const value = updatedData[key];
      if (value === null || value === undefined) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      return false;
    };

    if (!hasFieldValueDelete) {
      if (isMissingOrEmpty('updateByName')) {
        updatedData['updateByName'] = (userData['displayName'] || '').toString().trim();
      }
      if (isMissingOrEmpty('updateByImageUrl')) {
        updatedData['updateByImageUrl'] = (userData['photoURL'] || '').toString().trim();
      }
      updatedData['updatedTimes'] = firebase.firestore.FieldValue.serverTimestamp();
    }

    await docRef.update(updatedData);
  }

  /**
   * جلب بيانات مستند
   */
  async getData({ docRef }) {
    const snap = await docRef.get();
    return snap.exists ? snap.data() : null;
  }

  /**
   * حذف مستند
   */
  async deleteData({ docRef }) {
    await docRef.delete();
  }

  // ==============================
  // دوال للعمل مع حلقات
  // ==============================

  /**
   * جلب مستندات من حلقة مع فلترة محددة وحد
   */
  async getDocuments(colRef, { whereField, isEqualTo, limitCount } = {}) {
    let q = colRef;
    if (whereField !== undefined && isEqualTo !== undefined) {
      q = q.where(whereField, '==', isEqualTo);
    }
    if (limitCount !== undefined) {
      q = q.limit(limitCount);
    }
    
    const snapshot = await q.get();
    return snapshot.docs;
  }

  /**
   * جلب جميع المستندات من حلقة (اختياري بحد)
   */
  async getAllDocuments(colRef, { limitCount } = {}) {
    let q = colRef;
    if (limitCount !== undefined) {
      q = q.limit(limitCount);
    }
    const snapshot = await q.get();
    return snapshot.docs;
  }

  // ==============================
  // دوال متداخلة (parent-child) عامة
  // ==============================

  /**
   * إنشاء/تعيين مستند داخل حلقة فرعية عبر setData
   * مسار: /parentCollection/parentId/subCollection/documentId
   */
  async setNested({ parentCollection, parentId, subCollection, documentId, data, merge = true }) {
    const docRef = this.getSubDocument({
      collectionName: parentCollection,
      documentId: parentId,
      subCollectionName: subCollection,
      subDocumentId: documentId,
    });
    // According to database structure: subcollection data is nested in 'data' doc.
    // Wait, the structure requires the exact structure like:
    // accounts/accountId/users/userId/data
    // Since `documentId` acts as the document, and data is another subdoc inside it,
    // Actually the requested Dart code creates:
    // getSubDocument(parentCollection, parentId, subCollection, documentId);
    // So if parentCollection='accounts', parentId='acc1', subCollection='users', documentId='user1', 
    // it writes to accounts/acc1/users/user1. 
    // BUT the database structure requirement says: accounts/acc1/users/user1/data
    // So we must append /data as the final document or collection.
    // The dart code:
    // getSubDocument: return _firestore.collection(collectionName).doc(documentId).collection(subCollectionName).doc(subDocumentId);
    // Which means it writes to subDocumentId.
    // If the data should be under a document called "data", the `subDocumentId` must be `data` or we need an extra level.
    // For now, mirroring Dart precisely. To conform to "data" document rule, subDocumentId = "data".
    await this.setData({ docRef, data, merge });
  }

  async updateNested({ parentCollection, parentId, subCollection, documentId, data }) {
    const docRef = this.getSubDocument({
      collectionName: parentCollection,
      documentId: parentId,
      subCollectionName: subCollection,
      subDocumentId: documentId,
    });
    await this.updateData({ docRef, data });
  }

  async getNested({ parentCollection, parentId, subCollection, documentId }) {
    const docRef = this.getSubDocument({
      collectionName: parentCollection,
      documentId: parentId,
      subCollectionName: subCollection,
      subDocumentId: documentId,
    });
    const snap = await docRef.get();
    return snap.exists ? snap.data() : null;
  }

  async deleteNested({ parentCollection, parentId, subCollection, documentId }) {
    const docRef = this.getSubDocument({
      collectionName: parentCollection,
      documentId: parentId,
      subCollectionName: subCollection,
      subDocumentId: documentId,
    });
    await docRef.delete();
  }

  getSubCollectionRef({ parentCollection, parentId, subCollection }) {
    return this.getSubCollection({
      collectionName: parentCollection,
      documentId: parentId,
      subCollectionName: subCollection,
    });
  }

  async getCollectionCount({ collectionName }) {
    const colRef = this.getCollection(collectionName);
    const snapshot = await colRef.get();
    return snapshot.size;
  }

  async getSubCollectionCount({ parentCollection, parentId, subCollection }) {
    const colRef = this.getSubCollectionRef({
      parentCollection,
      parentId,
      subCollection,
    });
    const snapshot = await colRef.get();
    return snapshot.size;
  }

  async getAllCount(collectionName) {
    const colGroupRef = db.collectionGroup(collectionName);
    const snapshot = await colGroupRef.get();
    return snapshot.size;
  }
}

export const FirestoreApi = FirestoreApiClass.instance;
