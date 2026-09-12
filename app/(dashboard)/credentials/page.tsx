'use client'

import { CredentialsTable } from '@/components/dashboard/credentials-table'
import { useSearchParams } from 'next/navigation'

export default function CredentialsPage() {
  return <CredentialsTable search="" />
}
