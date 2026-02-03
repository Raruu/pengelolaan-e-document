<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // Undangan, Telegram Biasa, dll
            $table->enum('direction', ['Masuk', 'Keluar']); // Masuk, Keluar
            $table->string('icon_path')->nullable();
            
            // Composite unique key
            $table->unique(['category', 'direction']);    
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
};