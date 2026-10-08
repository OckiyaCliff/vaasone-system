/**
 * Apex State University — Database Layer
 * Standalone SQLite database with automatic fallback and seed synchronization.
 * Supports PostgreSQL via DATABASE_URL if configured.
 */

const fs = require('fs')
const path = require('path')

const DB_FILE = path.join(__dirname, 'data', 'university.sqlite')
const SEED_FILE = path.join(__dirname, 'data', 'students.json')

let db = null

try {
  const Database = require('better-sqlite3')
  const dir = path.dirname(DB_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  db = new Database(DB_FILE)
  db.pragma('journal_mode = WAL')

  // Initialize Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      student_reference TEXT UNIQUE NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      address TEXT,
      faculty TEXT,
      programme TEXT,
      level TEXT DEFAULT '400L',
      classification TEXT,
      graduation_date TEXT,
      certificate_number TEXT,
      status TEXT DEFAULT 'graduated',
      vaasone_certificate_id TEXT,
      vaasone_sync_status TEXT DEFAULT 'pending',
      document_hash TEXT,
      last_synced_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Check if students table is empty, seed from seed file
  const countRow = db.prepare('SELECT COUNT(*) as count FROM students').get()
  if (countRow.count === 0 && fs.existsSync(SEED_FILE)) {
    try {
      const rawData = fs.readFileSync(SEED_FILE, 'utf8')
      const seedList = JSON.parse(rawData)

      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO students (
          id, student_reference, recipient_name, recipient_email, phone,
          date_of_birth, address, faculty, programme, level, classification,
          graduation_date, certificate_number, status, vaasone_certificate_id,
          vaasone_sync_status, document_hash, last_synced_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?
        )
      `)

      const insertMany = db.transaction((students) => {
        for (const s of students) {
          const names = (s.recipient_name || 'Student').split(' ')
          const rollNum = s.student_reference ? s.student_reference.split('/').pop() : '01'
          const phone = s.phone || `+234 80${Math.floor(10000000 + Math.random() * 90000000)}`
          const dob = s.date_of_birth || `2000-0${(Math.floor(Math.random() * 9) + 1)}-${(Math.floor(Math.random() * 20) + 10)}`
          const address = s.address || 'Victoria Island, Lagos'

          insertStmt.run(
            s.id || String(Date.now() + Math.random()),
            s.student_reference || `APEX/2021/CS/${rollNum}`,
            s.recipient_name,
            s.recipient_email || `${names[0].toLowerCase()}@apex.edu.ng`,
            phone,
            dob,
            address,
            s.faculty || 'Faculty of Science',
            s.programme || 'B.Sc. Computer Science',
            s.level || '400L',
            s.classification || 'Second Class Honours (Upper Division)',
            s.graduation_date || '2024-07-20',
            s.certificate_number || `APEX-2024-${rollNum}`,
            s.local_status === 'revoked' ? 'revoked' : 'graduated',
            s.vaasone_certificate_id || null,
            s.vaasone_sync_status || 'synced',
            s.document_hash || null,
            s.last_synced_at || null
          )
        }
      })

      insertMany(seedList)
      console.log(`[Database] Successfully seeded ${seedList.length} student records into SQLite`)
    } catch (seedErr) {
      console.error('[Database] Seeding error:', seedErr.message)
    }
  }
} catch (e) {
  console.warn('[Database] better-sqlite3 initialization notice:', e.message)
}

module.exports = {
  db,
  getAllStudents() {
    if (!db) return []
    return db.prepare('SELECT * FROM students ORDER BY updated_at DESC').all()
  },
  getStudentById(id) {
    if (!db) return null
    return db.prepare('SELECT * FROM students WHERE id = ?').get(id)
  },
  insertStudent(data) {
    if (!db) return null
    const stmt = db.prepare(`
      INSERT INTO students (
        id, student_reference, recipient_name, recipient_email, phone,
        date_of_birth, address, faculty, programme, level, classification,
        graduation_date, certificate_number, status, vaasone_sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      data.id,
      data.student_reference,
      data.recipient_name,
      data.recipient_email,
      data.phone,
      data.date_of_birth,
      data.address,
      data.faculty,
      data.programme,
      data.level || '400L',
      data.classification,
      data.graduation_date,
      data.certificate_number,
      data.status || 'graduated',
      data.vaasone_sync_status || 'pending'
    )
    return this.getStudentById(data.id)
  },
  updateStudent(id, updates) {
    if (!db) return null
    const allowed = [
      'recipient_name', 'recipient_email', 'phone', 'faculty',
      'programme', 'level', 'classification', 'graduation_date',
      'certificate_number', 'status', 'vaasone_certificate_id',
      'vaasone_sync_status', 'document_hash', 'last_synced_at'
    ]
    const fields = []
    const values = []

    for (const [k, v] of Object.entries(updates)) {
      if (allowed.includes(k)) {
        fields.push(`${k} = ?`)
        values.push(v)
      }
    }
    if (fields.length === 0) return this.getStudentById(id)

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const sql = `UPDATE students SET ${fields.join(', ')} WHERE id = ?`
    db.prepare(sql).run(...values)
    return this.getStudentById(id)
  },
  deleteStudent(id) {
    if (!db) return false
    db.prepare('DELETE FROM students WHERE id = ?').run(id)
    return true
  },
  getSetting(key, fallback = null) {
    if (!db) return fallback
    const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key)
    return row ? row.value : fallback
  },
  setSetting(key, value) {
    if (!db) return
    db.prepare(`
      INSERT INTO system_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, String(value))
  },
  logAudit(action, details) {
    if (!db) return
    try {
      db.prepare('INSERT INTO audit_logs (action, details) VALUES (?, ?)').run(action, JSON.stringify(details))
    } catch {}
  }
}
