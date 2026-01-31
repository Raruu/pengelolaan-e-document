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
            $table->string('categorie'); // Undangan, Telegram Biasa, dll
            $table->string('direction'); // Masuk, Keluar
            
            // Composite unique key
            $table->unique(['categorie', 'direction']);    
            $table->timestamps(); 
        });
    }

    public function down()
    {
        Schema::dropIfExists('categories');
    }
};