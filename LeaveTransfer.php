<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveTransfer extends Model
{
    use HasFactory;

    protected $table = 'leave_transfers';

    protected $fillable = [
        'user_id',
        'vacationstype_id',
        'amount',
        'from_year',
        'to_year',
        'transfer_date',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'transfer_date' => 'datetime',
        'from_year' => 'integer',
        'to_year' => 'integer',
        'amount' => 'integer',
    ];

    /**
     * العلاقة مع جدول الموظفين
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * العلاقة مع جدول أنواع الإجازات
     */
    public function vacationType()
    {
        return $this->belongsTo(VacationType::class, 'vacationstype_id', 'id');
    }

    /**
     * العلاقة مع المستخدم الذي أنشأ الترحيل
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    /**
     * Scope للحصول على الترحيلات حسب السنة الهدف
     */
    public function scopeForYear($query, $year)
    {
        return $query->where('to_year', $year);
    }

    /**
     * Scope للحصول على الترحيلات حسب الموظف
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope للحصول على الترحيلات حسب نوع الإجازة
     */
    public function scopeForVacationType($query, $vacationTypeId)
    {
        return $query->where('vacationstype_id', $vacationTypeId);
    }

    /**
     * Scope للحصول على الترحيلات من سنة معينة
     */
    public function scopeFromYear($query, $year)
    {
        return $query->where('from_year', $year);
    }

    /**
     * الحصول على المقدار بالساعات
     */
    public function getAmountInHoursAttribute()
    {
        return round($this->amount / 60, 2);
    }

    /**
     * الحصول على المقدار بالأيام (افتراضياً 7 ساعات يومياً)
     */
    public function getAmountInDaysAttribute()
    {
        return round($this->amount / (7 * 60), 2);
    }
}



