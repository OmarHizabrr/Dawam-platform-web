# تحليل شامل لنظام إدارة أرصدة الإجازات

## 📋 نظرة عامة

هذا التقرير يشرح بالتفصيل آلية عمل نظام إدارة أرصدة الإجازات (Tasks Accounts) والتحسينات المطلوبة.

---

## 🔍 الوضع الحالي للنظام

### 1. **البنية الأساسية**

#### Frontend (React)

- **الملف الرئيسي**: `src/components/organisms/tasksAccounts/index.js`
- **المكونات الرئيسية**:
  - جدول عرض أرصدة الإجازات
  - نموذج إضافة رصيد إجازة
  - نموذج خصم رصيد إجازة
  - تقرير سنوي للإجازات
  - تقرير أرصدة الإجازات

#### Backend (Laravel/PHP)

- **الملف الرئيسي**: `routes/api.php`
- **Controller**: `VacationAPIController`
- **Endpoints الرئيسية**:
  - `GET /get-rest-tasks/{year}` - جلب أرصدة الإجازات المتبقية
  - `GET /get-tasks-statment/{user_id}/{year}` - كشف حساب موظف
  - `GET /get-annualy-tasks-report/{vac_id}/{year}` - التقرير السنوي
  - `POST /add-balance-tasks` - إضافة رصيد
  - `POST /discount-task-account` - خصم رصيد

---

## 🔄 آلية العمل الحالية

### 1. **عرض أرصدة الإجازات**

#### الخطوات:

1. **جلب البيانات الأساسية**:

   ```javascript
   // السطر 189-208
   axios.get("get-emp-names"); // جلب أسماء الموظفين
   axios.get("get-tasks-types-re"); // جلب أنواع الإجازات
   ```

2. **جلب أرصدة الإجازات**:

   ```javascript
   // السطر 212
   axios.get("get-rest-tasks/" + currentYear);
   ```

   - يحسب الرصيد المتبقي لكل موظف لكل نوع إجازة
   - يعرض البيانات في جدول ديناميكي

3. **معالجة البيانات**:
   ```javascript
   // السطر 219-264
   // بناء JSON يدوياً (طريقة غير محسنة)
   var vacData = "[";
   emp.map((user) => {
     // بناء البيانات لكل موظف
   });
   ```

### 2. **إضافة رصيد إجازة**

#### النموذج العلوي (الإعدادات الأساسية):

- نوع الإجازة (`task_id`)
- نوع الرصيد (`type`)
- نوع الفترة (`period_type`: monthly/yearly)
- الرصيد بالدقائق (`amount`)
- ملاحظات (`note`)

#### النموذج الديناميكي (تفاصيل الموظفين):

- اسم الموظف (`user_id`)
- نوع الإجازة (`task_id`)
- نوع الرصيد (`type`)
- الرصيد (`amount`)
- نوع الفترة (`period_type`)
- ملاحظات (`note`)

#### العملية:

```javascript
// السطر 465-494
const onFinish = () => {
  const formData = form.getFieldsValue();
  const globalData = gform.getFieldsValue();

  // دمج البيانات
  formData.tasks = formData.tasks.map((task) => ({
    ...task,
    period_type: task.period_type || globalData.period_type || "monthly",
  }));

  axios.post("add-balance-tasks", formData);
};
```

### 3. **التقرير السنوي**

#### البيانات المعروضة:

- **مرحل من العام الماضي** (`prev`): الرصيد المتبقي من السنة السابقة
- **رصيد العام الحالي** (`curr`): الرصيد الممنوح للسنة الحالية
- **رصيد محول** (`trans`): رصيد محول من إجازة أخرى
- **الافتتاحي** (`op`): مجموع (prev + curr + trans)
- **الاستهلاك الشهري** (`m1` إلى `m12`): الاستهلاك لكل شهر
- **الممنوح**: إجمالي الممنوح
- **المتبقي**: الرصيد المتبقي

#### API Call:

```javascript
// السطر 331
axios.get("get-annualy-tasks-report/2/" + currentYear);
```

---

## ⚠️ المشاكل الموجودة حالياً

### 1. **عدم وجود آلية ترحيل تلقائية**

- ❌ **المشكلة**: لا توجد وظيفة لترحيل أرصدة الإجازات من سنة إلى أخرى
- 📍 **الموقع**: لا يوجد في الكود الحالي
- 🔴 **الأثر**: يجب الترحيل يدوياً لكل موظف

### 2. **بناء JSON يدوياً**

