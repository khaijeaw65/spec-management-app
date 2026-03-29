-- ============================================================
-- Project Spec Management Application
-- PostgreSQL DDL — Final Schema
-- ============================================================
-- Changes from review:
--   [1] sort_order added to template_section
--   [2] sort_order added to generated_spec_section
--   [3] section_id FK added to spec_risk
--   [4] email added to user
--   [5] name moved to main_generated_spec
--   [6] template_version_id added to generated_spec
--   [7] main_template -> template version chain kept
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- AUDIT COLUMN PATTERN (every table)
-- created_by  UUID FK -> user.id  (nullable for seed rows)
-- created_on  TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- updated_by  UUID FK -> user.id
-- updated_on  TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- deleted_by  UUID FK -> user.id  (soft delete)
-- deleted_on  TIMESTAMPTZ         (soft delete, NULL = active)
-- ============================================================


-- ============================================================
-- LOOKUP / REFERENCE TABLES
-- Audit FK constraints deferred until user table exists
-- ============================================================

CREATE TABLE language (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50) NOT NULL UNIQUE,
  created_by UUID,
  created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID,
  deleted_on TIMESTAMPTZ
);

CREATE TABLE spec_status (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(50) NOT NULL UNIQUE,
  created_by UUID,
  created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID,
  deleted_on TIMESTAMPTZ
);

CREATE TABLE section_type (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL,
  purpose    TEXT,
  created_by UUID,
  created_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by UUID,
  deleted_on TIMESTAMPTZ
);

CREATE TABLE risk_type (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_by UUID,
  created_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by UUID,
  deleted_on TIMESTAMPTZ
);


-- ============================================================
-- USER
-- email used for login (FR-AUTH-01)
-- no username — display name is firstName + lastName
-- Self-referential audit FKs added after table creation
-- ============================================================

CREATE TABLE "user" (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by UUID,
  created_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_on TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by UUID,
  deleted_on TIMESTAMPTZ
);

-- Self-referential audit FKs
ALTER TABLE "user"
  ADD CONSTRAINT fk_user_created_by FOREIGN KEY (created_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_user_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_user_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id);

-- Wire audit FKs on lookup tables now that user exists
ALTER TABLE language
  ADD CONSTRAINT fk_language_created_by FOREIGN KEY (created_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_language_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_language_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id);

ALTER TABLE spec_status
  ADD CONSTRAINT fk_spec_status_created_by FOREIGN KEY (created_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_spec_status_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_spec_status_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id);

ALTER TABLE section_type
  ADD CONSTRAINT fk_section_type_created_by FOREIGN KEY (created_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_section_type_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_section_type_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id);

