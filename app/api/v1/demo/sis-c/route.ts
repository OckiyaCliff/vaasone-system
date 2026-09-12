import { NextResponse } from 'next/server'

/**
 * GET /api/v1/demo/sis-c
 * Simulates a CSV export-based SIS.
 * University of Cape Town — exported flat file (Oracle)
 */
export async function GET() {
  const csv = `student_id,student_name,email,programme,programme_code,award_title,classification,graduation_date,certificate_number,issue_date,type
UCT/21/EC/0277,Daniel Ndlovu,daniel.n@uct.ac.za,BA Economics,EC-100,Bachelor of Arts,Second Class Upper,2024-06-30,UCT-2024-0479,2024-09-08,degree
UCT/20/LA/0139,Thandi Moyo,thandi.m@uct.ac.za,LLB Law,LA-200,Bachelor of Laws,First Class,2024-06-30,UCT-2024-0480,2024-09-08,degree
UCT/21/PH/0063,Sipho Zulu,sipho.z@uct.ac.za,BSc Physics,PH-300,Bachelor of Science,Second Class Lower,2024-06-30,UCT-2024-0481,2024-09-08,degree`

  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  })
}
