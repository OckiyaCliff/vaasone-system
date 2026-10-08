const fs = require('fs')
const path = require('path')

const firstNames = [
  'Adebayo', 'Chioma', 'Ibrahim', 'Fatima', 'Oluwaseun', 'Ngozi', 'Emeka', 'Folashade',
  'Babajide', 'Amina', 'Chinedu', 'Zainab', 'Olamide', 'Blessing', 'Kelechi', 'Halima',
  'Tunde', 'Ebele', 'Damilola', 'Maryam', 'Somtochukwu', 'Hauwa', 'Ayodele', 'Grace',
  'Uche', 'Suleiman', 'Yetunde', 'Usman', 'Chiamaka', 'Aliyu', 'Abiola', 'Favour',
  'Obinna', 'Rukayat', 'Taiwo', 'Kabiru', 'Simisola', 'Mustapha', 'Chidera', 'Khadijah',
  'Olumide', 'Joy', 'Chukwuma', 'Aishat', 'Kayode', 'Patience', 'Ifeanyi', 'Bilkisu',
  'Rotimi', 'Bukola', 'Tochukwu', 'Saheed', 'Titilayo', 'Haruna', 'Nnamdi', 'Farida',
  'Segun', 'Ogechi', 'Adewale', 'Habiba', 'Chidiebere', 'Idris', 'Eniola', 'Precious',
  'Onyekachi', 'Zahra', 'Femi', 'Chinonso', 'Kunle', 'Asmau', 'Chibuzo', 'Ramat'
]

const lastNames = [
  'Adeyemi', 'Okafor', 'Bello', 'Abubakar', 'Balogun', 'Eze', 'Ogunleye', 'Danjuma',
  'Bakare', 'Nwosu', 'Suleiman', 'Adeleke', 'Okoro', 'Garba', 'Oladipo', 'Chukwu',
  'Lawal', 'Nwachukwu', 'Sanusi', 'Afolabi', 'Okonkwo', 'Yahaya', 'Ajayi', 'Obi',
  'Aliyu', 'Ojo', 'Nnamdi', 'Shehu', 'Bankole', 'Ezeh', 'Momoh', 'Fashola',
  'Ibrahim', 'Onyeka', 'Yusuf', 'Akinwunmi', 'Umar', 'Soyinka', 'Olawale', 'Kalu',
  'Babatunde', 'Aniekeme', 'Adesina', 'Ogundipe', 'Bashir', 'Madu', 'Alhassan', 'Igwe',
  'Gbadamosi', 'Oluwole', 'Yakubu', 'Effiong', 'Bassey', 'Oladimeji', 'Okiya', 'Danladi'
]

