<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DocumentFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'document_id',
        'file_path',
        'file_size',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'file_extension',
        'file_name',
        'file_url',
        'file_size_kb',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    protected function fileSizeKb(): Attribute
    {
        return Attribute::make(fn() => round($this->attributes['file_size'] * 1024, 2));
    }

    protected function fileExtension(): Attribute
    {
        return Attribute::make(fn() => pathinfo($this->file_path, PATHINFO_EXTENSION));
    }

    protected function fileName(): Attribute
    {
        return Attribute::make(fn() => pathinfo($this->file_path, PATHINFO_FILENAME));
    }

    protected function fileUrl(): Attribute
    {
        return Attribute::make(fn() => asset('storage/' . $this->file_path));
    }
}
