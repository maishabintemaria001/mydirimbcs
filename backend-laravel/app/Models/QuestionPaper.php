<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionPaper extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_bn',
        'slug',
        'category_id',
        'organization_id',
        'position_id',
        'exam_year',
        'exam_date',
        'total_marks',
        'duration_minutes',
        'is_paid',
        'price_bdt',
        'publication_status',
        'pdf_url',
        'description',
        'view_count',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_paid' => 'boolean',
        'exam_year' => 'integer',
        'total_marks' => 'integer',
        'duration_minutes' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
