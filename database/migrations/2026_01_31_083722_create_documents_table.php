<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');

            // Metadata
            $table->string('title')->index();
            $table->text('description')->nullable();

            // Manajemen File
            $table->string('file_path');
            $table->enum('file_type', ['DOCUMENT', 'PICTURE']);
            $table->integer('file_size_kb')->nullable();

            // Waktu & Filter
            $table->date('document_date')->index(); 

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};
