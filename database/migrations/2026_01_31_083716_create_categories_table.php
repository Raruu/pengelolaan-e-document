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
            
            // Composite unique key
            $table->unique(['category', 'direction']);    
            $table->timestamps(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
};