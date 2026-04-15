<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPeriodTypeToVacationsUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('vacations_users', function (Blueprint $table) {
            // إضافة حقل period_type إذا لم يكن موجوداً
            if (!Schema::hasColumn('vacations_users', 'period_type')) {
                $table->enum('period_type', ['monthly', 'yearly'])
                      ->default('monthly')
                      ->after('amount')
                      ->comment('نوع الفترة: شهرية أو سنوية');
            }

            // إضافة حقل transfer_from_year إذا لم يكن موجوداً
            if (!Schema::hasColumn('vacations_users', 'transfer_from_year')) {
                $table->year('transfer_from_year')
                      ->nullable()
                      ->after('period_type')
                      ->comment('السنة المصدر في حالة الترحيل');
            }
        });

        // إضافة Indexes
        Schema::table('vacations_users', function (Blueprint $table) {
            if (!Schema::hasIndex('vacations_users', 'vacations_users_period_type_index')) {
                $table->index('period_type', 'vacations_users_period_type_index');
            }
        });

        // تحديث البيانات الموجودة
        DB::table('vacations_users')
            ->whereNull('period_type')
            ->update(['period_type' => 'monthly']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('vacations_users', function (Blueprint $table) {
            if (Schema::hasColumn('vacations_users', 'period_type')) {
                $table->dropIndex('vacations_users_period_type_index');
                $table->dropColumn('period_type');
            }
            if (Schema::hasColumn('vacations_users', 'transfer_from_year')) {
                $table->dropColumn('transfer_from_year');
            }
        });
    }
}



