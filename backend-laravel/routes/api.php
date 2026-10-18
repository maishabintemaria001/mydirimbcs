<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes - Prerona Exam Preparation Platform
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Endpoints
    Route::get('/home', [QuestionController::class, 'home']);
    Route::get('/categories', [QuestionController::class, 'categories']);
    Route::get('/organizations', [QuestionController::class, 'organizations']);
    Route::get('/positions', [QuestionController::class, 'positions']);
    Route::get('/years', [QuestionController::class, 'years']);
    Route::get('/questions', [QuestionController::class, 'index']);
    Route::get('/questions/{slug}', [QuestionController::class, 'show']);
    Route::get('/exams', [ExamController::class, 'index']);
    Route::get('/exams/{slug}', [ExamController::class, 'show']);
    Route::get('/packages', [PaymentController::class, 'packages']);
    Route::get('/advertisements', [AdminController::class, 'advertisements']);
    Route::post('/advertisements/click', [AdminController::class, 'recordClick']);

    // Authentication
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated Candidate Endpoints (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Bookmarks & Practice
        Route::get('/bookmarks', [QuestionController::class, 'bookmarks']);
        Route::post('/bookmarks/toggle', [QuestionController::class, 'toggleBookmark']);

        // Online Examination Engine
        Route::post('/exam-attempts/start', [ExamController::class, 'startAttempt']);
        Route::post('/exam-attempts/{id}/save', [ExamController::class, 'saveAnswers']);
        Route::post('/exam-attempts/{id}/submit', [ExamController::class, 'submitAttempt']);
        Route::get('/results', [ExamController::class, 'results']);
        Route::get('/results/{attemptId}', [ExamController::class, 'resultDetails']);

        // Purchase & Payments
        Route::post('/orders', [PaymentController::class, 'createOrder']);
        Route::get('/orders', [PaymentController::class, 'userOrders']);
        Route::get('/entitlements', [PaymentController::class, 'userEntitlements']);
    });

    // Admin & Staff Endpoints (Role-based authorization)
    Route::middleware(['auth:sanctum', 'role:admin,content_manager,exam_manager'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Question Papers & MCQs
        Route::get('/questions', [AdminController::class, 'questions']);
        Route::post('/questions', [AdminController::class, 'storeQuestionPaper']);
        Route::put('/questions/{id}', [AdminController::class, 'updateQuestionPaper']);
        Route::delete('/questions/{id}', [AdminController::class, 'destroyQuestionPaper']);
        Route::post('/questions/{paperId}/items', [AdminController::class, 'storeQuestionItem']);
        Route::post('/bulk-import-mcqs', [AdminController::class, 'bulkImportMCQs']);

        // Exams
        Route::get('/exams', [AdminController::class, 'exams']);
        Route::post('/exams', [AdminController::class, 'storeExam']);
        Route::put('/exams/{id}', [AdminController::class, 'updateExam']);
        Route::delete('/exams/{id}', [AdminController::class, 'destroyExam']);

        // Payment Approvals
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::post('/payments/{id}/approve', [AdminController::class, 'approvePayment']);
        Route::post('/payments/{id}/reject', [AdminController::class, 'rejectPayment']);

        // Users & Permissions
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);

        // Ad Management
        Route::get('/advertisements', [AdminController::class, 'adminAdvertisements']);
        Route::put('/advertisements/settings', [AdminController::class, 'updateAdSettings']);
        Route::post('/sponsors', [AdminController::class, 'storeSponsor']);

        // Audit Logs
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
    });
});
