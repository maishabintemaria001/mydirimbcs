<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_bn',
        'slug',
        'description',
        'category_id',
        'question_ids',
        'total_marks',
        'pass_marks',
        'duration_minutes',
        'negative_mark_per_question',
        'start_time',
        'end_time',
        'attempt_limit',
        'is_paid',
        'is_active',
        'answer_reveal_mode',
    ];

    protected $casts = [
        'question_ids' => 'array',
        'is_paid' => 'boolean',
        'is_active' => 'boolean',
        'total_marks' => 'float',
        'pass_marks' => 'float',
        'negative_mark_per_question' => 'float',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }
}