ALTER TABLE risk_type
  ADD CONSTRAINT fk_risk_type_created_by FOREIGN KEY (created_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_risk_type_updated_by FOREIGN KEY (updated_by) REFERENCES "user"(id),
  ADD CONSTRAINT fk_risk_type_deleted_by FOREIGN KEY (deleted_by) REFERENCES "user"(id);


-- ============================================================
-- TEMPLATE (version chain: main_template -> template)
-- ============================================================

CREATE TABLE main_template (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES "user"(id),
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by UUID        REFERENCES "user"(id),
  created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID        REFERENCES "user"(id),
  updated_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by UUID        REFERENCES "user"(id),
  deleted_on TIMESTAMPTZ
);

CREATE TABLE template (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  main_template_id UUID         NOT NULL REFERENCES main_template(id),
  version          INT          NOT NULL DEFAULT 1,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by       UUID         REFERENCES "user"(id),
  created_on       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by       UUID         REFERENCES "user"(id),
  updated_on       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by       UUID         REFERENCES "user"(id),
  deleted_on       TIMESTAMPTZ,
  UNIQUE (main_template_id, version)
);

-- [1] sort_order added — required by FR-TEMP-04
CREATE TABLE template_section (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id     UUID         NOT NULL REFERENCES template(id),
  section_type_id UUID         NOT NULL REFERENCES section_type(id),
  name            VARCHAR(255) NOT NULL,
  sort_order      INT          NOT NULL DEFAULT 0,  -- user-defined section ordering
  created_by      UUID         REFERENCES "user"(id),
  created_on      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by      UUID         REFERENCES "user"(id),
  updated_on      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by      UUID         REFERENCES "user"(id),
  deleted_on      TIMESTAMPTZ,
  UNIQUE (template_id, sort_order),
  UNIQUE (template_id, name)
);


-- ============================================================
-- GENERATED SPEC (version chain: main_generated_spec -> generated_spec)
-- ============================================================

CREATE TABLE main_generated_spec (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES "user"(id),
  template_id     UUID         NOT NULL REFERENCES main_template(id),
  -- [5] name lives here — stable identity across all versions
  name            VARCHAR(255) NOT NULL,
  -- Denormalized pointer to current COMPLETED version.
  -- Avoids joining + status filtering to find latest version.
  -- Only updated after generated_spec reaches COMPLETED.
  -- Never updated on FAILED — keeps pointing to last stable version.
  current_version UUID,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by      UUID         REFERENCES "user"(id),
  created_on      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by      UUID         REFERENCES "user"(id),
  updated_on      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_by      UUID         REFERENCES "user"(id),
  deleted_on      TIMESTAMPTZ
);

CREATE TABLE generated_spec (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  main_spec_id        UUID        NOT NULL REFERENCES main_generated_spec(id),
  language_id         UUID        NOT NULL REFERENCES language(id),
  status_id           UUID        NOT NULL REFERENCES spec_status(id),
  -- [6] Exact template version used at generation time — for traceability
  --     main_generated_spec.template_id tracks the template family
  --     this column tracks the exact version snapshot used per generation
  template_version_id UUID        NOT NULL REFERENCES template(id),
  version             INT         NOT NULL DEFAULT 1,
  mom_s3_key          VARCHAR(500),
  mom_s3_bucket       VARCHAR(255),
  -- AI generation metadata
  ai_model            VARCHAR(100),
  prompt_tokens       INT,
  completion_tokens   INT,
  total_tokens        INT,
  generation_time_ms  INT,
  exported_on         TIMESTAMPTZ,
  created_by          UUID        REFERENCES "user"(id),
  created_on          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          UUID        REFERENCES "user"(id),
  updated_on          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by          UUID        REFERENCES "user"(id),
  deleted_on          TIMESTAMPTZ,
  UNIQUE (main_spec_id, version)
);

-- Wire current_version pointer now that generated_spec exists
ALTER TABLE main_generated_spec
  ADD CONSTRAINT fk_main_spec_current_version
  FOREIGN KEY (current_version) REFERENCES generated_spec(id);

-- [2] sort_order added — preserves section rendering order per spec version
CREATE TABLE generated_spec_section (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id             UUID        NOT NULL REFERENCES generated_spec(id),
  template_section_id UUID        NOT NULL REFERENCES template_section(id),
  sort_order          INT         NOT NULL DEFAULT 0,  -- mirrors template_section.sort_order at generation time
  detail              TEXT,
  created_by          UUID        REFERENCES "user"(id),
  created_on          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          UUID        REFERENCES "user"(id),
  updated_on          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by          UUID        REFERENCES "user"(id),
  deleted_on          TIMESTAMPTZ,
  UNIQUE (spec_id, sort_order)
);

-- [3] section_id FK added — required by FR-RISK-02 to show which section a risk relates to
CREATE TABLE spec_risk (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id        UUID        NOT NULL REFERENCES generated_spec(id),
  section_id     UUID        REFERENCES generated_spec_section(id),  -- nullable: some risks may be spec-level
  risk_type_id   UUID        NOT NULL REFERENCES risk_type(id),
  detail         TEXT,
  reference_text TEXT,
  created_by     UUID        REFERENCES "user"(id),
  created_on     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by     UUID        REFERENCES "user"(id),
  updated_on     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_by     UUID        REFERENCES "user"(id),
  deleted_on     TIMESTAMPTZ
);


-- ============================================================
-- INDEXES
-- ============================================================

-- User
CREATE INDEX idx_user_email ON "user"(email);

-- Template chain
CREATE INDEX idx_main_template_user        ON main_template(user_id, deleted_on);
CREATE INDEX idx_template_main             ON template(main_template_id, version);
CREATE INDEX idx_template_section_template ON template_section(template_id, sort_order);

-- Spec chain
CREATE INDEX idx_main_spec_user            ON main_generated_spec(user_id, deleted_on);
CREATE INDEX idx_generated_spec_main       ON generated_spec(main_spec_id, version);
CREATE INDEX idx_generated_spec_status     ON generated_spec(status_id);
CREATE INDEX idx_spec_section_spec         ON generated_spec_section(spec_id, sort_order);
CREATE INDEX idx_spec_risk_spec            ON spec_risk(spec_id);
CREATE INDEX idx_spec_risk_section         ON spec_risk(section_id);


-- ============================================================
-- SEED DATA
-- created_by / updated_by left NULL for system seed rows
-- ============================================================

INSERT INTO language (name) VALUES
  ('Thai'),
  ('English');

INSERT INTO spec_status (name) VALUES
  ('PROCESSING'),
  ('COMPLETED'),
  ('FAILED'),
  ('REVIEWED');

INSERT INTO section_type (name, purpose) VALUES
  ('General',      'General purpose section'),
  ('Requirements', 'Functional requirements'),
  ('Risks',        'Risk and ambiguity section'),
  ('Scope',        'Project scope definition');

INSERT INTO risk_type (name) VALUES
  ('AMBIGUOUS_LANGUAGE'),
  ('MISSING_OWNER'),
  ('NO_TIMELINE'),
  ('ASSUMED_FACT'),
  ('UNCLEAR_SCOPE');