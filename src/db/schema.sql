-- =========================================================================
-- نظام إدارة حلقات تحفيظ القرآن الكريم الذكية (Smart Quran Halaqat Management System)
-- Schema Definition for PostgreSQL Database
-- =========================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول المراحل الدراسية (Educational Stages)
CREATE TABLE IF NOT EXISTS stages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    description TEXT,
    grade_levels TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول المعلمين والمشرفين (Teachers and Supervisors)
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    national_id VARCHAR(20),
    role VARCHAR(30) DEFAULT 'teacher' CHECK (role IN ('teacher', 'supervisor', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الحلقات القرآنية (Quran Halaqat)
CREATE TABLE IF NOT EXISTS halaqat (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    stage_id VARCHAR(50) NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
    teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(150) NOT NULL,
    teacher_phone VARCHAR(20) NOT NULL,
    time_slot VARCHAR(50) NOT NULL CHECK (time_slot IN ('after_asr', 'after_maghrib', 'after_isha', 'after_fajr')),
    time_slot_label VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    room_number VARCHAR(50),
    target_memorization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول الطلاب (Students Table)
-- ملاحظة هامة: كل طالب يحمل رقماً تسلسلياً فريداً داخل حلقته لتسهيل التحضير اليومي
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    halaqah_id VARCHAR(50) NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    halaqah_serial INT NOT NULL CHECK (halaqah_serial > 0),
    full_name VARCHAR(150) NOT NULL,
    guardian_name VARCHAR(150) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    guardian_relation VARCHAR(50) DEFAULT 'والد الطالب',
    stage_id VARCHAR(50) NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
    current_juz INT DEFAULT 1 CHECK (current_juz BETWEEN 1 AND 30),
    birth_year INT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- قيد فريد يضمن عدم تكرار الرقم التسلسلي داخل نفس الحلقة
    CONSTRAINT unique_halaqah_serial UNIQUE (halaqah_id, halaqah_serial)
);

-- 5. جدول سجل الحضور والغياب اليومي (Attendance Records)
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    attendance_date DATE NOT NULL,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    halaqah_id VARCHAR(50) NOT NULL REFERENCES halaqat(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by VARCHAR(50) NOT NULL DEFAULT 'teacher', -- 'teacher' | 'whatsapp_bot' | 'manager'
    notes TEXT,
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notified_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_student_daily_attendance UNIQUE (student_id, attendance_date)
);

-- 6. جدول أزرار الأنشطة السريعة لمدير الحلقات (Quick Activity Presets)
CREATE TABLE IF NOT EXISTS activity_presets (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('sports', 'reward', 'trip', 'competition', 'announcement', 'weather', 'custom')),
    icon VARCHAR(20) NOT NULL,
    default_location VARCHAR(200),
    default_time VARCHAR(150),
    template_message TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. جدول جلسات وحالة ربط الواتساب (WhatsApp Baileys Sessions)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    id VARCHAR(50) PRIMARY KEY,
    session_status VARCHAR(30) DEFAULT 'disconnected' CHECK (session_status IN ('connected', 'disconnected', 'connecting', 'qr_ready')),
    bot_phone_number VARCHAR(20),
    bot_name VARCHAR(100),
    general_group_name VARCHAR(150) NOT NULL,
    general_group_id VARCHAR(100) NOT NULL,
    auth_credentials_json TEXT,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول سجل الرسائل والتقارير المرسلة (Message Logs & Reports)
CREATE TABLE IF NOT EXISTS message_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('group_broadcast', 'parent_alert', 'incoming_teacher', 'system_report')),
    recipient_phone_or_group VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    message_text TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'pending', 'failed')),
    halaqah_id VARCHAR(50) REFERENCES halaqat(id) ON DELETE SET NULL,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- فهرسة الجداول لتحسين سرعة الاستعلامات اليومية والتقارير
CREATE INDEX IF NOT EXISTS idx_students_halaqah ON students(halaqah_id);
CREATE INDEX IF NOT EXISTS idx_students_serial ON students(halaqah_id, halaqah_serial);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_halaqah_date ON attendance_records(halaqah_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at ON message_logs(created_at DESC);

-- بيانات أولية للمراحل الدراسية
INSERT INTO stages (id, name, short_name, description, grade_levels) VALUES
('primary_early', 'المرحلة الأولية (الصفوف المبكرة)', 'الصفوف الأولية', 'طلاب الصف الأول والثاني والثالث الابتدائي', ARRAY['الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO stages (id, name, short_name, description, grade_levels) VALUES
('primary_upper', 'المرحلة الابتدائية العليا', 'الابتدائية العليا', 'طلاب الصف الرابع والخامس والسادس الابتدائي', ARRAY['الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO stages (id, name, short_name, description, grade_levels) VALUES
('intermediate', 'المرحلة المتوسطة', 'المرحلة المتوسطة', 'طلاب المرحلة المتوسطة', ARRAY['الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO stages (id, name, short_name, description, grade_levels) VALUES
('secondary', 'المرحلة الثانوية', 'المرحلة الثانوية', 'طلاب المرحلة الثانوية وخاتمو القرآن', ARRAY['الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'])
ON CONFLICT (id) DO NOTHING;
