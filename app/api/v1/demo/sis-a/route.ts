import { NextResponse } from 'next/server'

/**
 * GET /api/v1/demo/sis-a
 * Simulates a PostgreSQL-backed SIS REST endpoint.
 * University of Lagos — "Transcript Management System"
 */
export async function GET() {
  return NextResponse.json({
    source: 'University of Lagos — Transcript Management System',
    format: 'rest',
    records: [
      { student_id: 'ULAG/21/CS/0142', student_name: 'Amara Okafor', email: 'amara.o@unilag.edu.ng', programme: 'BSc Computer Science', programme_code: 'CS-100', award_title: 'Bachelor of Science', classification: 'First Class', graduation_date: '2024-07-15', certificate_number: 'ULAG-2024-0482', issue_date: '2024-09-10', type: 'degree' },
      { student_id: 'ULAG/20/ENG/0088', student_name: 'Chinedu Eze', email: 'chinedu.e@unilag.edu.ng', programme: 'BEng Electrical Engineering', programme_code: 'EE-200', award_title: 'Bachelor of Engineering', classification: 'Second Class Upper', graduation_date: '2024-07-15', certificate_number: 'ULAG-2024-0483', issue_date: '2024-09-10', type: 'degree' },
      { student_id: 'ULAG/21/MED/0201', student_name: 'Ngozi Adebayo', email: 'ngozi.a@unilag.edu.ng', programme: 'MBBS Medicine', programme_code: 'MED-300', award_title: 'Bachelor of Medicine', classification: 'Distinction', graduation_date: '2024-07-15', certificate_number: 'ULAG-2024-0484', issue_date: '2024-09-10', type: 'degree' },
    ],
  })
}
