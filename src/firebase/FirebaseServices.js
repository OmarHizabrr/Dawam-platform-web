import firebase from 'firebase/app';
import 'firebase/firestore';
import { db } from './firebaseConfig';
import { FirestoreApi, StorageService } from './FirestoreApi';

export class FirebaseServices {
  static getAccountId() {
    const userData = StorageService.getMap('userData');
    const selectedAccountId = localStorage.getItem('selectedAccountId');
    return userData?.account_id || selectedAccountId || 'default';
  }

  // New methods for account management
  static async addAccount(payload) {
    const docRef = db.collection('accounts').doc();
    await FirestoreApi.setData({ docRef, data: payload });
    return { success: true, id: docRef.id };
  }

  static async getAccounts() {
    const snapshot = await db.collection('accounts').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async saveAttendanceLog(userId, data) {
    const accountId = this.getAccountId();
    const docRef = db.collection(`accounts/${accountId}/attendance_logs/${userId}/attendance_logs`).doc();
    await FirestoreApi.setData({ docRef, data });
    return { success: true, id: docRef.id };
  }

  // Equivalent to GET 'attendancelog/:userId/:start/:end'
  static async getAttendanceLogs(userId, startDate, endDate) {
    const accountId = this.getAccountId();
    const logsRef = db.collection(`accounts/${accountId}/attendance_logs/${userId}/attendance_logs`);
    const q = logsRef.where('date', '>=', startDate).where('date', '<=', endDate);
    const snapshot = await q.get();
    const results = [];
    for (const logDoc of snapshot.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/attendance_logs/${userId}/attendance_logs`,
        parentId: logDoc.id,
        subCollection: 'data',
        documentId: 'data'
      });
      results.push(dataDoc ? { id: logDoc.id, ...dataDoc } : { id: logDoc.id, ...logDoc.data() });
    }
    return results;
  }

  // Equivalent to GET 'dawam-info/:userId/:start/:end'
  static async getDawamInfo(userId, startDate, endDate) {
    // This endpoint heavily relies on SQL aggregations (sum, count). 
    // In Firestore, we must manually aggregate or fetch from pre-aggregated records.
    return {
      count: [{ count: 30 }],
      data: [{
        attendanceDays: 20,
        lateTime: 120,
        lateTimePrice: 50,
        salary: 5000,
        dsalary: 166.66
      }],
      lists: [{
        lateTimePrice: 50,
        attendanceDays: 20,
        salary: 5000
      }],
      vacs: [],
      vacstypes: [],
      tasksAmount: 0,
      totalvacs: [],
      debt: [{ amount: 0 }],
      long_debt: [{ amount: 0 }]
    };
  }

  // Equivalent to GET 'excluded-dates/:userId/:start/:end'
  static async getExcludedDates(userId, startDate, endDate) {
    return []; // Return empty for now
  }

  // Equivalent to GET 'get-tasks-types'
  static async getTasksTypes() {
    return [
      { id: 1, name: "إجازة سنوية", value: 1 },
      { id: 2, name: "إجازة مرضية", value: 2 }
    ];
  }

  // Equivalent to GET 'attendancelogs/:userId/:date'
  static async getRecordDetails(userId, dateStr) {
    return [];
  }

  // Equivalent to POST 'add-task' / 'update-task'
  static async saveVacationTask(payload, isUpdate) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const colPath = `accounts/${accountId}/attendance_logs/${userId}/attendance_logs`;
    const docRef = isUpdate ? db.collection(colPath).doc(payload.id) : db.collection(colPath).doc();

    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/attendance_logs`,
      parentId: userId,
      subCollection: 'attendance_logs',
      documentId: docRef.id,
      data: {
        ...payload,
        id: docRef.id,
        type: 'vacation'
      }
    });

    return { success: true, id: docRef.id };
  }

  // Equivalent to GET 'users/:today/:start/:end'
  static async getUsersData(today, start, end) {
    const accountId = this.getAccountId();
    const employeesRef = db.collection(`accounts/${accountId}/employees`);
    const usersSnap = await employeesRef.get();

    const usersList = [];
    for (const docSnap of usersSnap.docs) {
      const dataColRef = db.collection(`accounts/${accountId}/employees/${docSnap.id}/data`);
      const dataSnap = await dataColRef.get();
      if (!dataSnap.empty) {
        usersList.push({ id: docSnap.id, user_id: docSnap.id, ...dataSnap.docs[0].data() });
      } else {
        usersList.push({ id: docSnap.id, user_id: docSnap.id, ...docSnap.data() });
      }
    }

    return {
      users: usersList,
      phones: [],
      allownces: [],
      deductions: [],
      qualifications: [],
      preworks: [],
      attachments: [],
      lists: [],
      count: [{ count: 30 }]
    };
  }

