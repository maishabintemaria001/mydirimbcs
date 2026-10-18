<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_paper_id',
        'question_text',
        'question_text_bn',
        'question_image',
        'options',
        'correct_option_ids',
        'explanation',
        'explanation_bn',
        'subject_slug',
        'marks',
        'negative_marks',
        'difficulty',
        'is_paid',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_option_ids' => 'array',
        'is_paid' => 'boolean',
        'marks' => 'float',
        'negative_marks' => 'float',
    ];

    public function questionPaper(): BelongsTo
    {
        return $this->belongsTo(QuestionPaper::class);
    }
}
