import { NextResponse } from 'next/server'

/**
 * POST /api/v1/demo/sis-b
 * Simulates a SOAP/XML-based SIS endpoint.
 * Ashesi University — Legacy Student Records System (MySQL)
 */
export async function POST() {
  const xmlResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCredentialsResponse xmlns="urn:ashesi-sis">
      <record>
        <matric_no>ASH/21/DE/0044</matric_no>
        <full_name>Kwame Mensah</full_name>
        <email>kwame.m@ashesi.edu.gh</email>
        <course_title>MSc Data Engineering</course_title>
        <course_code>DE-500</course_code>
        <degree_type>Master of Science</degree_type>
        <honours>Distinction</honours>
        <grad_date>2024-08-20</grad_date>
        <cert_no>ASH-2024-0481</cert_no>
        <date_issued>2024-09-10</date_issued>
        <type>degree</type>
      </record>
      <record>
        <matric_no>ASH/20/BA/0118</matric_no>
        <full_name>Abena Darko</full_name>
        <email>abena.d@ashesi.edu.gh</email>
        <course_title>BA Business Administration</course_title>
        <course_code>BA-100</course_code>
        <degree_type>Bachelor of Arts</degree_type>
        <honours>First Class</honours>
        <grad_date>2024-08-20</grad_date>
        <cert_no>ASH-2024-0482</cert_no>
        <date_issued>2024-09-10</date_issued>
        <type>degree</type>
      </record>
    </GetCredentialsResponse>
  </soap:Body>
</soap:Envelope>`

  return new NextResponse(xmlResponse, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/* Also support GET for testing */
export async function GET() {
  return POST()
}
