/**
 * Seed script for Apex State University
 * Generates student records JSON and initializes SQLite database
 */
const path = require('path')

console.log('[Seed] Generating student records...')
require('./generate-students.js')

console.log('[Seed] Initializing SQLite database...')
require('../db.js')

console.log('[Seed] Database initialization complete.')
