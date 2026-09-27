-- Tabel Log Permohonan & Akad
CREATE TABLE IF NOT EXISTS abdi_transactions (
    id TEXT PRIMARY KEY,
    applicant_id TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- DAKWAH, SYARIAH, MUAMALAH
    amount REAL DEFAULT 0,
    akad_type TEXT,
    status TEXT DEFAULT 'PENDING',
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Log Musyawarah/DPS
CREATE TABLE IF NOT EXISTS dps_approvals (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    approver_id TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);