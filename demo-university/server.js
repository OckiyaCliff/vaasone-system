/**
 * Apex State University — Academic Registry & SIS Portal Backend
 * A standard University School Information Management System.
 *
 * Integrates an outbound background sync bridge to the National/Vaasone Credential Gateway.
 * Runs autonomously on port 3001.
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const dbHelper = require('./db')

const PORT = parseInt(process.env.PORT || '3001', 10)
const PUBLIC_DIR = path.join(__dirname, 'public')

// Default Integration Gateway Configuration
let integrationConfig = {
  vaasone_url: process.env.VAASONE_URL || dbHelper.getSetting('vaasone_url', 'http://localhost:3000/api/v1/institutions/sync'),
  institution_slug: process.env.INSTITUTION_SLUG || dbHelper.getSetting('institution_slug', 'apex-university'),
  institution_name: process.env.INSTITUTION_NAME || dbHelper.getSetting('institution_name', 'Apex State University'),
  country: 'Nigeria',
  auto_sync: dbHelper.getSetting('auto_sync', 'true') === 'true',
}

// Background Dispatcher: Sends graduation credential event to Vaasone Gateway
async function dispatchExternalSync(payload) {
  if (!integrationConfig.auto_sync && payload.action !== 'manual_sync') {
    return { ok: false, skipped: true, message: 'External sync disabled' }
  }

  const targetUrl = integrationConfig.vaasone_url
  let parsed
  try {
    parsed = new URL(targetUrl)
  } catch {
    return { ok: false, error: 'Invalid gateway URL' }
  }

  const bodyData = JSON.stringify({
    institution_slug: integrationConfig.institution_slug,
    institution_name: integrationConfig.institution_name,
    country: integrationConfig.country,
    ...payload,
  })

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyData),
      'x-institution-slug': integrationConfig.institution_slug,
    },
  }

  return new Promise((resolve) => {
    const req = http.request(parsed, options, (res) => {
      let raw = ''
      res.on('data', (c) => (raw += c))
      res.on('end', () => {
        try {
          const parsedRes = JSON.parse(raw)
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsedRes })
        } catch {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, raw })
        }
      })
    })

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message })
    })

    req.setTimeout(8000, () => {
      req.destroy()
      resolve({ ok: false, error: 'Connection timed out' })
    })

    req.write(bodyData)
    req.end()
  })
}

// Ping diagnostic
async function pingGateway() {
  try {
    const parsed = new URL(integrationConfig.vaasone_url)
    parsed.searchParams.set('slug', integrationConfig.institution_slug)
    const start = Date.now()

    return new Promise((resolve) => {
      const req = http.request(parsed, { method: 'GET', headers: { 'x-institution-slug': integrationConfig.institution_slug } }, (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          resolve({ ok: res.statusCode === 200, latencyMs: Date.now() - start, status: res.statusCode })
        })
      })

      req.on('error', (err) => resolve({ ok: false, latencyMs: Date.now() - start, error: err.message }))
      req.setTimeout(4000, () => {
        req.destroy()
        resolve({ ok: false, latencyMs: 4000, error: 'Timeout' })
      })
      req.end()
    })
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, 'http://' + (req.headers.host || 'localhost:3001'))
  const pathname = parsed.pathname
  const query = Object.fromEntries(parsed.searchParams.entries())
  const method = req.method

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-institution-slug')

  if (method === 'OPTIONS') {
    res.writeHead(204)
    return res.end()
  }

  // ── API: GET /api/stats (School Dashboard Stats) ────────────────────────
  if (pathname === '/api/stats' && method === 'GET') {
    const students = dbHelper.getAllStudents()
    const total = students.length
    const graduated = students.filter((s) => s.status === 'graduated').length
    const active = students.filter((s) => s.status === 'active').length
    const revoked = students.filter((s) => s.status === 'revoked').length
    const firstClass = students.filter((s) => (s.classification || '').toLowerCase().includes('first class')).length

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      total,
      graduated,
      active,
      revoked,
      firstClass,
      academicSession: '2023/2024 Session',
      institutionName: integrationConfig.institution_name,
    }))
  }

  // ── API: GET /api/students (List Students with Search & Filter) ─────────
  if (pathname === '/api/students' && method === 'GET') {
    const q = (query.q || '').toLowerCase().trim()
    const faculty = query.faculty || 'all'
    const status = query.status || 'all'
    const page = parseInt(query.page || '1', 10)
    const limit = parseInt(query.limit || '10', 10)

    let list = dbHelper.getAllStudents()

    if (q) {
      list = list.filter((s) =>
        (s.recipient_name || '').toLowerCase().includes(q) ||
        (s.student_reference || '').toLowerCase().includes(q) ||
        (s.recipient_email || '').toLowerCase().includes(q) ||
        (s.programme || '').toLowerCase().includes(q) ||
        (s.certificate_number || '').toLowerCase().includes(q)
      )
    }

    if (faculty !== 'all') {
      list = list.filter((s) => (s.faculty || '').toLowerCase() === faculty.toLowerCase())
    }

    if (status !== 'all') {
      list = list.filter((s) => (s.status || '').toLowerCase() === status.toLowerCase())
    }

    const totalCount = list.length
    const startIndex = (page - 1) * limit
    const paginated = list.slice(startIndex, startIndex + limit)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      success: true,
      students: paginated,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    }))
  }

  // ── API: POST /api/students (Register New Student / Graduate) ───────────
  if (pathname === '/api/students' && method === 'POST') {
    const body = await parseBody(req)
    if (!body.recipient_name || !body.programme) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student Full Name and Programme are required.' }))
    }

    const rollNo = body.student_reference || `APEX/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`
    const newStudent = {
      id: String(Date.now()),
      student_reference: rollNo.trim(),
      recipient_name: body.recipient_name.trim(),
      recipient_email: body.recipient_email?.trim() || `${rollNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@apex.edu.ng`,
      phone: body.phone?.trim() || '+234 801 234 5678',
      date_of_birth: body.date_of_birth || '2001-05-12',
      address: body.address?.trim() || 'Lagos, Nigeria',
      faculty: body.faculty?.trim() || 'Faculty of Computing & Science',
      programme: body.programme.trim(),
      level: body.level?.trim() || '400L',
      classification: body.classification?.trim() || 'Second Class Honours (Upper Division)',
      graduation_date: body.graduation_date || `${new Date().getFullYear()}-07-15`,
      certificate_number: body.certificate_number || `APEX-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      status: body.status || 'graduated',
      vaasone_sync_status: 'synced',
    }

    const inserted = dbHelper.insertStudent(newStudent)
    dbHelper.logAudit('STUDENT_CREATED', { student_id: newStudent.id, ref: newStudent.student_reference })

    // Silent background push to Vaasone gateway
    dispatchExternalSync({
      action: 'issue',
      record: {
        student_reference: newStudent.student_reference,
        recipient_name: newStudent.recipient_name,
        recipient_email: newStudent.recipient_email,
        programme: newStudent.programme,
        classification: newStudent.classification,
        graduation_date: newStudent.graduation_date,
        certificate_number: newStudent.certificate_number,
        credential_type: 'degree',
      },
    }).then((syncRes) => {
      if (syncRes.ok && syncRes.data) {
        dbHelper.updateStudent(newStudent.id, {
          vaasone_certificate_id: syncRes.data.certificate_id,
          vaasone_sync_status: 'synced',
          document_hash: syncRes.data.document_hash,
          last_synced_at: new Date().toISOString(),
        })
      }
    }).catch(() => {})

    res.writeHead(201, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, student: inserted }))
  }

  // ── API: PUT /api/students/:id (Update Student Information) ─────────────
  const updateMatch = pathname.match(/^\/api\/students\/([^/]+)$/)
  if (updateMatch && method === 'PUT') {
    const studentId = updateMatch[1]
    const body = await parseBody(req)

    const existing = dbHelper.getStudentById(studentId)
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student record not found.' }))
    }

    const updated = dbHelper.updateStudent(studentId, body)
    dbHelper.logAudit('STUDENT_UPDATED', { student_id: studentId, changes: Object.keys(body) })

    // Background push to gateway if graduate certificate exists
    if (existing.vaasone_certificate_id || updated.status === 'graduated') {
      dispatchExternalSync({
        action: 'update',
        certificate_id: existing.vaasone_certificate_id,
        student_reference: updated.student_reference,
        updates: {
          recipient_name: updated.recipient_name,
          programme: updated.programme,
          classification: updated.classification,
          graduation_date: updated.graduation_date,
          certificate_number: updated.certificate_number,
        },
      }).catch(() => {})
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, student: updated }))
  }

  // ── API: DELETE /api/students/:id (Archive / Delete Record) ──────────────
  if (updateMatch && method === 'DELETE') {
    const studentId = updateMatch[1]
    const existing = dbHelper.getStudentById(studentId)
    if (!existing) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Student not found.' }))
    }

    // Mark as revoked/withheld instead of hard deleting to preserve audit trail
    dbHelper.updateStudent(studentId, { status: 'revoked', vaasone_sync_status: 'revoked' })
    dbHelper.logAudit('STUDENT_WITHHELD', { student_id: studentId })

    dispatchExternalSync({
      action: 'revoke',
      certificate_id: existing.vaasone_certificate_id,
      student_reference: existing.student_reference,
      reason: 'Administrative record withdrawal by University Registrar',
    }).catch(() => {})

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, message: 'Record archived and certificate status updated.' }))
  }

  // ── API: POST /api/students/batch-sync (Manual Batch Push for IT Admin) ─
  if (pathname === '/api/students/batch-sync' && method === 'POST') {
    const all = dbHelper.getAllStudents()
    const graduates = all.filter((s) => s.status === 'graduated')

    const CHUNK_SIZE = 50
    let totalSynced = 0

    for (let i = 0; i < graduates.length; i += CHUNK_SIZE) {
      const chunk = graduates.slice(i, i + CHUNK_SIZE)
      try {
        const syncRes = await dispatchExternalSync({
          action: 'batch_sync',
          records: chunk.map((s) => ({
            student_reference: s.student_reference,
            recipient_name: s.recipient_name,
            recipient_email: s.recipient_email,
            programme: s.programme,
            classification: s.classification,
            graduation_date: s.graduation_date,
            certificate_number: s.certificate_number,
            credential_type: 'degree',
          })),
        })
        if (syncRes.ok && syncRes.data?.results) {
          totalSynced += syncRes.data.results.length
        }
      } catch {}
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, totalSynced, count: graduates.length }))
  }

  // ── API: GET /api/settings & POST /api/settings (IT Admin Gateway Setup) ─
  if (pathname === '/api/settings' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      vaasone_url: integrationConfig.vaasone_url,
      institution_slug: integrationConfig.institution_slug,
      institution_name: integrationConfig.institution_name,
      auto_sync: integrationConfig.auto_sync,
    }))
  }

  if (pathname === '/api/settings' && method === 'POST') {
    const body = await parseBody(req)
    if (body.vaasone_url) {
      integrationConfig.vaasone_url = body.vaasone_url.trim()
      dbHelper.setSetting('vaasone_url', integrationConfig.vaasone_url)
    }
    if (body.institution_slug) {
      integrationConfig.institution_slug = body.institution_slug.trim()
      dbHelper.setSetting('institution_slug', integrationConfig.institution_slug)
    }
    if (body.institution_name) {
      integrationConfig.institution_name = body.institution_name.trim()
      dbHelper.setSetting('institution_name', integrationConfig.institution_name)
    }
    if (typeof body.auto_sync === 'boolean') {
      integrationConfig.auto_sync = body.auto_sync
      dbHelper.setSetting('auto_sync', body.auto_sync ? 'true' : 'false')
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, settings: integrationConfig }))
  }

  if (pathname === '/api/settings/ping' && method === 'GET') {
    const ping = await pingGateway()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(ping))
  }

  // ── Static Asset Serving ────────────────────────────────────────────────
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  if (safePath === '/' || safePath === '') safePath = '/index.html'

  const filePath = path.join(PUBLIC_DIR, safePath)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end('404 Not Found')
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    res.writeHead(200, { 'Content-Type': contentType })
    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`\n======================================================`)
  console.log(`🎓 Apex State University — Student Management System`)
  console.log(`======================================================`)
  console.log(`🏫 Portal Live at:    http://localhost:${PORT}`)
  console.log(`🗄️  Database:          SQLite (university.sqlite)`)
  console.log(`🔗 Registry Gateway:  ${integrationConfig.vaasone_url}`)
  console.log(`======================================================\n`)
})
