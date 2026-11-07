-- BrandLoom PostgreSQL + pgvector Schema
-- Complete Relational Database Design for Brand Compliance & Content Verification

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users and RBAC
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'brand_manager', 'legal_reviewer', 'content_creator', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brands / Organizations
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Brand Guidelines (Uploaded Docs)
CREATE TABLE brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    extracted_text TEXT,
    status VARCHAR(50) DEFAULT 'processed' CHECK (status IN ('uploaded', 'processing', 'processed', 'archived')),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Approved Facts & Knowledge Base (with vector embedding for semantic search)
CREATE TABLE approved_facts (
    id VARCHAR(50) PRIMARY KEY, -- e.g. FACT-101
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'product', 'pricing', 'security', 'compliance', 'company_metrics'
    statement TEXT NOT NULL,
    supporting_source VARCHAR(255) NOT NULL,
    source_citation TEXT,
    approval_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'deprecated', 'pending_review')),
    embedding vector(768),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Brand Voice Rules (Tone, Banned Words, Naming)
CREATE TABLE brand_voice_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('banned_word', 'preferred_term', 'tone_rule', 'required_disclaimer')),
    original_phrase VARCHAR(255) NOT NULL,
    preferred_alternative VARCHAR(255),
    reason TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'warning' CHECK (severity IN ('critical', 'warning', 'suggestion')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Brand Visual Assets & Palette
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('primary_logo', 'secondary_logo', 'monochrome_logo', 'palette_color', 'typography')),
    name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL, -- hex code for colors, URL/SVG for logos, font-family for typography
    role_description VARCHAR(100), -- 'primary', 'surface', 'accent', 'danger'
    min_contrast_ratio NUMERIC(4,2),
    min_size_px INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Content Submissions
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    channel VARCHAR(100) NOT NULL, -- 'press_release', 'landing_page', 'social_ad', 'email_campaign', 'sales_deck'
    raw_content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'publishing_hold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Claim Results (Evidence Matching)
CREATE TABLE claim_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    verification_status VARCHAR(50) NOT NULL CHECK (verification_status IN ('supported', 'contradicted', 'unverified')),
    fact_id VARCHAR(50) REFERENCES approved_facts(id),
    confidence_score NUMERIC(5,2),
    explanation TEXT NOT NULL,
    evidence_snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Analysis Reports & Scoring
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL,
    claim_accuracy_score NUMERIC(5,2) NOT NULL, -- Weight: 35%
    freshness_score NUMERIC(5,2) NOT NULL,      -- Weight: 20%
    brand_voice_score NUMERIC(5,2) NOT NULL,    -- Weight: 20%
    visual_score NUMERIC(5,2) NOT NULL,         -- Weight: 25%
    publishing_hold BOOLEAN DEFAULT false,
    hold_reason TEXT,
    summary TEXT,
    total_issues_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Approvals and Reviewer Decisions
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_role VARCHAR(100) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested', 'emergency_override')),
    notes TEXT,
    digital_signature VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Immutable Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES content_submissions(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'CLAIM_VERIFIED', 'DRAFT_SUBMITTED', 'DRAFT_APPROVED', 'DRAFT_REJECTED', 'FACT_ADDED', 'RULE_UPDATED', 'OVERRIDE_GRANTED'
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & vector search
CREATE INDEX idx_facts_brand ON approved_facts(brand_id);
CREATE INDEX idx_facts_status ON approved_facts(status);
CREATE INDEX idx_voice_rules_brand ON brand_voice_rules(brand_id);
CREATE INDEX idx_submissions_brand ON content_submissions(brand_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
