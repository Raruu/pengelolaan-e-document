<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'direction',
        'icon_path',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'icon_url',
    ];

    /**
     * Get the URL for icon
     */
    protected function iconUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->icon_path
                ? asset('storage/' . $this->icon_path)
                : null,
        );
    }

    protected static function booted()
    {
        // When creating a category, automatically create both directions
        static::created(function ($category) {
            // Skip if we're already creating both directions
            if (static::$creatingPair) {
                return;
            }

            static::$creatingPair = true;

            // Get the opposite direction
            $oppositeDirection = $category->direction === 'Masuk' ? 'Keluar' : 'Masuk';

            // Check if opposite doesn't already exist
            $exists = static::where('category', $category->category)
                ->where('direction', $oppositeDirection)
                ->exists();

            if (!$exists) {
                static::create([
                    'category' => $category->category,
                    'direction' => $oppositeDirection,
                    'icon_path' => $category->icon_path,
                ]);
            }

            static::$creatingPair = false;
        });

        // When updating category name or icon_path, sync it to the sibling direction
        static::updating(function ($category) {
            // Skip if we're already syncing
            if (static::$syncingUpdate) {
                return;
            }

            // Only sync if the category name or icon_path changed
            if ($category->isDirty('category') || $category->isDirty('icon_path')) {
                static::$syncingUpdate = true;

                $oppositeDirection = $category->direction === 'Masuk' ? 'Keluar' : 'Masuk';

                // Find and update the sibling category
                $sibling = static::where('category', $category->getOriginal('category'))
                    ->where('direction', $oppositeDirection)
                    ->first();

                if ($sibling) {
                    $updateData = [];

                    if ($category->isDirty('category')) {
                        $updateData['category'] = $category->category;
                    }

                    if ($category->isDirty('icon_path')) {
                        $updateData['icon_path'] = $category->icon_path;
                    }

                    $sibling->update($updateData);
                }

                static::$syncingUpdate = false;
            }
        });

        // When deleting a category, also delete the sibling direction
        static::deleting(function ($category) {
            // Skip if we're already deleting both
            if (static::$deletingPair) {
                return;
            }

            static::$deletingPair = true;

            $oppositeDirection = $category->direction === 'Masuk' ? 'Keluar' : 'Masuk';

            // Find and delete the sibling category
            $sibling = static::where('category', $category->category)
                ->where('direction', $oppositeDirection)
                ->first();

            if ($sibling) {
                $sibling->delete();
            }

            static::$deletingPair = false;
        });
    }

    // Static flags to prevent infinite loops
    protected static $creatingPair = false;
    protected static $syncingUpdate = false;
    protected static $deletingPair = false;

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the sibling category (same category, opposite direction)
     */
    public function sibling()
    {
        $oppositeDirection = $this->direction === 'Masuk' ? 'Keluar' : 'Masuk';

        return static::where('category', $this->category)
            ->where('direction', $oppositeDirection)
            ->first();
    }
}