const facultiesAndProgrammes = [
  {
    faculty: 'Faculty of Computing & Information Science',
    programmes: [
      { name: 'B.Sc. Computer Science', code: 'CS' },
      { name: 'B.Sc. Software Engineering', code: 'SE' },
      { name: 'B.Sc. Cybersecurity', code: 'CYS' },
      { name: 'B.Sc. Information Technology', code: 'IT' },
      { name: 'B.Sc. Data Science', code: 'DS' },
    ]
  },
  {
    faculty: 'Faculty of Engineering',
    programmes: [
      { name: 'B.Eng. Mechanical Engineering', code: 'ME' },
      { name: 'B.Eng. Electrical & Electronics Engineering', code: 'EEE' },
      { name: 'B.Eng. Civil Engineering', code: 'CVE' },
      { name: 'B.Eng. Petroleum & Gas Engineering', code: 'PGE' },
      { name: 'B.Eng. Mechatronics Engineering', code: 'MCE' },
    ]
  },
  {
    faculty: 'College of Medicine & Health Sciences',
    programmes: [
      { name: 'MBBS Medicine & Surgery', code: 'MED', classification: ['Distinction', 'Pass'] },
      { name: 'B.Sc. Nursing Science', code: 'NUR' },
      { name: 'B.Pharm. Pharmacy', code: 'PHM', classification: ['Distinction', 'Pass'] },
      { name: 'B.Sc. Medical Laboratory Science', code: 'MLS' },
      { name: 'B.Sc. Human Physiology', code: 'PHS' },
    ]
  },
  {
    faculty: 'Faculty of Law',
    programmes: [
      { name: 'LL.B. Commercial & Property Law', code: 'LAW' },
      { name: 'LL.B. Public & International Law', code: 'PIL' },
    ]
  },
  {
    faculty: 'Faculty of Management Sciences',
    programmes: [
      { name: 'B.Sc. Accounting', code: 'ACC' },
      { name: 'B.Sc. Banking & Finance', code: 'BNF' },
      { name: 'B.Sc. Business Administration', code: 'BUS' },
      { name: 'B.Sc. Economics', code: 'ECO' },
    ]
  },
  {
    faculty: 'Faculty of Environmental Sciences',
    programmes: [
      { name: 'B.Sc. Architecture', code: 'ARC' },
      { name: 'B.Sc. Estate Management', code: 'ESM' },
      { name: 'B.Sc. Quantity Surveying', code: 'QTS' },
    ]
  },
  {
    faculty: 'Faculty of Agricultural Sciences',
    programmes: [
      { name: 'B.Agric. Animal Science', code: 'ANS' },
      { name: 'B.Agric. Crop Production', code: 'CRP' },
      { name: 'B.Agric. Agricultural Economics', code: 'AGE' },
    ]
  }
]

const standardClassifications = [
  'First Class Honours',
  'Second Class Honours (Upper Division)',
  'Second Class Honours (Upper Division)',
  'Second Class Honours (Upper Division)',
  'Second Class Honours (Lower Division)',
  'Second Class Honours (Lower Division)',
  'Third Class Honours',
]

const years = [2021, 2022, 2023, 2024, 2025]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const totalStudentsToGenerate = 325
const students = []
const usedRefs = new Set()

