# 🗄️ Lynck Academy Database Setup Guide

This guide will help you set up the complete Supabase database schema for Lynck Academy.

## 📋 Prerequisites

- Supabase project created
- Access to Supabase SQL Editor
- Basic understanding of SQL

## 🚀 Quick Setup

### 1. Run Migration Scripts

Execute the following SQL files in your Supabase SQL Editor **in this exact order**:

1. `setup_database.sql` - Core setup and utilities
2. `01_users_and_profiles.sql` - User management
3. `02_courses_and_categories.sql` - Course structure
4. `03_lessons_and_content.sql` - Lesson content
5. `04_student_progress.sql` - Progress tracking
6. `05_payments_and_transactions.sql` - Payment system
7. `06_functions_and_triggers.sql` - Automation

### 2. Environment Variables

Add these to your `.env` file:

```bash
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📊 Database Schema Overview

### Core Tables

#### 👤 **Users & Profiles**
- `profiles` - Extended user information
- User roles: `student`, `teacher`, `admin`
- Teacher-specific fields for expertise and bio
- Student-specific fields for preferences

#### 📚 **Courses & Content**
- `course_categories` - Course organization
- `courses` - Main course information
- `course_modules` - Course sections
- `lessons` - Individual lessons
- `lesson_quiz_questions` - Quiz content
- `lesson_assignments` - Assignment content

#### 📈 **Progress & Engagement**
- `course_enrollments` - Student course enrollments
- `lesson_completions` - Lesson progress tracking
- `student_progress` - Overall student statistics
- `learning_activity` - Daily activity tracking
- `course_reviews` - Course ratings and reviews
- `course_bookmarks` - Saved courses
- `learning_goals` - Student goal setting

#### 💳 **Payments & Commerce**
- `payments` - Transaction records
- `subscription_plans` - Subscription options
- `user_subscriptions` - Active subscriptions
- `discount_codes` - Promotional codes
- `instructor_payouts` - Teacher payments
- `instructor_earnings` - Earnings summary

#### 🛠️ **System Tables**
- `app_settings` - Platform configuration
- `notifications` - User notifications
- `audit_logs` - Change tracking

## 🔐 Row Level Security (RLS)

All tables have comprehensive RLS policies:

- **Users** can only access their own data
- **Teachers** can manage their own courses and view student progress
- **Public data** (published courses) is accessible to all
- **Admin** access for platform management

## 🔄 Automatic Updates

The database includes triggers for:

- **Course Statistics** - Auto-update lesson counts, duration
- **Progress Tracking** - Update completion percentages
- **Earnings Calculation** - Real-time instructor earnings
- **Rating Updates** - Automatic course rating calculations

## 📊 Analytics Views

Pre-built views for analytics:

```sql
-- Course performance analytics
SELECT * FROM course_analytics WHERE instructor_id = auth.uid();
```

## 🧪 Testing the Setup

After running all migrations, test with:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Test basic functionality
INSERT INTO profiles (id, email, full_name, role) 
VALUES (auth.uid(), 'test@example.com', 'Test User', 'student');
```

## 🚨 Troubleshooting

### Common Issues

1. **RLS Errors**: Ensure you're authenticated when testing
2. **Missing Functions**: Run `06_functions_and_triggers.sql`
3. **Permission Errors**: Check user roles and policies

### Useful Queries

```sql
-- View all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';

-- Check trigger functions
SELECT trigger_name, event_manipulation, trigger_schema, trigger_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## 📈 Performance Optimization

The schema includes optimized indexes for:

- User lookups
- Course searches
- Progress queries
- Payment transactions
- Analytics aggregations

## 🔄 Future Migrations

When adding new features:

1. Create new migration file with timestamp
2. Include rollback instructions
3. Test on staging environment first
4. Update this documentation

## 📞 Support

If you encounter issues:

1. Check the Supabase logs
2. Verify environment variables
3. Review RLS policies
4. Test queries in SQL Editor

---

**Next Step**: Set up Auth0 integration by following `AUTH0_SETUP.md`