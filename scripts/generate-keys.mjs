/**
 * Vaasone — Key Generation & Deployment Script
 * Generates Stellar testnet keypair, funds it, and generates BNB wallet.
 *
 * Usage: node scripts/generate-keys.mjs
 */

import * as Stellar from '@stellar/stellar-sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_FILE = resolve(ROOT, '.env')

async function main() {
  console.log('\n🔑 Vaasone — Blockchain Key Generator\n')
  console.log('─'.repeat(50))

  // ── 1. Generate Stellar Testnet Keypair ──────────────────
  console.log('\n⭐ Generating Stellar testnet keypair...')
  const pair = Stellar.Keypair.random()
  const publicKey = pair.publicKey()
  const secretKey = pair.secret()
  console.log(`   Public:  ${publicKey}`)
  console.log(`   Secret:  ${secretKey.slice(0, 8)}...${secretKey.slice(-4)}`)

  // Fund via Friendbot
  console.log('\n💰 Funding via Stellar Friendbot...')
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`)
    if (res.ok) {
      console.log('   ✅ Account funded with 10,000 XLM (testnet)')
    } else {
      const text = await res.text()
      console.log(`   ⚠️  Friendbot response: ${res.status} — ${text.slice(0, 200)}`)
    }
  } catch (err) {
    console.log(`   ❌ Friendbot failed: ${err.message}`)
    console.log('   → Fund manually: https://friendbot.stellar.org')
  }

  // Verify the account
  console.log('\n🔍 Verifying account on Horizon...')
  try {
    const server = new Stellar.Horizon.Server('https://horizon-testnet.stellar.org')
    const account = await server.loadAccount(publicKey)
    const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance || '0'
    console.log(`   ✅ Account verified. Balance: ${xlmBalance} XLM`)
  } catch (err) {
    console.log(`   ⚠️  Could not verify: ${err.message}`)
  }

  // ── 2. Generate BNB Wallet ───────────────────────────────
  console.log('\n🔶 Generating BNB Smart Chain wallet...')

  // Use Node.js crypto for BNB wallet generation (no ethers dependency needed)
  const { randomBytes } = await import('crypto')
  const privateKeyBytes = randomBytes(32)
  const bnbPrivateKey = '0x' + privateKeyBytes.toString('hex')
  console.log(`   Private: ${bnbPrivateKey.slice(0, 10)}...${bnbPrivateKey.slice(-4)}`)
  console.log('   ⚠️  BNB address will be derived when ethers.js is available')
  console.log('   → Fund via: https://testnet.bnbchain.org/faucet-smart')

  // ── 3. Update .env file ──────────────────────────────────
  console.log('\n📝 Updating .env file...')
  if (existsSync(ENV_FILE)) {
    let env = readFileSync(ENV_FILE, 'utf-8')

    // Update Stellar keys
    env = env.replace(/STELLAR_SECRET_KEY=.*/, `STELLAR_SECRET_KEY=${secretKey}`)

    // Add Stellar public key if not present
    if (!env.includes('STELLAR_PUBLIC_KEY=')) {
      env = env.replace('STELLAR_SECRET_KEY=', `STELLAR_PUBLIC_KEY=${publicKey}\nSTELLAR_SECRET_KEY=`)
    } else {
      env = env.replace(/STELLAR_PUBLIC_KEY=.*/, `STELLAR_PUBLIC_KEY=${publicKey}`)
    }

    // Update BNB private key
    env = env.replace(/BNB_PRIVATE_KEY=.*/, `BNB_PRIVATE_KEY=${bnbPrivateKey}`)

    writeFileSync(ENV_FILE, env)
    console.log('   ✅ .env updated with real keys')
  } else {
    console.log('   ❌ .env file not found')
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50))
  console.log('✅ Keys generated and .env updated!')
  console.log('')
  console.log('Stellar Testnet:')
  console.log(`  Public Key:  ${publicKey}`)
  console.log(`  Explorer:    https://stellar.expert/explorer/testnet/account/${publicKey}`)
  console.log('')
  console.log('BNB Testnet:')
  console.log(`  Private Key: ${bnbPrivateKey.slice(0, 10)}...`)
  console.log(`  Fund here:   https://testnet.bnbchain.org/faucet-smart`)
  console.log('')
  console.log('Next steps:')
  console.log('  1. Fund BNB wallet via faucet link above')
  console.log('  2. Run: node scripts/deploy-bnb.mjs')
  console.log('═'.repeat(50))
}

main().catch(console.error)
