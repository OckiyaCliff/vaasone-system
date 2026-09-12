/**
 * Vaasone — BNB Smart Chain Contract Deployment Script
 *
 * Compiles VaasoneCredentialRegistry.sol and deploys to BNB testnet.
 *
 * Prerequisites:
 *   1. Run `node scripts/generate-keys.mjs` first (generates BNB wallet)
 *   2. Fund the BNB wallet via https://testnet.bnbchain.org/faucet-smart
 *   3. Run `node scripts/deploy-bnb.mjs`
 *
 * Usage: node scripts/deploy-bnb.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ethers } from 'ethers'
import solc from 'solc'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_FILE = resolve(ROOT, '.env')
const CONTRACT_PATH = resolve(ROOT, 'contracts', 'VaasoneCredentialRegistry.sol')
const ABI_PATH = resolve(ROOT, 'contracts', 'VaasoneCredentialRegistry.json')

// BNB Smart Chain Testnet
const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545'
const CHAIN_ID = 97

async function main() {
  console.log('\n🔶 Vaasone — BNB Smart Chain Deployment\n')
  console.log('─'.repeat(50))

  // ── 1. Load private key from .env ────────────────────────
  const env = readFileSync(ENV_FILE, 'utf-8')
  const privateKeyMatch = env.match(/BNB_PRIVATE_KEY=(.+)/)
  const privateKey = privateKeyMatch?.[1]?.trim()

  if (!privateKey || privateKey.length < 60) {
    console.error('❌ BNB_PRIVATE_KEY not found in .env')
    console.error('   Run: node scripts/generate-keys.mjs')
    process.exit(1)
  }

  // ── 2. Connect to BNB testnet ────────────────────────────
  console.log('🌐 Connecting to BNB testnet...')
  const provider = new ethers.JsonRpcProvider(BNB_TESTNET_RPC, CHAIN_ID)
  const wallet = new ethers.Wallet(privateKey, provider)
  console.log(`   Wallet:  ${wallet.address}`)

  const balance = await provider.getBalance(wallet.address)
  const balanceBNB = ethers.formatEther(balance)
  console.log(`   Balance: ${balanceBNB} tBNB`)

  if (balance === 0n) {
    console.error('\n❌ Wallet has no tBNB balance.')
    console.error(`   Fund it here: https://testnet.bnbchain.org/faucet-smart`)
    console.error(`   Wallet address: ${wallet.address}`)
    process.exit(1)
  }

  // ── 3. Compile contract ──────────────────────────────────
  console.log('\n📄 Compiling VaasoneCredentialRegistry.sol...')
  const source = readFileSync(CONTRACT_PATH, 'utf-8')

  const input = {
    language: 'Solidity',
    sources: {
      'VaasoneCredentialRegistry.sol': { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode.object'] },
      },
    },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))

  if (output.errors?.some(e => e.severity === 'error')) {
    console.error('❌ Compilation errors:')
    output.errors.filter(e => e.severity === 'error').forEach(e => console.error(e.formattedMessage))
    process.exit(1)
  }

  const contract = output.contracts['VaasoneCredentialRegistry.sol']['VaasoneCredentialRegistry']
  const abi = contract.abi
  const bytecode = '0x' + contract.evm.bytecode.object

  console.log(`   ✅ Compiled. ABI: ${abi.length} functions/events. Bytecode: ${bytecode.length} bytes`)

  // Save ABI for the provider
  writeFileSync(ABI_PATH, JSON.stringify({ abi, bytecode: bytecode }, null, 2))
  console.log(`   📁 ABI saved to contracts/VaasoneCredentialRegistry.json`)

  // ── 4. Deploy ────────────────────────────────────────────
  console.log('\n🚀 Deploying to BNB testnet...')
  const factory = new ethers.ContractFactory(abi, bytecode, wallet)

  const deployed = await factory.deploy()
  console.log(`   Tx hash:    ${deployed.deploymentTransaction()?.hash}`)

  console.log('   Waiting for confirmation...')
  await deployed.waitForDeployment()
  const contractAddress = await deployed.getAddress()
  console.log(`   ✅ Deployed at: ${contractAddress}`)

  // ── 5. Update .env ───────────────────────────────────────
  console.log('\n📝 Updating .env with contract address...')
  let envContent = readFileSync(ENV_FILE, 'utf-8')
  envContent = envContent.replace(/BNB_CONTRACT_ADDRESS=.*/, `BNB_CONTRACT_ADDRESS=${contractAddress}`)
  writeFileSync(ENV_FILE, envContent)
  console.log('   ✅ .env updated')

  // ── 6. Verify contract works ─────────────────────────────
  console.log('\n🧪 Testing contract...')
  const registry = new ethers.Contract(contractAddress, abi, wallet)

  const testHash = ethers.keccak256(ethers.toUtf8Bytes('test-credential-hash'))
  const tx = await registry.anchorCredential('VO-TEST-001', testHash)
  await tx.wait()
  console.log('   ✅ Test anchor successful')

  const [docHash, anchoredAt, isRevoked] = await registry.verifyCredential('VO-TEST-001')
  console.log(`   ✅ Test verify: hash=${docHash.slice(0, 10)}... anchored=${new Date(Number(anchoredAt) * 1000).toISOString()}`)

  const active = await registry.isActive('VO-TEST-001')
  console.log(`   ✅ isActive: ${active}`)

  // ── Summary ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50))
  console.log('✅ BNB Smart Chain deployment complete!')
  console.log('')
  console.log(`  Contract:  ${contractAddress}`)
  console.log(`  Network:   BNB Smart Chain Testnet (Chain ID: ${CHAIN_ID})`)
  console.log(`  Owner:     ${wallet.address}`)
  console.log(`  Explorer:  https://testnet.bscscan.com/address/${contractAddress}`)
  console.log(`  Tx:        https://testnet.bscscan.com/tx/${deployed.deploymentTransaction()?.hash}`)
  console.log('')
  console.log('The contract address has been saved to your .env file.')
  console.log('═'.repeat(50))
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err.message)
  if (err.message.includes('insufficient funds')) {
    console.error('   → Fund your wallet: https://testnet.bnbchain.org/faucet-smart')
  }
  process.exit(1)
})
