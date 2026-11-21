// Arranca el mock local y Vite con un solo comando, sin dependencias extra.
// Uso: npm run dev:all   (los argumentos se pasan a Vite)
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const extraArgs = process.argv.slice(2);

const children = [
  spawn(process.execPath, ['postman/mocks/user-service/default.cjs'], {
    cwd: root,
    stdio: 'inherit'
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0', ...extraArgs], {
    cwd: root,
    stdio: 'inherit'
  })
];

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(exitCode);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

for (const child of children) {
  child.on('exit', (code) => stop(code ?? 0));
  child.on('error', (error) => {
    console.error('[dev-all] Error al arrancar:', error.message);
    stop(1);
  });
}
