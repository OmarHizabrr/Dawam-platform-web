<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\VacationsUser;

/**
 * يجب إضافة هذه الدوال إلى ملف VacationAPIController.php
 * 
 * المسار المتوقع: app/Http/Controllers/API/VacationAPIController.php
 */

class VacationAPIController extends Controller
{
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
            Log::error('Reset year vacations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التصفير: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على تقرير سنوي لإجازة محددة لموظف محدد
     * 
     * @param int $vac_id نوع الإجازة
     * @param int $year السنة
     * @param int $user_id معرف الموظف
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAnnualyReportByUser($vac_id, $year, $user_id)
    {
        try {
            // حساب فترة السنة (من 23 ديسمبر السنة السابقة إلى 22 ديسمبر السنة الحالية)
            $year = (int) $year;
            $yearStart = ($year - 1) . "-12-23";
            $yearEnd = $year . "-12-22";

            // جلب رصيد الإجازة للموظف
            $balance = DB::select(
                'SELECT 
                    user_id,
                    vacationstype_id,
                    SUM(amount) as total_amount
                FROM vacations_users
                WHERE user_id = ?
                AND vacationstype_id = ?
                AND DATE(created_at) BETWEEN ? AND ?
                GROUP BY user_id, vacationstype_id',
                [$user_id, $vac_id, $yearStart, $yearEnd]
            );

            // جلب الاستهلاك الفعلي للإجازة
            $consumed = DB::select(
                'SELECT 
                    user_id,
                    type as vacationstype_id,
                    SUM(TIME_TO_SEC(TIMEDIFF(leave_time, attendance_time)) / 60) as consumed_minutes
                FROM attendancelogs
                WHERE user_id = ?
                AND type = ?
                AND date BETWEEN ? AND ?
                GROUP BY user_id, type',
                [$user_id, $vac_id, $yearStart, $yearEnd]
            );

            // حساب الرصيد المتبقي
            $totalBalance = isset($balance[0]) ? (float) $balance[0]->total_amount : 0;
            $totalConsumed = isset($consumed[0]) ? (float) $consumed[0]->consumed_minutes : 0;
            $remaining = $totalBalance - $totalConsumed;

            // جلب معلومات الموظف
            $user = DB::table('users')
                ->select('user_id', 'name', 'job')
                ->where('user_id', $user_id)
                ->first();

            // جلب معلومات نوع الإجازة
            $vacationType = DB::table('vacationstypes')
                ->select('id', 'name')
                ->where('id', $vac_id)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'vacation_type' => $vacationType,
                    'year' => $year,
                    'year_start' => $yearStart,
                    'year_end' => $yearEnd,
                    'balance' => $totalBalance,
                    'consumed' => $totalConsumed,
                    'remaining' => $remaining,
                    'balance_records' => $balance,
                    'consumed_records' => $consumed
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get annual report by user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب التقرير: ' . $e->getMessage()
            ], 500);
        }
    }
}

