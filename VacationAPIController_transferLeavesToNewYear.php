<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\User;
use App\VacationUser;
use App\LeaveTransfer;

/**
 * يجب إضافة هذه الدالة إلى ملف VacationAPIController.php
 * 
 * المسار المتوقع: app/Http/Controllers/API/VacationAPIController.php
 */
class VacationAPIController extends Controller
{
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
            $errors = [];

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
                            'type' => 34, // نوع: مرحل من العام الماضي (يجب التحقق من القيمة الصحيحة في قاعدة البيانات)
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
}

