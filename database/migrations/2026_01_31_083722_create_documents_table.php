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
            $table->string('no_document', 50)->index();
            $table->string('title')->index();
            $table->text('description')->nullable();
            $table->boolean('starred')->default(false)->index();

            // Waktu & Filter
            $table->date('document_date')->index(); 

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->softDeletes();
        });

        Schema::create('document_files', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            
            $table->string('file_path');
            $table->integer('file_size')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_files');
        Schema::dropIfExists('documents');
    }
};
