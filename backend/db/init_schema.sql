-- Enable PostGIS, pgvector, and UUID extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Versioned Base Abstract Table for Temporal Auditability (LADM VersionedObject)
CREATE TABLE la_versioned_object (
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- Party Table: Individuals, Communities, or Organizations
CREATE TABLE la_party (
    party_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_type VARCHAR(50) NOT NULL CHECK (party_type IN ('Individual', 'Household', 'Community', 'Organization', 'VRC')),
    full_name VARCHAR(255) NOT NULL,
    cnic_number VARCHAR(20) UNIQUE,
    gender VARCHAR(20),
    is_vulnerable BOOLEAN DEFAULT FALSE,
    contact_number VARCHAR(50),
    attributes JSONB
) INHERITS (la_versioned_object);

-- Spatial Unit Table: Land Parcels, Structures, Flood Zones
CREATE TABLE la_spatial_unit (
    spatial_unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spatial_type VARCHAR(50) CHECK (spatial_type IN ('Parcel', 'Building', 'Usufruct_Zone', 'Flood_Risk_Area')),
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    area_sqm NUMERIC(12, 2),
    district VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100),
    union_council VARCHAR(100)
) INHERITS (la_versioned_object);

-- Spatial Indexing
CREATE INDEX idx_la_spatial_unit_geom ON la_spatial_unit USING GIST (geom);

-- Basic Administrative Unit (BAUnit)
CREATE TABLE la_ba_unit (
    ba_unit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Basic_Cadastral', 'Usufruct_Ledger', 'Community_Land'))
) INHERITS (la_versioned_object);

-- Rights, Restrictions, and Responsibilities (Usufruct Ledger Core)
CREATE TABLE la_rrr (
    rrr_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ba_unit_id UUID REFERENCES la_ba_unit(ba_unit_id),
    party_id UUID REFERENCES la_party(party_id),
    spatial_unit_id UUID REFERENCES la_spatial_unit(spatial_unit_id),
    rrr_type VARCHAR(50) NOT NULL CHECK (rrr_type IN ('Ownership', 'Usufruct', 'Customary_Right', 'Tenancy', 'Restriction')),
    share_numerator INT DEFAULT 1,
    share_denominator INT DEFAULT 1,
    description TEXT,
    approval_status VARCHAR(50) DEFAULT 'Pending_Verification'
) INHERITS (la_versioned_object);

-- Source Documents Table (ESS5/ESS10 Supporting Evidence)
CREATE TABLE la_source (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rrr_id UUID REFERENCES la_rrr(rrr_id),
    document_type VARCHAR(50) CHECK (document_type IN ('Survey_Payload', 'CNIC_Copy', 'Customary_Deed', 'VRC_Resolution', 'GRM_Record')),
    file_path TEXT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Qualitative Field Logs Table with PostGIS Location & pgvector Embedding
CREATE TABLE qualitative_field_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spatial_unit_id UUID REFERENCES la_spatial_unit(spatial_unit_id),
    author_id UUID REFERENCES la_party(party_id),
    title VARCHAR(255) NOT NULL,
    field_notes TEXT NOT NULL,
    anonymized_notes TEXT,
    esf_category VARCHAR(100),
    location GEOMETRY(Point, 4326),
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Spatial and Vector Indexes for Qualitative Field Logs
CREATE INDEX idx_qualitative_field_logs_location ON qualitative_field_logs USING GIST (location);
CREATE INDEX idx_qualitative_field_logs_embedding ON qualitative_field_logs USING hnsw (embedding vector_cosine_ops);

-- Anthropological Field Vectors Table for Semantic Vector RAG Retrieval
CREATE TABLE anthropological_field_vectors (
    vector_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spatial_unit_id UUID REFERENCES la_spatial_unit(spatial_unit_id),
    party_id UUID REFERENCES la_party(party_id),
    log_id UUID REFERENCES qualitative_field_logs(log_id),
    content_summary TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Vector Index for Fast Cosine Similarity RAG Queries
CREATE INDEX idx_field_vectors_hnsw ON anthropological_field_vectors USING hnsw (embedding vector_cosine_ops);