// Preserve original 6 students as anchors
const originalStudents = [
  {
    id: "1",
    student_reference: "APEX/2021/CS/0042",
    recipient_name: "Tunde Bakare",
    recipient_email: "tunde.bakare@apex.edu.ng",
    faculty: "Faculty of Computing & Information Science",
    programme: "B.Sc. Computer Science",
    classification: "First Class Honours",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0042",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  },
  {
    id: "2",
    student_reference: "APEX/2020/ME/0118",
    recipient_name: "Ngozi Okafor",
    recipient_email: "ngozi.okafor@apex.edu.ng",
    faculty: "Faculty of Engineering",
    programme: "B.Eng. Mechanical Engineering",
    classification: "Second Class Honours (Upper Division)",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0118",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  },
  {
    id: "3",
    student_reference: "APEX/2021/MED/0009",
    recipient_name: "Ibrahim Danladi",
    recipient_email: "ibrahim.danladi@apex.edu.ng",
    faculty: "College of Medicine & Health Sciences",
    programme: "MBBS Medicine & Surgery",
    classification: "Distinction",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0009",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  },
  {
    id: "4",
    student_reference: "APEX/2020/LAW/0073",
    recipient_name: "Folashade Adeleke",
    recipient_email: "folashade.adeleke@apex.edu.ng",
    faculty: "Faculty of Law",
    programme: "LL.B. Commercial & Property Law",
    classification: "Second Class Honours (Upper Division)",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0073",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  },
  {
    id: "5",
    student_reference: "APEX/2021/ACC/0204",
    recipient_name: "Emeka Eze",
    recipient_email: "emeka.eze@apex.edu.ng",
    faculty: "Faculty of Management Sciences",
    programme: "B.Sc. Accounting",
    classification: "First Class Honours",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0204",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  },
  {
    id: "6",
    student_reference: "APEX/2020/CYS/0015",
    recipient_name: "Amina Suleiman",
    recipient_email: "amina.suleiman@apex.edu.ng",
    faculty: "Faculty of Computing & Information Science",
    programme: "B.Sc. Cybersecurity",
    classification: "Second Class Honours (Lower Division)",
    graduation_date: "2024-07-20",
    certificate_number: "APEX-2024-0015",
    local_status: "active",
    vaasone_certificate_id: null,
    vaasone_sync_status: "unanchored",
    document_hash: null,
    stellar_tx: null,
    stellar_ledger: null,
    last_synced_at: null
  }
]

originalStudents.forEach((s) => {
  students.push(s)
  usedRefs.add(s.student_reference)
})

let currentId = 7
let seqNum = 100

while (students.length < totalStudentsToGenerate) {
  const fGroup = pick(facultiesAndProgrammes)
  const prog = pick(fGroup.programmes)
  const gradYear = pick(years)
  const entryYear = gradYear - (prog.code === 'MED' ? 6 : (prog.code.startsWith('B.Eng') ? 5 : 4))
  const seqStr = String(seqNum++).padStart(4, '0')
  const studentRef = `APEX/${entryYear}/${prog.code}/${seqStr}`

  if (usedRefs.has(studentRef)) continue
  usedRefs.add(studentRef)

  const firstName = pick(firstNames)
  const lastName = pick(lastNames)
  const fullName = `${firstName} ${lastName}`
  const emailName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}@apex.edu.ng`
  const certNumber = `APEX-${gradYear}-${seqStr}`

  let classification
  if (prog.classification) {
    classification = pick(prog.classification)
  } else {
    classification = pick(standardClassifications)
  }

  // Set 12 random students as already anchored on Stellar for demo realism, and 2 as revoked
  let syncStatus = 'unanchored'
  let localStatus = 'active'
  let certId = null
  let docHash = null
  let stellarTx = null
  let stellarLedger = null
  let lastSynced = null
  let revocationReason = null

  if (students.length >= 7 && students.length <= 18) {
    syncStatus = 'anchored'
    certId = `VAAS-APEX-${gradYear}-${seqStr}`
    docHash = `sha256:${Buffer.from(`${studentRef}-${certNumber}-${fullName}`).toString('hex').slice(0, 64).padEnd(64, 'a')}`
    stellarTx = `e${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.slice(0, 64)
    stellarLedger = 51240000 + Math.floor(Math.random() * 99999)
    lastSynced = new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
  } else if (students.length === 19 || students.length === 20) {
    syncStatus = 'revoked'
    localStatus = 'revoked'
    certId = `VAAS-APEX-${gradYear}-${seqStr}`
    docHash = `sha256:${Buffer.from(`${studentRef}-${certNumber}-${fullName}`).toString('hex').slice(0, 64).padEnd(64, 'b')}`
    stellarTx = `f${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`.slice(0, 64)
    stellarLedger = 51260000 + Math.floor(Math.random() * 99999)
    lastSynced = new Date(Date.now() - 5000000).toISOString()
    revocationReason = students.length === 19 ? 'Disciplinary Senate Decision - Examination Misconduct' : 'Transcript Falsification Investigation nullified award'
  }

  const gradMonth = pick(['06-25', '07-15', '07-28', '11-12', '12-05'])

  const record = {
    id: String(currentId++),
    student_reference: studentRef,
    recipient_name: fullName,
    recipient_email: emailName,
    faculty: fGroup.faculty,
    programme: prog.name,
    classification,
    graduation_date: `${gradYear}-${gradMonth}`,
    certificate_number: certNumber,
    local_status: localStatus,
    vaasone_certificate_id: certId,
    vaasone_sync_status: syncStatus,
    document_hash: docHash,
    stellar_tx: stellarTx,
    stellar_ledger: stellarLedger,
    last_synced_at: lastSynced,
  }

  if (revocationReason) {
    record.revocation_reason = revocationReason
  }

  students.push(record)
}

const outputPath = path.join(__dirname, '..', 'data', 'students.json')
fs.writeFileSync(outputPath, JSON.stringify(students, null, 2), 'utf-8')
console.log(`Successfully generated ${students.length} students into ${outputPath}`)
