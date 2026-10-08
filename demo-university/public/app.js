/**
 * Apex State University — Portal Client Controller
 * Interacts with local university server (:3001) and reflects
 * real-time changes onto Vaasone Trust Layer & Stellar Blockchain.
 */

let allStudents = []
let appConfig = {}
let currentPage = 1
const PAGE_SIZE = 25

// DOM Elements
const tbody = document.getElementById('students-tbody')
const statTotal = document.getElementById('stat-total')
const statAnchored = document.getElementById('stat-anchored')
const statUnanchored = document.getElementById('stat-unanchored')
const statRevoked = document.getElementById('stat-revoked')
const bridgePill = document.getElementById('bridge-status-pill')
const bridgeText = document.getElementById('bridge-status-text')
const filterSearch = document.getElementById('filter-search')
const filterStatus = document.getElementById('filter-status')
const instDisplayName = document.getElementById('inst-display-name')

// ── Toast Notification ──────────────────────────────────
function showToast(message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <div>${message}</div>
    <button style="background:none;border:none;cursor:pointer;opacity:0.6;" onclick="this.parentElement.remove()">&times;</button>
  `
  container.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, duration)
}

// ── Initialize Application ──────────────────────────────
async function init() {
  await loadConfig()
  await checkBridge()
  await loadStudents()
  setupEventListeners()
}

// ── Load Server Configuration ───────────────────────────
async function loadConfig() {
  try {
    const res = await fetch('/api/config')
    appConfig = await res.json()
    if (appConfig.institution_name) {
      instDisplayName.textContent = appConfig.institution_name
      document.title = `${appConfig.institution_name} — Academic Registry & SIS`
    }
    document.getElementById('settings-url').value = appConfig.vaasone_url || ''
    document.getElementById('settings-slug').value = appConfig.institution_slug || ''
    document.getElementById('settings-name').value = appConfig.institution_name || ''
  } catch (err) {
    console.warn('Failed to load config:', err)
  }
}

// ── Test Bridge Connection ──────────────────────────────
async function checkBridge() {
  bridgePill.className = 'bridge-pill checking'
  bridgeText.textContent = 'Pinging Vaasone Gateway...'

  try {
    const res = await fetch('/api/test-bridge')
    const data = await res.json()

    if (data.ok) {
      bridgePill.className = 'bridge-pill connected'
      bridgeText.textContent = `🟢 Connected to Vaasone (${data.latencyMs}ms)`
    } else {
      bridgePill.className = 'bridge-pill disconnected'
      bridgeText.textContent = `🔴 Gateway Offline`
    }
    return data
  } catch {
    bridgePill.className = 'bridge-pill disconnected'
    bridgeText.textContent = '🔴 Bridge Disconnected'
    return { ok: false }
  }
}

// ── Load & Render Students ──────────────────────────────
async function loadStudents() {
  try {
    const res = await fetch('/api/students')
    const data = await res.json()
    allStudents = data.students || []
    updateStats()
    renderTable()
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-danger">Failed to load student registry records: ${err.message}</td></tr>`
  }
}

// ── Update Dashboard Stat Counters ──────────────────────
function updateStats() {
  const total = allStudents.length
  const anchored = allStudents.filter((s) => s.vaasone_sync_status === 'anchored' && s.local_status !== 'revoked').length
  const unanchored = allStudents.filter((s) => s.vaasone_sync_status !== 'anchored' && s.local_status !== 'revoked').length
  const revoked = allStudents.filter((s) => s.local_status === 'revoked' || s.vaasone_sync_status === 'revoked').length

  statTotal.textContent = total
  statAnchored.textContent = anchored
  statUnanchored.textContent = unanchored
  statRevoked.textContent = revoked
}

