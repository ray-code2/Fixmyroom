CREATE TABLE IF NOT EXISTS landing_leads (
    id UUID PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    role VARCHAR(50),
    property_name VARCHAR(80) NOT NULL,
    property_type VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    room_count INTEGER NOT NULL CHECK (room_count >= 1 AND room_count <= 10000),
    lead_type VARCHAR(20) NOT NULL,
    notes VARCHAR(280),
    source VARCHAR(30) NOT NULL CHECK (source = 'landing_page'),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    address VARCHAR(160) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    manager_id UUID REFERENCES employees(id),
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('STAFF', 'MANAGER', 'TECHNICIAN')),
    language_preference VARCHAR(10) NOT NULL DEFAULT 'en',
    phone VARCHAR(30),
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_hotel_id ON employees(hotel_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_number VARCHAR(20) NOT NULL,
    floor VARCHAR(10),
    room_type VARCHAR(30),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_rooms_hotel_number UNIQUE (hotel_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);

CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY,
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(30) NOT NULL CHECK (category IN ('PLUMBING','ELECTRICAL','HVAC','FURNITURE','HOUSEKEEPING','LOCK_KEY','LIGHTING','APPLIANCE','STRUCTURAL','OTHER')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','ASSIGNED','IN_PROGRESS','WAITING_PARTS','COMPLETED','CANCELLED')),
    reported_by UUID NOT NULL REFERENCES employees(id),
    assigned_to UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_issues_hotel_id ON issues(hotel_id);
CREATE INDEX IF NOT EXISTS idx_issues_room_id ON issues(room_id);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);

CREATE TABLE IF NOT EXISTS issue_notes (
    id UUID PRIMARY KEY,
    issue_id UUID NOT NULL REFERENCES issues(id),
    author_id UUID NOT NULL REFERENCES employees(id),
    body VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issue_notes_issue_id ON issue_notes(issue_id);

CREATE TABLE IF NOT EXISTS issue_status_history (
    id UUID PRIMARY KEY,
    issue_id UUID NOT NULL REFERENCES issues(id),
    changed_by UUID NOT NULL REFERENCES employees(id),
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    note VARCHAR(280),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issue_history_issue_id ON issue_status_history(issue_id);

ALTER TABLE issues ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10,2);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(10,2);
ALTER TABLE issues ALTER COLUMN room_id DROP NOT NULL;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
