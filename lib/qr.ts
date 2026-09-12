/* ──────────────────────────────────────────────────────────
   Vaasone — QR code generation
   Generates verification QR codes for credentials.
   ────────────────────────────────────────────────────────── */

import QRCode from 'qrcode'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate a verification URL for a credential.
 */
export function getVerificationUrl(credentialId: string): string {
  return `${APP_URL}/v/${encodeURIComponent(credentialId)}`
}

/**
 * Generate a QR code as a data URL (base64 PNG).
 */
export async function generateQRDataUrl(credentialId: string): Promise<string> {
  const url = getVerificationUrl(credentialId)
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#171717',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  })
}

/**
 * Generate a QR code as SVG string.
 */
export async function generateQRSvg(credentialId: string): Promise<string> {
  const url = getVerificationUrl(credentialId)
  return QRCode.toString(url, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: {
      dark: '#171717',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  })
}