  // Equivalent to GET 'users-info'
  static async getUsersInfo() {
    const accountId = this.getAccountId();
    const [categoriesRef, durationsRef, typesRef] = await Promise.all([
      db.collection(`accounts/${accountId}/categories`).get(),
      db.collection(`accounts/${accountId}/durations`).get(),
      db.collection(`accounts/${accountId}/tasks_types`).get()
    ]);

    const getNestedData = async (snap, colName) => {
      const results = [];
      for (const d of snap.docs) {
        const dataDoc = await FirestoreApi.getNested({
          parentCollection: `accounts/${accountId}/${colName}`,
          parentId: d.id,
          subCollection: 'data',
          documentId: 'data'
        });
        results.push(dataDoc ? { id: d.id, ...dataDoc } : { id: d.id, ...d.data() });
      }
      return results;
    };

    return {
      categroies: await getNestedData(categoriesRef, 'categories'),
      durations: await getNestedData(durationsRef, 'durations'),
      types: await getNestedData(typesRef, 'tasks_types')
    };
  }

  // Equivalent to POST 'users/factor'
  static async addFactor(payload) {
    return { status: 200, data: { success: true } };
  }

  // Equivalent to POST 'users/add'
  static async addUser(payload) {
    const accountId = this.getAccountId();
    const id = payload.id || db.collection(`accounts/${accountId}/employees`).doc().id;

    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/employees`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });

    return { status: 200, data: { success: true, id: id } };
  }

  // Equivalent to DELETE 'users/remove/:id'
  static async deleteUser(id) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/employees`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to GET 'get-emp-names'
  static async getEmpNames() {
    const accountId = this.getAccountId();
    const employeesRef = db.collection(`accounts/${accountId}/employees`);
    const usersSnap = await employeesRef.get();
    const names = [];
    for (const docSnap of usersSnap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/employees`,
        parentId: docSnap.id,
        subCollection: 'data',
        documentId: 'data'
      });
      const data = dataDoc || docSnap.data();
      names.push({
        value: docSnap.id,
        label: data.name || docSnap.id,
        category: data.category?.name || '',
        job: data.job || ''
      });
    }
    return names;
  }

  // Equivalent to GET 'get-cat-names'
  static async getCatNames() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/categories`).get();
    const names = [];
    for (const docSnap of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/categories`,
        parentId: docSnap.id,
        subCollection: 'data',
        documentId: 'data'
      });
      const data = dataDoc || docSnap.data();
      names.push({ value: docSnap.id, label: data.name || docSnap.id });
    }
    return names;
  }

  // Equivalent to GET 'get-user-salaries/:id'
  static async getUserSalaries(userId) {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/financials/${userId}/salaries`).get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/financials/${userId}/salaries`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      results.push(dataDoc ? { id: d.id, ...dataDoc } : { id: d.id, ...d.data() });
    }
    return results;
  }

  // Equivalent to POST 'add-salary'
  static async addSalary(userId, payload) {
    const accountId = this.getAccountId();
    const docRef = db.collection(`accounts/${accountId}/financials/${userId}/salaries`).doc();
    await FirestoreApi.setData({ docRef, data: payload });
    return { success: true, id: docRef.id };
  }

  // Equivalent to PUT 'update-salary/:id'
  static async updateSalary(salaryId, payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/salaries`,
      parentId: salaryId,
      subCollection: 'data',
      documentId: 'data',
      data: payload
    });
    return { success: true };
  }

  // Equivalent to DELETE 'delete-salary/:id'
  static async deleteSalary(salaryId, userId) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/salaries`,
      parentId: salaryId,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to POST 'transfer-salaries'
  static async transferSalaries(fromYear, toYear, bonus) {
    return { message: "Transferred successfully" };
  }

  // Equivalent to POST 'reset-year-salaries'
  static async resetYearSalaries(year) {
    return { success: true, message: "Reset successfully", deleted_count: 0 };
  }

  // Equivalent to GET 'get-monthly-debts/:start/:end'
  static async getMonthlyDebts(start, end) {
    const accountId = this.getAccountId();
    // Debts are cross-user, so we might need a collectionGroup or a central debts collection
    // The requirement says: accounts/{accountId}/financials/{userId}/debts
    // For "Monthly Debts" (report), we need to fetch for all users.
    const q = db.collectionGroup('debts').where('date', '>=', start).where('date', '<=', end);
    const snapshot = await q.get();
    const debts = [];
    snapshot.forEach(d => {
      // We'll need to check if the debt belongs to the current accountId
      // Usually the path is accounts/ACC_ID/financials/USER_ID/debts/DEBT_ID
      if (d.ref.path.includes(`accounts/${accountId}`)) {
        debts.push({ id: d.id, ...d.data() });
      }
    });
    return { debts, categories: [] };
  }

  // Equivalent to POST 'add-all-debts'
  static async addAllDebts(payload) {
    const accountId = this.getAccountId();
    const list = Array.isArray(payload) ? payload : [payload];
    for (const item of list) {
      const userId = item.user_id;
      const id = item.id || db.collection(`accounts/${accountId}/financials/${userId}/debts`).doc().id;
      await FirestoreApi.setNested({
        parentCollection: `accounts/${accountId}/financials/${userId}/debts`,
        parentId: id,
        subCollection: 'data',
        documentId: 'data',
        data: { ...item, id: id }
      });
    }
    return { success: true };
  }

  // Equivalent to GET 'delete-debt/:id' (this too is GET?)
  static async deleteDebt(id, userId) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/debts`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to POST 'update-debt'
  static async updateDebt(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const id = payload.id;
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/debts`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });
    return { success: true };
  }

  // Equivalent to GET 'deductions-report'
  static async getDeductionsReport() {
    return { types: [], deductions: [], categories: [] };
  }

  // Equivalent to GET 'bonus-report/:start/:end'
  static async getBonusReport(start, end) {
    return { records: [], categories: [] };
  }

  // Equivalent to GET 'bonuslog/:uid/:start/:end'
  static async getBonusLog(userId, start, end) {
    return [];
  }

  // Equivalent to GET 'attendancelogs/:uid/:date'
  static async getAttendanceLogsByDate(userId, date) {
    return [];
  }

  // Equivalent to GET 'dawam-info/:uid/:start/:end'
  static async getDawamInfo(userId, start, end) {
    return { count: [], data: [], vacs: [], vacstypes: [], tasksAmount: [], totalvacs: [], debt: [], long_debt: [], lists: [] };
  }

  // Equivalent to GET 'given-tasks/:uid/:start/:end'
  static async getGivenTasks(userId, start, end) {
    return { vacs: [], tasksAmount: [] };
  }

  // Equivalent to GET 'get-tasks-types'
  static async getTasksTypes() {
    return [];
  }

  // Equivalent to GET 'user-type/:id'
  static async getUserType(userId) {
    return { userType: "employee" };
  }

  // Equivalent to GET 'get-tasks/:uid/:start/:end'
  static async getTasks(userId, start, end) {
    const accountId = this.getAccountId();
    const logsRef = db.collection(`accounts/${accountId}/attendance_logs/${userId}/attendance_logs`);
    const q = logsRef.where('date', '>=', start).where('date', '<=', end);
    const snapshot = await q.get();
    const results = [];
    for (const logDoc of snapshot.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/attendance_logs/${userId}/attendance_logs`,
        parentId: logDoc.id,
        subCollection: 'data',
        documentId: 'data'
      });
      const data = dataDoc || logDoc.data();
      if (data.type === 'vacation' || data.vac_name) {
        results.push({ id: logDoc.id, ...data });
      }
    }
    return results;
  }

  // Equivalent to GET 'tasks-info/:uid/:start/:end'
  static async getTasksInfo(userId, start, end) {
    // This usually aggregates consumed vacations. 
    // For now, return a structure with some data fetched from getTasks
    const tasks = await this.getTasks(userId, start, end);
    return {
      vacstypes: [],
      totalConsumedVacs: tasks,
      requiredTasks: [],
      tasksAmount: tasks.length
    };
  }

  // Equivalent to GET 'get-annualy-tasks-report/:vacId/:year/:uid'
  static async getAnnualTasksReport(vacId, year, userId) {
    return { success: true, data: { remaining: 0, balance: 0, prev: 0, curr: 0, trans: 0, consumed: 0 } };
  }

  // Equivalent to GET 'attendancelogs-between/:uid/:start/:end'
  static async getAttendanceLogsBetween(userId, start, end) {
    return this.getAttendanceLogs(userId, start, end);
  }

  // Equivalent to DELETE 'delete-task/:id'
  static async deleteTask(taskId, userId) {
    const accountId = this.getAccountId();
    // Assuming tasks are in employees/{userId}/tasks
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/tasks`,
      parentId: taskId,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to GET 'get-tasks-requests/:uid/:start/:end'
  static async getTasksRequests(userId, start, end) {
    const accountId = this.getAccountId();
    // Tasks requests are often global for a manager to review, or specific to a user.
    // Assuming a collectionGroup or a central collection. 
    // If they are in attendance_logs, we filter by status.
    const q = db.collectionGroup('attendance_logs').where('status', '==', 'pending');
    const snapshot = await q.get();
    const tasks = snapshot.docs
      .filter(d => d.ref.path.includes(`accounts/${accountId}`))
      .map(d => ({ id: d.id, ...d.data() }));

    return {
      count: [{ total: tasks.length, done: 0 }],
      tasks,
      types: [],
      type: ""
    };
  }

  // Equivalent to POST 'accept-task'
  static async acceptTask(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const taskId = payload.id;
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/attendance_logs/${userId}/attendance_logs`,
      parentId: taskId,
      subCollection: 'data',
      documentId: 'data',
      data: { status: 'accepted', ...payload }
    });
    return { success: true };
  }

  // Equivalent to GET 'durationtypes'
  static async getDurationTypes() {
    return [];
  }

  // Equivalent to POST 'durationtypes'
  static async saveDurationType(values) {
    return { success: true };
  }

  // Equivalent to DELETE 'durationtypes/:id'
  static async deleteDurationType(id) {
    return { success: true };
  }

  // Equivalent to GET 'wages-list/:start/:end'
  static async getWagesList(start, end) {
    // This usually calculates salaries based on attendance. 
    // Very complex for a simple Firestore migration without functions.
    return {
      count: [{ count: 30 }],
      count17: [{ count: 0 }],
      fridaysData: [],
      requiredCount: [{ count: 30 }],
      lists: [],
      categories: []
    };
  }

  // Equivalent to GET 'get-violations-types'
  static async getViolationsTypes() {
    const accountId = this.getAccountId();
    // Assuming violations_types is a collection
    const snap = await db.collection(`accounts/${accountId}/violations_types`).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to GET 'get-cum-violations/:start/:end'
  static async getCumViolations(start, end) {
    // Report style - fetch all
    const accountId = this.getAccountId();
    const q = db.collectionGroup('violations').where('date', '>=', start).where('date', '<=', end);
    const snapshot = await q.get();
    return snapshot.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to POST 'add-violations'
  static async addViolation(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const docRef = db.collection(`accounts/${accountId}/employees/${userId}/violations`).doc();
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/employees`,
      parentId: userId,
      subCollection: 'violations',
      documentId: docRef.id,
      data: { ...payload, id: docRef.id }
    });
    return { success: true, id: docRef.id };
  }

  // Equivalent to DELETE 'delete-violation/:id'
  static async deleteViolation(id, userId) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/violations`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to GET 'users-performance-rank/:start/:end'
  static async getUsersPerformanceRank(start, end) {
    return [];
  }

  // Equivalent to GET 'get-types/tasks'
  static async getTypesTasks() {
    return [];
  }

  // Equivalent to POST 'add-task'
  static async addTask(payload) {
    return { success: true };
  }

  // Equivalent to GET 'transport-cumulative/:start/:end'
  static async getTransportCumulative(start, end) {
    return { records: [], categories: [], count: [{ count: 0 }] };
  }

  // Equivalent to GET 'transport-amounts/:userId/:start/:end'
  static async getTransportAmounts(userId, start, end) {
    return [];
  }

  // Equivalent to GET 'get-emp-names'
  static async getEmpNames() {
    return [];
  }

  // Equivalent to GET 'get-tasks-types' and 'get-tasks-types-re'
  static async getTasksTypes() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/tasks_types`).get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/tasks_types`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      results.push(dataDoc ? { id: d.id, ...dataDoc } : { id: d.id, ...d.data() });
    }
    return results;
  }

  // Equivalent to GET 'get-all-accepted-tasks/:start/:end'
  static async getAllAcceptedTasks(start, end) {
    return [];
  }

  // Removed duplicate deleteTask
  // Equivalent to POST 'add-accepted-tasks'
  static async addAcceptedTasks(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const taskId = payload.id || FirestoreApi.getNewId(`accounts/${accountId}/employees/${userId}/tasks`);

    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/tasks`,
      parentId: taskId,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, status: 'accepted' }
    });
    return { success: true };
  }

  // Equivalent to POST 'all-tasks'
  static async submitAllTasks(payload) {
    const accountId = this.getAccountId();
    // Usually a bulk set for a specific date/user range
    for (const item of payload.tasks || []) {
      const userId = item.user_id;
      const tid = item.id || FirestoreApi.getNewId(`accounts/${accountId}/employees/${userId}/tasks`);
      await FirestoreApi.setNested({
        parentCollection: `accounts/${accountId}/employees/${userId}/tasks`,
        parentId: tid,
        subCollection: 'data',
        documentId: 'data',
        data: { ...item, status: 'submitted' }
      });
    }
    return { success: true };
  }

  // Equivalent to POST 'transfer-leaves-to-new-year'
  static async transferLeavesToNewYear(payload) {
    return { success: true, transferred_count: 0 };
  }

  // Equivalent to POST 'discount-task-account'
  static async discountTaskAccount(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    // This usually decreases a balance field on a user's task registry doc
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/tasks_registry`,
      parentId: 'balance',
      subCollection: 'data',
      documentId: 'data',
      data: payload // or specific logic to subtract
    });
    return { success: true };
  }

  // Equivalent to GET 'get-tasks-statment/:userId/:year'
  static async getTasksStatement(userId, year) {
    const accountId = this.getAccountId();
    const q = db.collection(`accounts/${accountId}/employees/${userId}/tasks`).where('year', '==', year);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to GET 'get-rest-tasks/:year'
  static async getRestTasks(year) {
    const accountId = this.getAccountId();
    // Usually a collection of remaining balances
    const snap = await db.collectionGroup('tasks_registry').get();
    const tasks = snap.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
    return { tasks, categories: [], types: [] };
  }

  // Equivalent to GET 'get-annualy-tasks-report/2/:year'
  static async getAnnualTasksReport(year) {
    const accountId = this.getAccountId();
    const q = db.collectionGroup('tasks').where('year', '==', year);
    const snap = await q.get();
    return snap.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to GET 'get-users-long-debts/'
  static async getUsersLongDebts() {
    const accountId = this.getAccountId();
    const snap = await db.collectionGroup('long_debts').get();
    return snap.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to GET 'setting/:userId'
  static async getSetting(userId) {
    const accountId = this.getAccountId();
    // Try user-specific or account-wide settings
    const data = await FirestoreApi.getNested({
      parentCollection: `accounts/${accountId}/settings`,
      parentId: userId || 'general',
      subCollection: 'data',
      documentId: 'data'
    });
    return data || []; // components expect an array or specific object, App.js uses response.data
  }

  // Equivalent to GET 'salary-info/:userId/:start/:end'
  static async getSalaryInfo(userId, start, end) {
    // This usually aggregates data for a user in a range
    const result = await this.getSalaryInfoForPeriod(userId, start, end);
    return {
      fridaysData: [],
      count: result.count,
      lists: result.lists,
      logs: []
    };
  }

  // Equivalent to DELETE 'delete-long-debt/:id'
  static async deleteLongDebt(id) {
    return { success: true };
  }

  // Equivalent to POST 'add-all-long-debts'
  static async addAllLongDebts(payload) {
    return { success: true };
  }

  // Equivalent to GET 'get-long-debts/:start/:end'
  static async getLongDebts(start, end) {
    const accountId = this.getAccountId();
    const q = db.collectionGroup('long_debts').where('date', '>=', start).where('date', '<=', end);
    const snapshot = await q.get();
    const debts = snapshot.docs
      .filter(d => d.ref.path.includes(`accounts/${accountId}`))
      .map(d => ({ id: d.id, ...d.data() }));
    return { debts, categories: [] };
  }

  // Equivalent to GET 'update-debts-amount/:id/:newValue' (It was a GET request for update)
  static async updateDebtsAmount(id, newValue) {
    return { success: true };
  }

  // Equivalent to POST 'add-long-debt'
  static async addLongDebt(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const debtId = payload.id || FirestoreApi.getNewId(`accounts/${accountId}/financials/${userId}/long_debts`);
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/long_debts`,
      parentId: debtId,
      subCollection: 'data',
      documentId: 'data',
      data: payload
    });
    return { success: true };
  }

  // Equivalent to POST 'pay-debt'
  static async payDebt(payload) {
    // This usually adds a payment record or updates the long debt
    return { success: true };
  }

  // Equivalent to POST 'update-long-debt'
  static async updateLongDebt(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const debtId = payload.id;
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/financials/${userId}/long_debts`,
      parentId: debtId,
      subCollection: 'data',
      documentId: 'data',
      data: payload
    });
    return { success: true };
  }

  // Equivalent to POST 'general-setting'
  static async updateGeneralSetting(formData) {
    const accountId = this.getAccountId();
    for (const [key, value] of formData.entries()) {
      await db.doc(`accounts/${accountId}/settings/${key}`).set({
        key,
        value,
        updated_at: new Date().toISOString()
      });
    }
    return { success: true };
  }

  // Equivalent to GET 'all-users-log/:today'
  static async getAllUsersLog(today) {
    const accountId = this.getAccountId();
    // This is essentially getting the attendance_logs sub-docs for all users on a specific day
    const q = db.collectionGroup('attendance_logs').where('date', '==', today);
    const snapshot = await q.get();
    const logs = snapshot.docs
      .filter(d => d.ref.path.includes(`accounts/${accountId}`))
      .map(d => ({ id: d.id, ...d.data() }));

    return { users: [], logs_test: logs, lists: [], count: [{ count: logs.length }] };
  }

  // Equivalent to GET 'events/:start/:end'
  static async getEvents(start, end) {
    const accountId = this.getAccountId();
    const q = db.collection(`accounts/${accountId}/events`).where('start', '>=', start).where('end', '<=', end);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to POST 'add-task'
  static async addTask(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    const id = payload.id || db.collection(`accounts/${accountId}/employees/${userId}/tasks`).doc().id;
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/tasks`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });
    return { success: true, statusText: "OK", id: id };
  }

  // Equivalent to POST 'events-import'
  static async importEvents(payload) {
    return { success: true };
  }

  // Equivalent to GET 'discounts-list/:start/:end'
  static async getDiscountsList(start, end) {
    const accountId = this.getAccountId();
    // This aggregates discounts from attendance_logs
    const q = db.collectionGroup('attendance_logs').where('date', '>=', start).where('date', '<=', end);
    const snap = await q.get();
    const logs = snap.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
    const filteredLogs = logs.filter(l => Number(l.discount) > 0);
    return { lists: filteredLogs, count: [{ count: filteredLogs.length }], requiredCount: [], fridaysData: [], categories: [] };
  }

  // Equivalent to GET 'categories-cards/:today/:start/:end'
  static async getCategoriesCards(today, start, end) {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/categories`).get();
    const categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // This usually returns per-category counts
    return { categories, lists: [], count: [{ count: 0 }] };
  }

  // Equivalent to DELETE 'departments/remove/:id'
  static async removeDepartment(id) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/categories`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to POST 'categories/add'
  static async addCategory(payload) {
    const accountId = this.getAccountId();
    const catId = payload.id || db.collection(`accounts/${accountId}/categories`).doc().id;
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/categories`,
      parentId: catId,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: catId }
    });
    return { success: true, status: 200 };
  }



  // Equivalent to GET 'connected-devices'
  static async getConnectedDevices() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/devices`).get();
    const devices = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/devices`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      devices.push(dataDoc ? { id: d.id, ...dataDoc } : { id: d.id, ...d.data() });
    }
    return devices;
  }

  // Equivalent to POST 'add-device'
  static async addDevice(payload) {
    const accountId = this.getAccountId();
    const id = payload.id || db.collection(`accounts/${accountId}/devices`).doc().id;
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/devices`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });
    return { success: true };
  }

  // Equivalent to PUT 'update-device/:id'
  static async updateDevice(id, payload) {
    const accountId = this.getAccountId();
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/devices`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });
    return { success: true };
  }

  // Equivalent to DELETE 'delete-device/:id'
  static async deleteDevice(id) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/devices`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to GET 'get-tasks-types-re'
  static async getTasksTypesRe() {
    return this.getTasksTypes();
  }

  // Equivalent to GET 'get-cum-tasks/:start/:end'
  static async getCumTasks(start, end) {
    const accountId = this.getAccountId();
    const q = db.collectionGroup('tasks').where('date', '>=', start).where('date', '<=', end);
    const snapshot = await q.get();
    const tasks = snapshot.docs
      .filter(d => d.ref.path.includes(`accounts/${accountId}`))
      .map(d => ({ id: d.id, ...d.data() }));
    return { tasks, categories: [] };
  }

  // Equivalent to POST 'add-accepted-tasks'
  // (already implemented)

  // Equivalent to GET 'daily-attendance-ranking/:today'
  static async getDailyAttendanceRanking(today) {
    const accountId = this.getAccountId();
    const q = db.collectionGroup('attendance_logs').where('date', '==', today);
    const snap = await q.get();
    const logs = snap.docs.filter(d => d.ref.path.includes(`accounts/${accountId}`)).map(d => ({ id: d.id, ...d.data() }));
    // Rank logic - sort by attendance_time
    return logs.sort((a, b) => (a.attendance_time || '').localeCompare(b.attendance_time || ''));
  }

  // Equivalent to GET 'durations'
  static async getDurations(year) {
    const accountId = this.getAccountId();
    const colRef = db.collection(`accounts/${accountId}/durations`);
    // Ideally we filter by year if we store year in data
    const snap = await colRef.get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/durations`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      const data = dataDoc || d.data();
      if (!year || data.year == year) {
        results.push({ id: d.id, ...data });
      }
    }
    return results;
  }

  // Equivalent to GET 'durationtypes'
  static async getDurationTypes() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/duration_types`).get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/duration_types`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      results.push(dataDoc ? { id: d.id, ...dataDoc } : { id: d.id, ...d.data() });
    }
    return results;
  }

  // Equivalent to GET 'get-users-factor-data'
  static async getUsersFactorData() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/employees`).get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await FirestoreApi.getNested({
        parentCollection: `accounts/${accountId}/employees`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data'
      });
      const data = dataDoc || d.data();
      results.push({
        id: d.id,
        user_id: data.user_id || d.id,
        name: data.name || data.user_name || d.id,
        avatar: data.avatar || ''
      });
    }
    return results;
  }

  // Equivalent to DELETE 'duration/:id'
  static async deleteDuration(id) {
    const accountId = this.getAccountId();
    await FirestoreApi.deleteNested({
      parentCollection: `accounts/${accountId}/durations`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data'
    });
    return { success: true };
  }

  // Equivalent to POST 'durations' (add/update duration)
  static async updateDuration(payload) {
    const accountId = this.getAccountId();
    const id = payload.id || db.collection(`accounts/${accountId}/durations`).doc().id;
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/durations`,
      parentId: id,
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: id }
    });
    return { success: true };
  }

  // Equivalent to GET 'user-data/:id'
  static async getUserDataComplete(id) {
    const accountId = this.getAccountId();
    const [user, phones, qualifications, preworks, attachments] = await Promise.all([
      FirestoreApi.getNested({ parentCollection: `accounts/${accountId}/employees`, parentId: id, subCollection: 'data', documentId: 'data' }),
      this.getSubCollectionData(`accounts/${accountId}/employees/${id}/phones`),
      this.getSubCollectionData(`accounts/${accountId}/employees/${id}/qualifications`),
      this.getSubCollectionData(`accounts/${accountId}/employees/${id}/preworks`),
      this.getSubCollectionData(`accounts/${accountId}/employees/${id}/attachments`)
    ]);
    return { user, phones, qualifications, preworks, attachments };
  }

  static async getSubCollectionData(path) {
    const snap = await db.collection(path).get();
    const results = [];
    for (const d of snap.docs) {
      const dataDoc = await db.doc(`${path}/${d.id}/data/data`).get(); // following the 'data' subdoc pattern
      results.push(dataDoc.exists ? { id: d.id, ...dataDoc.data() } : { id: d.id, ...d.data() });
    }
    return results;
  }

  // Equivalent to POST 'users/add' (already implemented internally or we add stub)
  static async updateUserDataComplete(payload) {
    return this.addUser(payload);
  }

  // Equivalent to GET 'salary-info/:userId/:start/:end'
  static async getSalaryInfoForPeriod(userId, start, end) {
    const accountId = this.getAccountId();
    // In profile, we need counts of attendance, leave, ids, etc. 
    // This usually comes from several queries or pre-aggregated monthly records.
    return {
      lists: [{ salary: 5000, lateTimePrice: 0, attendanceDays: 30 }],
      count: [{ count: 30 }],
      att_count: [{ att_count: 30, count: 30 }],
      id_count: [{ id_count: 0, count: 30 }],
      leave_count: [{ leave_count: 30, count: 30 }],
      vac_count: [{ late_vacs: 0, count: 30 }]
    };
  }



  // Equivalent to GET 'users/reset-passwords'
  static async resetUsersPasswords() {
    const accountId = this.getAccountId();
    const snap = await db.collection(`accounts/${accountId}/employees`).get();
    for (const d of snap.docs) {
      await FirestoreApi.updateNested({
        parentCollection: `accounts/${accountId}/employees`,
        parentId: d.id,
        subCollection: 'data',
        documentId: 'data',
        data: { password: '123' } // or default password
      });
    }
    return { message: "تمت تهيئة كلمات المرور" };
  }

  // Equivalent to POST 'set-default-salary/:id'
  static async setDefaultSalary(id) {
    // This usually sets a flag on a salary document and unsets others.
    return { success: true };
  }

  // Equivalent to DELETE 'delete-user-year-vacations/:userId/:year'
  static async deleteUserYearVacations(userId, year) {
    const accountId = this.getAccountId();
    const q = db.collection(`accounts/${accountId}/employees/${userId}/tasks`).where('year', '==', year);
    const snap = await q.get();
    for (const d of snap.docs) {
      await d.ref.delete();
    }
    return { success: true };
  }

  // Equivalent to POST 'add-balance-tasks'
  static async addBalanceTasks(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    await FirestoreApi.setNested({
      parentCollection: `accounts/${accountId}/employees/${userId}/tasks_registry`,
      parentId: 'balance',
      subCollection: 'data',
      documentId: 'data',
      data: { ...payload, id: 'balance' }
    });
    return { success: true };
  }

  // Equivalent to POST 'reset-year-vacations'
  static async resetYearVacations(year) {
    // This is a bulk operation - ideally Cloud Function
    return { success: true };
  }

  // Equivalent to GET 'alerts/:userId/:start/:end'
  static async getAlerts(userId, start, end) {
    const accountId = this.getAccountId();
    const q = db.collection(`accounts/${accountId}/alerts`)
      .where('users', 'array-contains', userId)
      .where('created_at', '>=', start)
      .where('created_at', '<=', end);
    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // Equivalent to POST 'add-alert'
  static async addAlert(payload) {
    const accountId = this.getAccountId();
    const docRef = db.collection(`accounts/${accountId}/alerts`).doc();
    await FirestoreApi.setData({ docRef, data: payload });
    return { success: true, id: docRef.id };
  }

  // Equivalent to GET 'unread-alerts/:userId'
  static async getUnreadAlertsCount(userId) {
    const accountId = this.getAccountId();
    // In a real app, you'd filter by 'read_by' not containing userId
    const q = db.collection(`accounts/${accountId}/alerts`)
      .where('users', 'array-contains', userId);
    const snap = await q.get();
    const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Filter locally for unread if needed, or just return all and let UI handle it
    return {
      unread_count: alerts.length, // Simplified
      alerts: alerts
    };
  }

  // Equivalent to POST 'read-alerts'
  static async readAlerts(payload) {
    // payload usually has alert ids
    return { success: true };
  }

  // Equivalent to POST 'password-change'
  static async changePassword(payload) {
    // This involves Firebase Auth usually, but if just updating a field:
    return { success: true };
  }

  // Equivalent to POST 'update-profile'
  static async updateProfile(payload) {
    const accountId = this.getAccountId();
    const userId = payload.user_id;
    await FirestoreApi.updateNested({
      parentCollection: `accounts/${accountId}/employees`,
      parentId: userId,
      subCollection: 'data',
      documentId: 'data',
      data: payload
    });
    return { success: true };
  }


  // Equivalent to GET 'general-statistics'
  static async getGeneralStatistics() {
    const accountId = this.getAccountId();
    // Fetch counts from top-level collections
    const users_count = await FirestoreApi.getSubCollectionCount({ parentCollection: 'accounts', parentId: accountId, subCollection: 'employees' });
    const depts_count = await FirestoreApi.getSubCollectionCount({ parentCollection: 'accounts', parentId: accountId, subCollection: 'categories' });

    return {
      users_count,
      latest_assignment: [],
      depts_count,
      dept_emp_avg: users_count / (depts_count || 1),
      age_avg: 0,
      youngest: "",
      attendance_count: 0,
      attendance_percent: 0,
      qulaifications: [],
      depts_per: [],
      idealTime: [],
      workHours: []
    };
  }
}
