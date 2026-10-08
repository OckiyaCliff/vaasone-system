/**
 * Apex Academy / University — School Information Management Frontend
 */

let state = {
  students: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  searchQuery: '',
  sessionFilter: 'all',
  activeStudent: null,
}

// Avatar color palette for varied student initials
const AVATAR_COLORS = [
  '#7047eb', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return 'ST'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// Format roll number cleanly like the reference (#01, #10, etc. or matric number)
function formatRoll(studentRef) {
  if (!studentRef) return '#01'
  const parts = studentRef.split('/')
  const last = parts[parts.length - 1]
  if (last && !isNaN(parseInt(last, 10))) {
    const num = parseInt(last, 10)
    return `#${num < 10 ? '0' + num : num}`
  }
  return `#${studentRef}`
}

function showToast(msg) {
  const toast = document.getElementById('toast-message')
  toast.textContent = msg
  toast.classList.remove('hidden')
  setTimeout(() => {
    toast.classList.add('hidden')
  }, 3500)
}

function alertNotice(msg) {
  showToast(msg)
}

// ── API Fetchers ────────────────────────────────────────────────────────
async function loadStudents() {
  const tbody = document.getElementById('students-table-body')
  tbody.innerHTML = `<tr><td colspan="8" class="loading-state">Loading student records...</td></tr>`

  const params = new URLSearchParams({
    page: state.pagination.page,
    limit: state.pagination.limit,
    q: state.searchQuery,
  })

  if (state.sessionFilter !== 'all') {
    params.set('status', state.sessionFilter)
  }

  try {
    const res = await fetch(`/api/students?${params.toString()}`)
    const data = await res.json()

    if (data.success) {
      state.students = data.students || []
      state.pagination = data.pagination || state.pagination
      renderTable()
      renderPagination()
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="loading-state">Failed to load student records.</td></tr>`
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-state">Unable to connect to registry database.</td></tr>`
  }
}

// ── Render Students Table ───────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('students-table-body')
  if (state.students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-state">No matching student records found.</td></tr>`
    return
  }

  tbody.innerHTML = state.students
    .map((s) => {
      const color = getAvatarColor(s.recipient_name)
      const initials = getInitials(s.recipient_name)
      const roll = formatRoll(s.student_reference)
      const address = s.address || (s.faculty ? s.faculty.replace('Faculty of ', '') : 'Lagos, Nigeria')
      const classLevel = s.level ? s.level.replace('400L (Final Year)', '04').replace('400L', '04').replace('300L', '03').replace('200L', '02').replace('100L', '01') : '04'
      const dob = s.date_of_birth ? formatDate(s.date_of_birth) : '12/05/2001'
      const phone = s.phone || '+123 6988567'

      return `
        <tr data-id="${s.id}">
          <td class="col-checkbox">
            <input type="checkbox" class="custom-checkbox row-select-check" value="${s.id}">
          </td>
          <td>
            <div class="student-name-cell">
              <div class="avatar-circle" style="background-color: ${color}">${initials}</div>
              <div class="student-meta">
                <span class="student-fullname">${escapeHtml(s.recipient_name)}</span>
                <span class="student-email-sub">${escapeHtml(s.recipient_email || s.programme || '')}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="roll-badge">${escapeHtml(roll)}</span>
          </td>
          <td>${escapeHtml(address)}</td>
          <td><span class="class-tag">${escapeHtml(classLevel)}</span></td>
          <td>${escapeHtml(dob)}</td>
          <td>${escapeHtml(phone)}</td>
          <td>
            <div class="action-cell">
              <button class="action-btn btn-delete" title="Archive / Delete Record" onclick="handleDeleteStudent('${s.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
              <button class="action-btn btn-edit" title="Edit Student Information" onclick="handleEditStudent('${s.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  <path d="m15 5 4 4"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ── Render Pagination Bar ───────────────────────────────────────────────
function renderPagination() {
  const container = document.getElementById('pagination-nav')
  const { page, totalPages } = state.pagination

  let html = ''
  // Prev button
  html += `
    <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})">
      &lsaquo;
    </button>
  `

  // Numbered pages
  const maxButtons = 5
  let start = Math.max(1, page - 2)
  let end = Math.min(totalPages, start + maxButtons - 1)
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1)
  }

  for (let i = start; i <= end; i++) {
    html += `
      <button class="page-btn ${i === page ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `
  }

  if (end < totalPages) {
    html += `<span class="page-dots" style="padding: 0 4px; color: #9ba1ba;">...</span>`
    html += `
      <button class="page-btn" onclick="goToPage(${totalPages})">
        ${totalPages}
      </button>
    `
  }

  // Next button
  html += `
    <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="goToPage(${page + 1})">
      &rsaquo;
    </button>
  `

  container.innerHTML = html
}

function goToPage(p) {
  if (p < 1 || p > state.pagination.totalPages) return
  state.pagination.page = p
  loadStudents()
}

// ── CRUD Handlers ───────────────────────────────────────────────────────
window.handleDeleteStudent = async function (id) {
  if (!confirm('Are you sure you want to archive / withdraw this student record?')) return
  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      showToast('Student record successfully archived.')
      loadStudents()
    } else {
      alert(data.error || 'Failed to archive record.')
    }
  } catch (err) {
    alert('Error connecting to database.')
  }
}

