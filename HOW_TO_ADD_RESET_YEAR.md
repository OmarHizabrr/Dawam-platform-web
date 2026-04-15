# كيفية إضافة وظيفة تصفير السنة

## الخطوة 1: إضافة الدالة في VacationAPIController.php

افتح الملف التالي:
```
e:\alhiqma\dwam_All\dawamPakend\app\Http\Controllers\API\VacationAPIController.php
```

أضف الدالة التالية في نهاية الـ Controller (قبل آخر قوس إغلاق):

```php
/**
 * تصفير جميع الإجازات لسنة محددة
 * 
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function resetYearVacations(Request $request)
{
    try {
        $year = $request->input('year');
        
        // التحقق من البيانات
        if (!$year) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تحديد السنة'
            ], 400);
        }

        // حساب فترة السنة (من 23 ديسمبر السنة السابقة إلى 22 ديسمبر السنة الحالية)
        $year = (int) $year;
        $yearStart = ($year - 1) . "-12-23";
        $yearEnd = $year . "-12-22";

        // حذف جميع سجلات vacations_users للسنة المحددة
        $deletedCount = DB::table('vacations_users')
            ->whereBetween(DB::raw('DATE(created_at)'), [$yearStart, $yearEnd])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "تم تصفير جميع الإجازات لسنة {$year} بنجاح",
            'deleted_count' => $deletedCount
        ]);

    } catch (\Exception $e) {
        \Log::error('Reset year vacations error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء التصفير: ' . $e->getMessage()
        ], 500);
    }
}
```

## الخطوة 2: إضافة Route في api.php

افتح الملف:
```
e:\alhiqma\dwam_All\dawamPakend\routes\api.php
```

أضف السطر التالي في قسم Routes المتعلق بالإجازات:

```php
Route::post('/reset-year-vacations', 'VacationAPIController@resetYearVacations');
```

## ملاحظات مهمة:

1. **هذا الإجراء لا يمكن التراجع عنه**: عند تصفير السنة، سيتم حذف جميع سجلات `vacations_users` للسنة المحددة بشكل دائم.

2. **فترة السنة**: يتم حساب فترة السنة من 23 ديسمبر السنة السابقة إلى 22 ديسمبر السنة الحالية (نفس منطق `getTaskStatment`).

3. **التحقق**: تأكد من أن الدالة تستخدم نفس منطق حساب فترة السنة المستخدم في `getTaskStatment`.

4. **الاختبار**: بعد إضافة الدالة، اختبرها على بيئة التطوير أولاً قبل استخدامها في الإنتاج.

