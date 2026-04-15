<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeaveTransfersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('leave_transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('vacationstype_id');
            $table->integer('amount')->comment('المقدار بالدقائق');
            $table->year('from_year');
            $table->year('to_year');
            $table->dateTime('transfer_date');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('user_id')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('vacationstype_id')
                  ->references('id')
                  ->on('vacationstypes')
                  ->onDelete('cascade');

            $table->foreign('created_by')
                  ->references('user_id')
                  ->on('users')
                  ->onDelete('set null');

            // Indexes
            $table->index(['user_id', 'from_year', 'to_year']);
            $table->index('vacationstype_id');
            $table->index('transfer_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('leave_transfers');
    }
}