window.handleEditStudent = function (id) {
  const student = state.students.find((s) => s.id === id)
  if (!student) return

  state.activeStudent = student
  document.getElementById('edit-id').value = student.id
  document.getElementById('edit-name').value = student.recipient_name || ''
  document.getElementById('edit-roll').value = student.student_reference || ''
  document.getElementById('edit-email').value = student.recipient_email || ''
  document.getElementById('edit-phone').value = student.phone || ''
  document.getElementById('edit-programme').value = student.programme || ''
  document.getElementById('edit-classification').value = student.classification || 'Second Class Honours (Upper Division)'
  document.getElementById('edit-address').value = student.address || ''
  document.getElementById('edit-status').value = student.status || 'graduated'

  openModal('modal-edit')
}

// ── Modals & Navigation ─────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id)
  if (el) el.classList.remove('hidden')
}

function closeModal(id) {
  const el = document.getElementById(id)
  if (el) el.classList.add('hidden')
}

// ── Event Listeners ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStudents()

  // Search input listeners
  const tableSearch = document.getElementById('table-search')
  let debounceTimeout = null
  tableSearch.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim()
      state.pagination.page = 1
      loadStudents()
    }, 300)
  })

  const globalSearch = document.getElementById('global-search')
  globalSearch.addEventListener('input', (e) => {
    tableSearch.value = e.target.value
    tableSearch.dispatchEvent(new Event('input'))
  })

  // Session / Status filter
  const sessionFilter = document.getElementById('filter-session')
  sessionFilter.addEventListener('change', (e) => {
    state.sessionFilter = e.target.value
    state.pagination.page = 1
    loadStudents()
  })

  // Limit change
  const selectLimit = document.getElementById('select-limit')
  selectLimit.addEventListener('change', (e) => {
    state.pagination.limit = parseInt(e.target.value, 10)
    state.pagination.page = 1
    loadStudents()
  })

  // Select all checkbox
  const checkAll = document.getElementById('check-all')
  checkAll.addEventListener('change', (e) => {
    const checks = document.querySelectorAll('.row-select-check')
    checks.forEach((c) => (c.checked = e.target.checked))
  })

  // Modal open / close triggers
  document.getElementById('btn-open-add-student').addEventListener('click', () => {
    openModal('modal-add')
  })

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close')
      closeModal(target)
    })
  })

  // Add student form submit
  document.getElementById('form-add-student').addEventListener('submit', async (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showToast('New student record saved successfully.')
        closeModal('modal-add')
        form.reset()
        loadStudents()
      } else {
        alert(data.error || 'Failed to save student.')
      }
    } catch {
      alert('Network error while saving student.')
    }
  })

  // Edit student form submit
  document.getElementById('form-edit-student').addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('edit-id').value
    const payload = {
      recipient_name: document.getElementById('edit-name').value,
      recipient_email: document.getElementById('edit-email').value,
      phone: document.getElementById('edit-phone').value,
      programme: document.getElementById('edit-programme').value,
      classification: document.getElementById('edit-classification').value,
      address: document.getElementById('edit-address').value,
      status: document.getElementById('edit-status').value,
    }

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Student information updated successfully.')
        closeModal('modal-edit')
        loadStudents()
      } else {
        alert(data.error || 'Failed to update record.')
      }
    } catch {
      alert('Network error while updating.')
    }
  })

  // Settings modal handlers
  const navSettings = document.getElementById('nav-settings')
  navSettings.addEventListener('click', async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      document.getElementById('setting-gateway-url').value = data.vaasone_url || ''
      document.getElementById('setting-slug').value = data.institution_slug || ''
      document.getElementById('setting-name').value = data.institution_name || ''
      document.getElementById('setting-auto-sync').checked = data.auto_sync !== false
    } catch {}
    openModal('modal-settings')
  })

  document.getElementById('form-settings-save').addEventListener('submit', async (e) => {
    e.preventDefault()
    const payload = {
      vaasone_url: document.getElementById('setting-gateway-url').value.trim(),
      institution_slug: document.getElementById('setting-slug').value.trim(),
      institution_name: document.getElementById('setting-name').value.trim(),
      auto_sync: document.getElementById('setting-auto-sync').checked,
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Integration settings updated.')
        closeModal('modal-settings')
      }
    } catch {
      alert('Failed to save settings.')
    }
  })

  document.getElementById('btn-ping-gateway').addEventListener('click', async () => {
    const btn = document.getElementById('btn-ping-gateway')
    const label = document.getElementById('diagnostic-status-text')
    btn.disabled = true
    btn.textContent = 'Testing...'
    label.textContent = 'Contacting external trust gateway...'

    try {
      const res = await fetch('/api/settings/ping')
      const data = await res.json()
      if (data.ok) {
        label.textContent = `Gateway online (${data.latencyMs}ms response time)`
        showToast('Gateway handshake verified!')
      } else {
        label.textContent = `Gateway unreachable (${data.error || 'Check URL'})`
      }
    } catch (e) {
      label.textContent = 'Connection failed: ' + e.message
    } finally {
      btn.disabled = false
      btn.textContent = 'Test Gateway Handshake'
    }
  })
})
