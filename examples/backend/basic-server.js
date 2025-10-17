const { spawn } = require('child_process')
const path = require('path')

console.log('🧠 OpenMemory Backend Example')
console.log('=============================')

const backendPath = path.join(__dirname, '..', '..', 'backend')
process.chdir(backendPath)

console.log('Starting OpenMemory server...')
const server = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
})

server.on('close', (code) => {
    console.log(`Server exited with code ${code}`)
})

process.on('SIGINT', () => {
    console.log('\nShutting down server...')
    server.kill('SIGINT')
    process.exit(0)
})