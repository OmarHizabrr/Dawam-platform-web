# كيفية إصلاح مشكلة ترحيل الإجازات

## المشكلة
```
Method App\Http\Controllers\API\VacationAPIController::transferLeavesToNewYear does not exist.
```

## الحل

### الخطوة 1: فتح ملف الـ Controller
افتح الملف التالي على الخادم:
```
app/Http/Controllers/API/VacationAPIController.php
```

### الخطوة 2: إضافة الدالة المطلوبة
أضف الدالتين التاليتين إلى الـ Controller:

#### 1. الدالة الرئيسية `transferLeavesToNewYear`
```php
/**
 * ترحيل أرصدة الإجازات من سنة إلى أخرى
 * 
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function transferLeavesToNewYear(Request $request)
{
    try {
        $fromYear = $request->input('from_year');
        $toYear = $request->input('to_year');
        $vacationTypeIds = $request->input('vacation_types', null);
        $userIds = $request->input('users', null);

        // التحقق من البيانات
        if (!$fromYear || !$toYear) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد السنة المصدر والهدف'
            ], 400);
        }

        if ($fromYear >= $toYear) {
            return response()->json([
                'success' => false,
                'message' => 'السنة الهدف يجب أن تكون أكبر من السنة المصدر'
            ], 400);
        }

        // جلب الموظفين
        $usersQuery = User::where('status', 16);
        if ($userIds && is_array($userIds) && count($userIds) > 0) {
            $usersQuery->whereIn('user_id', $userIds);
        }
        $users = $usersQuery->get();

        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على موظفين للترحيل'
            ], 404);
        }

        $transferredCount = 0;

        DB::beginTransaction();

        try {
            foreach ($users as $user) {
                // جلب الرصيد المتبقي من السنة السابقة
                $remainingBalances = $this->getRemainingBalanceForYear(
                    $user->user_id,
                    $fromYear,
                    $vacationTypeIds
                );

                foreach ($remainingBalances as $balance) {
                    // التحقق من وجود رصيد متبقي
                    if ($balance->remaining_minutes <= 0) {
                        continue;
                    }

                    // إنشاء سجل ترحيل في vacations_users
                    VacationUser::create([
                        'user_id' => $user->user_id,
                        'vacationstype_id' => $balance->vacationstype_id,
                        'amount' => $balance->remaining_minutes / 60, // تحويل من دقائق إلى ساعات
                        'type' => 34, // نوع: مرحل من العام الماضي (يجب التحقق من القيمة الصحيحة)
                        'period_type' => 'yearly',
                        'note' => "مرحل من سنة {$fromYear} إلى سنة {$toYear}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // تسجيل العملية في leave_transfers
                    LeaveTransfer::create([
                        'user_id' => $user->user_id,
                        'vacationstype_id' => $balance->vacationstype_id,
                        'amount' => $balance->remaining_minutes,
                        'from_year' => $fromYear,
                        'to_year' => $toYear,
                        'transfer_date' => now(),
                        'created_by' => auth()->id() ?? null,
                        'notes' => "ترحيل تلقائي من سنة {$fromYear}",
                    ]);

                    $transferredCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم الترحيل بنجاح',
                'transferred_count' => $transferredCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Transfer leaves error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء الترحيل: ' . $e->getMessage()
        ], 500);
    }
}
```

