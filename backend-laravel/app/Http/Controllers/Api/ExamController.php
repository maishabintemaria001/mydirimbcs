<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Question;
use Carbon\Carbon;

class ExamController extends Controller
{
    public function index()
    {
        $exams = Exam::where('is_active', true)
            ->with('category')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $exams,
        ]);
    }

    public function show($slug)
    {
        $exam = Exam::where('slug', $slug)->orWhere('id', $slug)->with('category')->firstOrFail();
        $user = auth('sanctum')->user();

        // Enforce paid entitlement check
        $userHasAccess = true;
        if ($exam->is_paid) {
            $userHasAccess = $user && $user->hasActiveEntitlement();
        }

        // Mask answers for test-taking phase
        $questions = Question::whereIn('id', $exam->question_ids)
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'question_text_bn' => $q->question_text_bn,
                    'options' => $q->options,
                    'marks' => $q->marks,
                    'negative_marks' => $q->negative_marks,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'exam' => $exam,
                'questions' => $questions,
                'user_has_access' => $userHasAccess,
                'is_premium_restricted' => $exam->is_paid && !$userHasAccess,
            ],
        ]);
    }

    public function startAttempt(Request $request)
    {
        $request->validate(['exam_id' => 'required']);
        $user = auth('sanctum')->user();
        $exam = Exam::findOrFail($request->exam_id);

        $now = Carbon::now();
        $deadline = $now->copy()->addMinutes($exam->duration_minutes);

        $attempt = ExamAttempt::create([
            'exam_id' => $exam->id,
            'user_id' => $user->id,
            'start_time' => $now,
            'deadline' => $deadline,
            'status' => 'in_progress',
            'answers' => [],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $attempt,
        ], 201);
    }

    public function submitAttempt(Request $request, $id)
    {
        $user = auth('sanctum')->user();
        $attempt = ExamAttempt::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $exam = Exam::findOrFail($attempt->exam_id);

        $answers = $request->input('answers', []);
        $attempt->answers = $answers;

        $questions = Question::whereIn('id', $exam->question_ids)->get();
        $correct = 0;
        $incorrect = 0;
        $score = 0;

        foreach ($questions as $q) {
            $selected = $answers[$q->id] ?? [];
            if (empty($selected)) continue;

            $isMatch = count($selected) === count($q->correct_option_ids) &&
                empty(array_diff($selected, $q->correct_option_ids));

            if ($isMatch) {
                $correct++;
                $score += $q->marks;
            } else {
                $incorrect++;
                $score -= $exam->negative_mark_per_question;
            }
        }

        $attempt->score = max(0, $score);
        $attempt->correct_count = $correct;
        $attempt->incorrect_count = $incorrect;
        $attempt->passed = $attempt->score >= $exam->pass_marks;
        $attempt->status = 'submitted';
        $attempt->submitted_at = Carbon::now();
        $attempt->save();

        return response()->json([
            'status' => 'success',
            'data' => [
                'attempt' => $attempt,
                'exam' => $exam,
            ],
        ]);
    }
}
