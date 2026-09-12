import { createClient } from '@/lib/supabase/server'

export async function findCredentialByPublicId(credentialId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credentials')
    .select('credential_id, recipient_name, program, issued_at, status, network, digest, transaction_id, ledger, institutions(name, country)')
    .eq('credential_id', credentialId)
    .maybeSingle()

  if (error) throw new Error(`Credential lookup failed: ${error.message}`)
  return data
}

export async function listCredentials() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credentials')
    .select('credential_id, recipient_name, program, issued_at, status, network, digest, transaction_id, ledger, institutions(name, country)')
    .order('issued_at', { ascending: false })

  if (error) throw new Error(`Credential listing failed: ${error.message}`)
  return data ?? []
}
