<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Roles & Permissions
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn');
            $table->string('slug')->unique();
            $table->string('icon')->default('GraduationCap');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'order']);
        });

        // 3. Organizations
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Positions
        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('name_bn');
            $table->string('slug');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['organization_id', 'slug']);
        });

        // 5. Question Papers
        Schema::create('question_papers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_bn');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained();
            $table->foreignId('organization_id')->nullable()->constrained();
            $table->foreignId('position_id')->nullable()->constrained();
            $table->integer('exam_year')->index();
            $table->date('exam_date')->nullable();
            $table->integer('total_marks')->default(100);
            $table->integer('duration_minutes')->default(60);
            $table->boolean('is_paid')->default(false)->index();
            $table->decimal('price_bdt', 8, 2)->nullable();
            $table->enum('publication_status', ['draft', 'scheduled', 'published', 'archived'])->default('published')->index();
            $table->string('pdf_url')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('view_count')->default(0)->index();
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->index(['category_id', 'exam_year', 'publication_status']);
        });

        // 6. Questions & MCQs
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_paper_id')->constrained()->cascadeOnDelete();
            $table->text('question_text');
            $table->text('question_text_bn')->nullable();
            $table->string('question_image')->nullable();
            $table->json('options'); // [{ "id": "opt_1", "text": "..." }]
            $table->json('correct_option_ids'); // ["opt_2"]
            $table->text('explanation')->nullable();
            $table->text('explanation_bn')->nullable();
            $table->string('subject_slug')->nullable();
            $table->decimal('marks', 4, 2)->default(1.0);
            $table->decimal('negative_marks', 4, 2)->default(0.25);
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
            $table->index(['question_paper_id', 'is_paid']);
        });

        // 7. Online Exams
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('title_bn');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained();
            $table->json('question_ids');
            $table->decimal('total_marks', 6, 2)->default(100);
            $table->decimal('pass_marks', 6, 2)->default(40);
            $table->integer('duration_minutes')->default(60);
            $table->decimal('negative_mark_per_question', 4, 2)->default(0.25);
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->integer('attempt_limit')->default(3);
            $table->boolean('is_paid')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->enum('answer_reveal_mode', ['immediate', 'after_submit', 'after_exam_ends'])->default('after_submit');
            $table->timestamps();
        });

        // 8. Exam Attempts
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->dateTime('start_time');
            $table->dateTime('deadline');
            $table->dateTime('submitted_at')->nullable();
            $table->json('answers')->nullable();
            $table->decimal('score', 6, 2)->default(0);
            $table->integer('correct_count')->default(0);
            $table->integer('incorrect_count')->default(0);
            $table->integer('unanswered_count')->default(0);
            $table->boolean('passed')->default(false);
            $table->enum('status', ['in_progress', 'submitted', 'timed_out'])->default('in_progress');
            $table->timestamps();
            $table->index(['exam_id', 'user_id', 'status']);
        });

        // 9. Membership Packages
        Schema::create('membership_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn');
            $table->integer('duration_days')->default(30);
            $table->decimal('price_bdt', 8, 2);
            $table->decimal('discount_price_bdt', 8, 2)->nullable();
            $table->json('features');
            $table->boolean('is_active')->default(true);
            $table->string('badge')->nullable();
            $table->timestamps();
        });

        // 10. Orders & Payments
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('package_id')->constrained('membership_packages');
            $table->decimal('amount_bdt', 8, 2);
            $table->enum('payment_method', ['bkash', 'nagad', 'rocket', 'bank']);
            $table->string('transaction_id')->unique();
            $table->string('sender_number');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 11. User Entitlements
        Schema::create('user_entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('membership_packages');
            $table->dateTime('starts_at');
            $table->dateTime('expires_at')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // 12. Dynamic Ads & Sponsors
        Schema::create('sponsor_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('client_name');
            $table->string('banner_url');
            $table->string('target_url');
            $table->enum('placement', ['header', 'sidebar', 'footer', 'question_bottom']);
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->timestamps();
        });

        // 13. Audit Logs
        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('action');
            $table->string('target_type');
            $table->string('target_id');
            $table->text('details');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
        Schema::dropIfExists('sponsor_campaigns');
        Schema::dropIfExists('user_entitlements');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('membership_packages');
        Schema::dropIfExists('exam_attempts');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('question_papers');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('organizations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('roles');
    }
};