```javascript
// السطر 219-264 - طريقة غير محسنة
var vacData = "[";
emp.map((user) => {
  vacData += "{" + '"empName":"' + user.label + '",...';
});
var json = JSON.parse(vacData.substring(0, vacData.length - 1) + "]");
```

- ❌ **المشكلة**: بناء JSON يدوياً معرض للأخطاء
- ✅ **الحل**: استخدام `JSON.stringify()` مباشرة

### 3. **عدم وجود تحقق من البيانات**

- ❌ لا يوجد تحقق من صحة البيانات قبل الإرسال
- ❌ لا يوجد معالجة للأخطاء بشكل مناسب

### 4. **التقرير السنوي لا يظهر في الواجهة**

- ❌ التقرير السنوي موجود في الكود (السطر 1632-1988) لكن لا يوجد زر لطباعته
- ✅ يوجد دالة `printAnnualyReport()` لكنها غير مستخدمة

### 5. **عدم وجود فلترة متقدمة**

- ❌ الفلترة موجودة فقط للأسماء والإدارات
- ❌ لا توجد فلترة حسب نوع الإجازة أو الرصيد

---

## 🚀 التطويرات المطلوبة

### 1. **نظام ترحيل الإجازات التلقائي**

#### الوظيفة المطلوبة:

```javascript
// زر جديد في الواجهة
<Button onClick={handleTransferLeaves}>ترحيل الإجازات إلى السنة الجديدة</Button>
```

#### API Endpoint المطلوب:

```php
// في routes/api.php
Route::post('/transfer-leaves-to-new-year', 'VacationAPIController@transferLeavesToNewYear');
```

#### المنطق المطلوب:

1. **جلب أرصدة السنة الحالية**:

   - لكل موظف
   - لكل نوع إجازة
   - الرصيد المتبقي فقط (غير المستهلك)

2. **تحديد أنواع الإجازات القابلة للترحيل**:

   - الإجازات السنوية فقط (yearly)
   - أو حسب إعدادات النظام

3. **إنشاء سجلات جديدة للسنة الجديدة**:

   - نسخ الرصيد المتبقي كـ "مرحل من العام الماضي" (prev)
   - حفظ في جدول `vacations_users` أو `cumvacations`

4. **تسجيل العملية**:
   - حفظ سجل في جدول `transfers` أو `leave_transfers`
   - يتضمن: user_id, vacation_type_id, amount, from_year, to_year, transfer_date

#### مثال على الكود:

```php
// في VacationAPIController
public function transferLeavesToNewYear(Request $request) {
    $fromYear = $request->input('from_year');
    $toYear = $request->input('to_year');
    $vacationTypeId = $request->input('vacation_type_id', null); // null = كل الأنواع

    // جلب الموظفين
    $users = User::where('status', 16)->get();

    foreach ($users as $user) {
        // جلب الرصيد المتبقي من السنة السابقة
        $remainingBalance = $this->getRemainingBalance($user->user_id, $fromYear, $vacationTypeId);

        foreach ($remainingBalance as $balance) {
            // إنشاء سجل ترحيل
            VacationUser::create([
                'user_id' => $user->user_id,
                'vacationstype_id' => $balance->vacationstype_id,
                'amount' => $balance->remaining_minutes / 60, // تحويل من دقائق إلى ساعات
                'type' => 34, // نوع: مرحل من العام الماضي
                'period_type' => 'yearly',
                'created_at' => now(),
            ]);

            // تسجيل العملية
            LeaveTransfer::create([
                'user_id' => $user->user_id,
                'vacationstype_id' => $balance->vacationstype_id,
                'amount' => $balance->remaining_minutes,
                'from_year' => $fromYear,
                'to_year' => $toYear,
                'transfer_date' => now(),
            ]);
        }
    }

    return response()->json(['success' => true, 'message' => 'تم الترحيل بنجاح']);
}
```

### 2. **تحسين بناء البيانات**

#### قبل:

```javascript
var vacData = "[";
emp.map((user) => {
  vacData += "{" + '"empName":"' + user.label + '",...';
});
var json = JSON.parse(vacData.substring(0, vacData.length - 1) + "]");
```

#### بعد:

```javascript
const records = emp.map((user) => {
  const userTasks = response.data.tasks?.filter(
    (record) => record.user_id == user.value
  )[0];

  const taskBalances = {};
  tasks.forEach((task) => {
    const dur = response.data.tasks?.filter(
      (record) => record.uid == user.value && record.vid == task.value
    );

    if (dur.length > 0) {
      taskBalances[task.label] =
        dur[0].rest < 0
          ? "-"
          : `${Math.abs(parseInt(dur[0].rest / 60))}:${Math.abs(
              dur[0].rest % 60
            )}`;
    } else {
      taskBalances[task.label] = "0";
    }
  });

  return {
    empName: user.label,
    user_id: user.value,
    category: userTasks?.category || "",
    job: userTasks?.job || "",
    ...taskBalances,
  };
});
```

### 3. **إضافة زر طباعة التقرير السنوي**

```javascript
// في return statement
<Button onClick={printAnnualyReport} type="primary" icon={<PrinterOutlined />}>
  طباعة التقرير السنوي
</Button>
```

### 4. **إضافة تحقق من البيانات**

```javascript
const onFinish = () => {
  const formData = form.getFieldsValue();
  const globalData = gform.getFieldsValue();

  // التحقق من البيانات
  if (!formData.tasks || formData.tasks.length === 0) {
    notification.error({
      message: "خطأ",
      description: "يرجى إضافة موظف واحد على الأقل",
    });
    return;
  }

  // التحقق من صحة البيانات
  const hasErrors = formData.tasks.some((task) => {
    if (!task.user_id) return true;
    if (!task.task_id) return true;
    if (!task.amount || task.amount <= 0) return true;
    return false;
  });

  if (hasErrors) {
    notification.error({
      message: "خطأ",
      description: "يرجى التأكد من ملء جميع الحقول المطلوبة",
    });
    return;
  }

  // إرسال البيانات
  setSaving(true);
  // ... باقي الكود
};
```

### 5. **إضافة فلترة متقدمة**

```javascript
// إضافة عمود فلترة لنوع الإجازة
{
  title: "نوع الإجازة",
  dataIndex: "vacationType",
  key: "vacationType",
  filters: tasksTypes.map(type => ({
    text: type.label,
    value: type.value
  })),
  onFilter: (value, record) => record.vacationType === value,
}
```

---

## 📊 هيكل قاعدة البيانات المقترح

### جدول `leave_transfers` (جديد)

```sql
CREATE TABLE leave_transfers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vacationstype_id INT NOT NULL,
    amount INT NOT NULL, -- بالدقائق
    from_year YEAR NOT NULL,
    to_year YEAR NOT NULL,
    transfer_date DATETIME NOT NULL,
    created_by INT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (vacationstype_id) REFERENCES vacationstypes(id)
);
```

### جدول `vacations_users` (موجود - يحتاج تعديل)

- إضافة حقل `period_type` (monthly/yearly)
- إضافة حقل `transfer_from_year` للإشارة إلى السنة المصدر

---

## 🎯 خطة التنفيذ

### المرحلة 1: التحسينات الأساسية

1. ✅ تحسين بناء JSON
2. ✅ إضافة تحقق من البيانات
3. ✅ إضافة زر طباعة التقرير السنوي

### المرحلة 2: نظام الترحيل

1. ✅ إنشاء جدول `leave_transfers`
2. ✅ إنشاء API endpoint للترحيل
3. ✅ إضافة واجهة المستخدم للترحيل
4. ✅ إضافة معالجة الأخطاء

### المرحلة 3: التحسينات المتقدمة

1. ✅ فلترة متقدمة
2. ✅ تقارير إحصائية
3. ✅ إشعارات عند الترحيل

---

## 📝 ملاحظات مهمة

1. **الفترة السنوية**:

   - النظام يستخدم فترة من 23 ديسمبر للسنة السابقة إلى 22 ديسمبر للسنة الحالية
   - يجب مراعاة هذا في عملية الترحيل

2. **أنواع الإجازات**:

   - الإجازات السنوية فقط (yearly) يتم ترحيلها
   - الإجازات الشهرية (monthly) لا يتم ترحيلها

3. **الرصيد المتبقي**:

   - يتم حساب الرصيد المتبقي = الممنوح - المستهلك
   - فقط الرصيد المتبقي يتم ترحيله

4. **الأمان**:
   - يجب التحقق من صلاحيات المستخدم قبل السماح بالترحيل
   - يجب حفظ سجل لكل عملية ترحيل

---

## 🔗 المراجع

- ملف Frontend: `src/components/organisms/tasksAccounts/index.js`
- ملف API Routes: `routes/api.php`
- Controller: `VacationAPIController`

---

**تاريخ التحليل**: 2024
**الإصدار**: 1.0