// ── Filter and Render Table ─────────────────────────────
function renderTable() {
  const query = filterSearch.value.trim().toLowerCase()
  const statusFilter = filterStatus.value

  const filtered = allStudents.filter((s) => {
    const matchSearch =
      !query ||
      s.recipient_name.toLowerCase().includes(query) ||
      s.student_reference.toLowerCase().includes(query) ||
      (s.vaasone_certificate_id && s.vaasone_certificate_id.toLowerCase().includes(query)) ||
      s.programme.toLowerCase().includes(query)

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'anchored' && s.vaasone_sync_status === 'anchored' && s.local_status !== 'revoked') ||
      (statusFilter === 'unanchored' && s.vaasone_sync_status !== 'anchored' && s.local_status !== 'revoked') ||
      (statusFilter === 'revoked' && (s.local_status === 'revoked' || s.vaasone_sync_status === 'revoked'))

    return matchSearch && matchStatus
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1
  if (currentPage > totalPages) currentPage = 1

  const pageInfoEl = document.getElementById('pagination-info')
  const pageLabelEl = document.getElementById('pagination-page-label')
  const btnPrev = document.getElementById('btn-page-prev')
  const btnNext = document.getElementById('btn-page-next')

  if (pageInfoEl) {
    const startNum = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
    const endNum = Math.min(currentPage * PAGE_SIZE, totalItems)
    pageInfoEl.textContent = `Showing ${startNum}–${endNum} of ${totalItems} registered graduates`
  }
  if (pageLabelEl) pageLabelEl.textContent = `Page ${currentPage} of ${totalPages}`
  if (btnPrev) btnPrev.disabled = currentPage <= 1
  if (btnNext) btnNext.disabled = currentPage >= totalPages

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-muted">No student records match the active filter criteria.</td></tr>`
    return
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE
  const endIdx = startIdx + PAGE_SIZE
  const pageItems = filtered.slice(startIdx, endIdx)

  tbody.innerHTML = pageItems
    .map((s) => {
      const isRevoked = s.local_status === 'revoked' || s.vaasone_sync_status === 'revoked'
      const isAnchored = s.vaasone_sync_status === 'anchored' && !isRevoked

      // Local State badge
      const localBadge = isRevoked
        ? `<span class="badge badge-danger">Revoked</span>`
        : `<span class="badge badge-success">Active Award</span>`

      // Blockchain Trust Proof cell
      let proofCell = ''
      if (isRevoked) {
        proofCell = `
          <div class="proof-cell">
            <span class="badge badge-danger">Revoked on Stellar</span>
            <span style="font-size: 0.65rem; color: var(--text-muted);">${s.revocation_reason || 'Senate Nullification'}</span>
          </div>
        `
      } else if (isAnchored) {
        const txTruncated = s.stellar_tx ? `${s.stellar_tx.slice(0, 10)}…${s.stellar_tx.slice(-6)}` : 'On-chain'
        const explorerUrl = s.stellar_tx ? `https://stellar.expert/explorer/testnet/tx/${s.stellar_tx}` : '#'

        proofCell = `
          <div class="proof-cell">
            <span class="badge badge-success">✓ Stellar Ledger Proof</span>
            <span class="cert-id-tag">${s.vaasone_certificate_id || 'VAAS-ANCHORED'}</span>
            ${
              s.stellar_tx
                ? `<a href="${explorerUrl}" target="_blank" class="stellar-link" title="View Tx on Stellar Expert">
                     Tx: ${txTruncated} ↗
                   </a>`
                : ''
            }
          </div>
        `
      } else {
        proofCell = `
          <div class="proof-cell">
            <span class="badge badge-warning">Local Only (Unanchored)</span>
            <span style="font-size: 0.65rem; color: var(--text-muted);">Awaiting gateway sync</span>
          </div>
        `
      }

      // Action buttons
      let actions = `
        <button class="btn btn-outline btn-sm" onclick="openEditModal('${s.id}')" title="Edit Graduate Details">Edit</button>
      `

      if (!isRevoked && !isAnchored) {
        actions += `
          <button class="btn btn-primary btn-sm" onclick="syncSingleStudent('${s.id}')" title="Anchor on Stellar Blockchain">Anchor</button>
        `
      }

      if (isAnchored && !isRevoked) {
        actions += `
          <button class="btn btn-danger btn-sm" onclick="openRevokeModal('${s.id}')" title="Revoke Certificate">Revoke</button>
          <a href="http://localhost:3000/v/${encodeURIComponent(s.vaasone_certificate_id || s.student_reference)}" target="_blank" class="btn btn-secondary btn-sm" title="Verify on Vaasone Public Page">Verify ↗</a>
        `
      }

      const gradYear = s.graduation_date ? new Date(s.graduation_date).getFullYear() : '2024'

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${s.recipient_name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${s.recipient_email || '—'}</div>
          </td>
          <td>
            <code style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: var(--bg-inset); padding: 0.15rem 0.35rem; border-radius: 4px;">
              ${s.student_reference}
            </code>
          </td>
          <td>
            <div style="font-weight: 600;">${s.programme}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${s.faculty || '—'}</div>
          </td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--primary);">${s.classification || 'Pass'}</span>
          </td>
          <td>${gradYear}</td>
          <td>${localBadge}</td>
          <td>${proofCell}</td>
          <td class="text-right">
            <div class="actions-cell">${actions}</div>
          </td>
        </tr>
      `
    })
    .join('')
}

// ── Action: Sync Single Student to Vaasone ──────────────
async function syncSingleStudent(id) {
  showToast('Anchoring certificate to Stellar blockchain...', 'warning', 2500)
  try {
    const res = await fetch(`/api/students/${id}/sync`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      showToast(`✓ Certificate anchored! Stellar Tx: ${data.student.stellar_tx?.slice(0, 12)}…`, 'success', 5000)
      await loadStudents()
    } else {
      showToast(`Sync failed: ${data.error}`, 'danger', 5000)
    }
  } catch (err) {
    showToast(`Bridge error: ${err.message}`, 'danger', 5000)
  }
}

// ── Action: Sync All Students (Batch Sync) ──────────────
async function syncAllStudents() {
  const btn = document.getElementById('btn-sync-all')
  btn.disabled = true
  btn.textContent = 'Syncing...'
  showToast('Reconciling academic registry with Vaasone Trust Layer...', 'warning', 3000)

  try {
    const res = await fetch('/api/sync-all', { method: 'POST' })
    const data = await res.json()
    if (res.ok && data.summary) {
      showToast(
        `✓ Batch Sync Complete: ${data.summary.created} new anchored, ${data.summary.unchanged} verified unchanged.`,
        'success',
        6000
      )
      await loadStudents()
    } else {
      showToast(`Batch sync error: ${data.error || 'Failed'}`, 'danger', 5000)
    }
  } catch (err) {
    showToast(`Connection error: ${err.message}`, 'danger', 5000)
  } finally {
    btn.disabled = false
    btn.innerHTML = `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> Sync All to Vaasone`
  }
}

// ── Modal Open / Close Helpers ──────────────────────────
function openModal(id) {
  document.getElementById(id).classList.remove('hidden')
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden')
}

function openRevokeModal(studentId) {
  const student = allStudents.find((s) => s.id === studentId)
  if (!student) return

  document.getElementById('revoke-student-id').value = student.id
  document.getElementById('revoke-summary-box').innerHTML = `
    <div style="font-size: 0.8rem; font-weight: 700;">${student.recipient_name}</div>
    <div style="font-size: 0.75rem; color: var(--text-secondary);">${student.programme} (${student.student_reference})</div>
    <div style="font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; margin-top: 0.2rem; color: var(--text-muted);">Certificate ID: ${student.vaasone_certificate_id || 'N/A'}</div>
  `
  openModal('modal-revoke')
}

function openEditModal(studentId) {
  const student = allStudents.find((s) => s.id === studentId)
  if (!student) return

  document.getElementById('edit-student-id').value = student.id
  document.getElementById('edit-name').value = student.recipient_name
  document.getElementById('edit-programme').value = student.programme
  document.getElementById('edit-classification').value = student.classification
  openModal('modal-edit')
}

// ── Setup Event Listeners ───────────────────────────────
function setupEventListeners() {
  // Filter listeners (reset to page 1)
  filterSearch.addEventListener('input', () => {
    currentPage = 1
    renderTable()
  })
  filterStatus.addEventListener('change', () => {
    currentPage = 1
    renderTable()
  })

  // Pagination controls
  const btnPrev = document.getElementById('btn-page-prev')
  const btnNext = document.getElementById('btn-page-next')
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--
        renderTable()
      }
    })
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentPage++
      renderTable()
    })
  }

  // Ping bridge button
  document.getElementById('btn-test-bridge').addEventListener('click', async () => {
    const res = await checkBridge()
    if (res.ok) {
      showToast(`✓ Gateway Handshake verified in ${res.latencyMs}ms. Stellar testnet ready.`, 'success')
    } else {
      showToast(`Gateway ping failed: ${res.error || 'Offline'}`, 'danger')
    }
  })

  // Open Add Graduate Modal
  document.getElementById('btn-add-student').addEventListener('click', () => {
    openModal('modal-add')
  })

  // Open Settings Modal
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    openModal('modal-settings')
  })

  // Sync All Button
  document.getElementById('btn-sync-all').addEventListener('click', syncAllStudents)

  // Close modals on [data-close] click
  document.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', () => {
      closeModal(el.getAttribute('data-close'))
    })
  })

  // Form: Add New Graduate
  document.getElementById('form-add-student').addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const submitBtn = document.getElementById('btn-submit-add')
    submitBtn.disabled = true
    submitBtn.textContent = 'Registering & Anchoring...'

    const formData = new FormData(form)
    const payload = {
      recipient_name: formData.get('recipient_name'),
      recipient_email: formData.get('recipient_email'),
      student_reference: formData.get('student_reference'),
      certificate_number: formData.get('certificate_number'),
      programme: formData.get('programme'),
      faculty: formData.get('faculty'),
      classification: formData.get('classification'),
      graduation_date: formData.get('graduation_date'),
      auto_sync: form.auto_sync.checked,
    }

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        closeModal('modal-add')
        form.reset()
        if (data.student.stellar_tx) {
          showToast(`✓ Graduate saved & anchored to Stellar! Tx: ${data.student.stellar_tx.slice(0, 12)}…`, 'success', 6000)
        } else {
          showToast(`✓ Graduate registered locally in database.`, 'success')
        }
        await loadStudents()
      } else {
        showToast(`Registration failed: ${data.error}`, 'danger')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'danger')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Save to Registry'
    }
  })

  // Form: Revoke Student
  document.getElementById('form-revoke-student').addEventListener('submit', async (e) => {
    e.preventDefault()
    const studentId = document.getElementById('revoke-student-id').value
    const reason = document.getElementById('revoke-reason-select').value
    const submitBtn = document.getElementById('btn-submit-revoke')
    submitBtn.disabled = true
    submitBtn.textContent = 'Broadcasting Revocation...'

    try {
      const res = await fetch(`/api/students/${studentId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()

      if (res.ok) {
        closeModal('modal-revoke')
        showToast(`✓ Certificate successfully REVOKED on Stellar Blockchain.`, 'danger', 6000)
        await loadStudents()
      } else {
        showToast(`Revocation failed: ${data.error}`, 'danger')
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'danger')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Confirm & Revoke on Blockchain'
    }
  })

  // Form: Edit Student
  document.getElementById('form-edit-student').addEventListener('submit', async (e) => {
    e.preventDefault()
    const studentId = document.getElementById('edit-student-id').value
    const recipient_name = document.getElementById('edit-name').value
    const programme = document.getElementById('edit-programme').value
    const classification = document.getElementById('edit-classification').value

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_name, programme, classification }),
      })
      if (res.ok) {
        closeModal('modal-edit')
        showToast(`✓ Graduate details updated & re-anchored on Vaasone.`, 'success')
        await loadStudents()
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'danger')
    }
  })

  // Form: Settings
  document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault()
    const vaasone_url = document.getElementById('settings-url').value
    const institution_slug = document.getElementById('settings-slug').value
    const institution_name = document.getElementById('settings-name').value

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaasone_url, institution_slug, institution_name }),
      })
      if (res.ok) {
        closeModal('modal-settings')
        showToast(`✓ Connector settings updated.`, 'success')
        await loadConfig()
        await checkBridge()
      }
    } catch (err) {
      showToast(`Error saving settings: ${err.message}`, 'danger')
    }
  })

  // Run Diagnostic inside Settings Modal
  document.getElementById('btn-run-diagnostic').addEventListener('click', async () => {
    const customUrl = document.getElementById('settings-url').value
    const msg = document.getElementById('diagnostic-message')
    msg.textContent = 'Testing connection...'

    try {
      const res = await fetch(`/api/test-bridge?url=${encodeURIComponent(customUrl)}`)
      const data = await res.json()
      if (data.ok) {
        msg.innerHTML = `🟢 <strong>Operational!</strong> Latency: ${data.latencyMs}ms. Network: ${data.data?.trust_layer?.network || 'Stellar Testnet'}`
      } else {
        msg.innerHTML = `🔴 <strong>Connection Error:</strong> ${data.error || 'Server did not respond'}`
      }
    } catch (err) {
      msg.innerHTML = `🔴 <strong>Failed:</strong> ${err.message}`
    }
  })
}

// Start
init()