#### 2. الدالة المساعدة `getRemainingBalanceForYear`
```php
/**
 * حساب الرصيد المتبقي من السنة
 * 
 * @param int $userId
 * @param string $year
 * @param array|null $vacationTypeIds
 * @return array
 */
private function getRemainingBalanceForYear($userId, $year, $vacationTypeIds = null)
{
    // حساب الفترة السنوية (من 23 ديسمبر للسنة السابقة إلى 22 ديسمبر للسنة الحالية)
    // يمكن تعديل هذا المنطق حسب نظام السنة المالية المستخدم
    $yearStart = ($year - 1) . "-12-23";
    $yearEnd = $year . "-12-22";

    // جلب الرصيد الممنوح
    $grantedQuery = DB::table('vacations_users')
        ->select('vacationstype_id', DB::raw('SUM(amount) * 60 as granted_minutes'))
        ->where('user_id', $userId)
        ->whereBetween('created_at', [$yearStart, $yearEnd])
        ->groupBy('vacationstype_id');

    if ($vacationTypeIds && is_array($vacationTypeIds) && count($vacationTypeIds) > 0) {
        $grantedQuery->whereIn('vacationstype_id', $vacationTypeIds);
    }

    $granted = $grantedQuery->get();

    // جلب الرصيد المستهلك
    $consumedQuery = DB::table('attendancelogs')
        ->select('type as vacationstype_id', DB::raw('SUM(TIME_TO_SEC(TIMEDIFF(leave_time, attendance_time))) as consumed_seconds'))
        ->where('user_id', $userId)
        ->where('type', '>', 0)
        ->whereBetween('date', [$yearStart, $yearEnd])
        ->groupBy('type');

    if ($vacationTypeIds && is_array($vacationTypeIds) && count($vacationTypeIds) > 0) {
        $consumedQuery->whereIn('type', $vacationTypeIds);
    }

    $consumed = $consumedQuery->get();

    // حساب الرصيد المتبقي
    $remaining = [];
    foreach ($granted as $grant) {
        $consumedItem = $consumed->firstWhere('vacationstype_id', $grant->vacationstype_id);
        $consumedMinutes = $consumedItem ? ($consumedItem->consumed_seconds / 60) : 0;
        $remainingMinutes = ($grant->granted_minutes) - $consumedMinutes;

        if ($remainingMinutes > 0) {
            $remaining[] = (object)[
                'vacationstype_id' => $grant->vacationstype_id,
                'remaining_minutes' => $remainingMinutes
            ];
        }
    }

    return $remaining;
}
```

### الخطوة 3: التأكد من وجود الـ Imports المطلوبة
تأكد من وجود الـ imports التالية في أعلى الملف:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\User;
use App\VacationUser;
use App\LeaveTransfer;
```

### الخطوة 4: التأكد من وجود الـ Route
تأكد من وجود الـ Route التالي في `routes/api.php`:

```php
Route::post('/transfer-leaves-to-new-year', 'VacationAPIController@transferLeavesToNewYear');
```

أو إذا كنت تستخدم Laravel 8+:

```php
Route::post('/transfer-leaves-to-new-year', [VacationAPIController::class, 'transferLeavesToNewYear']);
```

### الخطوة 5: التحقق من وجود الـ Models
تأكد من وجود الـ Models التالية:
- `App\User`
- `App\VacationUser`
- `App\LeaveTransfer`

### الخطوة 6: اختبار الـ API
بعد إضافة الكود، اختبر الـ API باستخدام:

```bash
curl -X POST https://api.alhikma-ye.com/api/transfer-leaves-to-new-year \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "from_year": "2023",
    "to_year": "2024"
  }'
```

## ملاحظات مهمة

1. **نوع الترحيل (type)**: القيمة `34` في السطر `'type' => 34` قد تحتاج إلى تعديل حسب نظامك. تحقق من القيم الصحيحة في جدول `vacations_users`.

2. **الفترة السنوية**: الكود الحالي يستخدم الفترة من 23 ديسمبر للسنة السابقة إلى 22 ديسمبر للسنة الحالية. قد تحتاج إلى تعديل هذا حسب نظام السنة المالية المستخدم في مؤسستك.

3. **الصلاحيات**: تأكد من أن المستخدم لديه صلاحيات الوصول إلى هذا الـ endpoint.

4. **النسخ الاحتياطي**: قبل تشغيل الترحيل على بيانات حقيقية، تأكد من عمل نسخة احتياطية من قاعدة البيانات.

## بعد الإصلاح

بعد إضافة الكود، يجب أن يعمل النظام بشكل صحيح. إذا استمرت المشكلة، تحقق من:
- سجلات الأخطاء في `storage/logs/laravel.log`
- أن جميع الـ Models موجودة ومُعرّفة بشكل صحيح
- أن الـ Route موجود ومُسجّل بشكل صحيح

