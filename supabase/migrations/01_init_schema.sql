-- =========================================================================
-- PRD SKEMA DATABASE: SISTEM LOST & FOUND UNIVERSITAS GUNADARMA (UGFOUND)
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('lost', 'found');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('active', 'claim_in_progress', 'resolved', 'stored', 'hidden');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('mahasiswa', 'dosen', 'staf_kebersihan', 'satpam', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flag_reason AS ENUM ('spam', 'tidak_pantas', 'data_pribadi', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE flag_status AS ENUM ('open', 'reviewed', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_action_type AS ENUM ('hide_report', 'restore_report', 'delete_report', 'deactivate_user', 'activate_user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'mahasiswa',
    phone VARCHAR(50),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 5. TABEL LOCATIONS
CREATE TABLE IF NOT EXISTS public.locations (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(50) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 6. TABEL REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    category_id SMALLINT NOT NULL REFERENCES public.categories(id),
    location_id INT REFERENCES public.locations(id) ON DELETE SET NULL,
    location_text VARCHAR(255),
    event_at TIMESTAMP WITH TIME ZONE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    safe_location VARCHAR(255),
    hidden_features TEXT,
    contact VARCHAR(100),
    status report_status NOT NULL DEFAULT 'active',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 7. TABEL REPORT_FLAGS
CREATE TABLE IF NOT EXISTS public.report_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason flag_reason NOT NULL,
    note TEXT,
    status flag_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_report_reporter UNIQUE (report_id, reporter_id)
);

-- 8. TABEL ADMIN_ACTIONS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action admin_action_type NOT NULL,
    target_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 9. TABEL OTP_CODES
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    used_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- INDEKS PERFORMA & TEXT SEARCH (PRD SECTION 15)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_reports_feed ON public.reports (status, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports (category_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports (location_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_description_fts ON public.reports USING gin(to_tsvector('indonesian', description || ' ' || title));

-- =========================================================================
-- TRIGGER AUTOMATIS: AUTO-HIDE JIKA DILAPORKAN 3 PENGGUNA BERBEDA (F-08)
-- =========================================================================
CREATE OR REPLACE FUNCTION auto_hide_flagged_report()
RETURNS TRIGGER AS $$
DECLARE
    flag_count INT;
BEGIN
    SELECT COUNT(DISTINCT reporter_id) INTO flag_count
    FROM public.report_flags
    WHERE report_id = NEW.report_id;

    IF flag_count >= 3 THEN
        UPDATE public.reports
        SET status = 'hidden', updated_at = NOW()
        WHERE id = NEW.report_id AND status != 'hidden';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_hide_flagged ON public.report_flags;
CREATE TRIGGER trg_auto_hide_flagged
AFTER INSERT ON public.report_flags
FOR EACH ROW EXECUTE FUNCTION auto_hide_flagged_report();

-- =========================================================================
-- SEED DATA AWAL: KATEGORI & LOKASI KAMPUS GUNADARMA
-- =========================================================================
INSERT INTO public.categories (id, name) VALUES
(1, 'Elektronik'),
(2, 'Dokumen/KTM'),
(3, 'Kunci'),
(4, 'Pakaian'),
(5, 'Dompet/Tas'),
(6, 'Lainnya')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.locations (campus, building, floor, is_active) VALUES
-- Kampus A (Kenari)
('Kampus A', 'Gedung 1', 'Lantai 1', true),
('Kampus A', 'Gedung 1', 'Lantai 2', true),
('Kampus A', 'Gedung 1', 'Lantai 3', true),
('Kampus A', 'Perpustakaan', 'Lantai 1', true),
('Kampus A', 'Pos Satpam', null, true),

-- Kampus B (Salemba)
('Kampus B', 'Gedung 1', 'Lantai 1', true),
('Kampus B', 'Gedung 1', 'Lantai 2', true),
('Kampus B', 'Kantin', null, true),
('Kampus B', 'Pos Satpam', null, true),

-- Kampus C (Salemba Tengah)
('Kampus C', 'Gedung 1', 'Lantai 1', true),
('Kampus C', 'Lab Komputer', 'Lantai 1', true),
('Kampus C', 'Pos Satpam', null, true),

-- Kampus D (Margonda, Depok)
('Kampus D', 'Gedung 1', 'Lantai 1', true),
('Kampus D', 'Gedung 1', 'Lantai 2', true),
('Kampus D', 'Gedung 2', 'Lantai 1', true),
('Kampus D', 'Gedung 2', 'Lantai 2', true),
('Kampus D', 'Gedung 2', 'Lantai 3', true),
('Kampus D', 'Gedung 3', 'Lantai 1', true),
('Kampus D', 'Gedung 3', 'Lantai 2', true),
('Kampus D', 'Gedung 4', 'Lantai 1', true),
('Kampus D', 'Gedung 4', 'Lantai 2', true),
('Kampus D', 'Gedung 4', 'Lantai 3', true),
('Kampus D', 'Perpustakaan Pusat', 'Lantai 1', true),
('Kampus D', 'Perpustakaan Pusat', 'Lantai 2', true),
('Kampus D', 'Masjid Darul Ilmi', 'Lantai 1', true),
('Kampus D', 'Masjid Darul Ilmi', 'Lantai 2', true),
('Kampus D', 'Kantin Utama', null, true),
('Kampus D', 'Pos Satpam Utama Margonda', null, true),
('Kampus D', 'Pos Satpam Belakang', null, true),

-- Kampus E (Kelapa Dua)
('Kampus E', 'Gedung 1', 'Lantai 1', true),
('Kampus E', 'Gedung 1', 'Lantai 2', true),
('Kampus E', 'Gedung 2', 'Lantai 1', true),
('Kampus E', 'Gedung 2', 'Lantai 2', true),
('Kampus E', 'Kantin', null, true),
('Kampus E', 'Pos Satpam Kelapa Dua', null, true)
ON CONFLICT DO NOTHING;

-- Seed Admin User (Default: farras.85.243@gmail.com)
INSERT INTO public.users (id, email, name, role, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'farras.85.243@gmail.com', 'Farras (Admin UGFound)', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'admin', name = 'Farras (Admin UGFound)';