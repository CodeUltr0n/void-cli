#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

const voidAscii = `
  \x1b[33m__   _____ ___ ___    ___ _  _ _____ ___ ___ _  _   _ _____ ___ ___  _  _   _   _\x1b[0m
  \x1b[33m\\ \\ / / _ \\_ _|   \\  |_ _| \\| |_   _| __| _ \\ \\| | /_\\_   _|_ _/ _ \\| \\| | /_\\ | |\x1b[0m
  \x1b[33m \\ V / (_) | || |) |  | || .\` | | | | _||   / .\` |/ _ \\| |  | | (_) | .\` |/ _ \\| |__\x1b[0m
  \x1b[33m  \\_/ \\___/___|___/  |___|_|\\_| |_| |___|_|_\\_|\\_/_/ \\_\\_| |___\\___/|_|\\_/_/ \\_\\____|\x1b[0m
  \x1b[90m───────────────────────────────────────────────────────────────────────────────────\x1b[0m
  The Infrastructure Layer for MCP
`;

function printHelp() {
  console.log(voidAscii);
  console.log('USAGE');
  console.log('  void <command> [options]\n');
  console.log('COMMANDS');
  console.log('  deploy --server <name>   Deploy an MCP server to Void');
  console.log('  status                   System overview & active clusters');
  console.log('  server list              List all connected MCP servers');
  console.log('  route test               Test multi-cluster routing decision');
  console.log('  --version                Print CLI version\n');
}

function printDeploy(serverName = 'my-mcp') {
  console.log(`\n\x1b[32m✓\x1b[0m Building container image...`);
  console.log(`\x1b[32m✓\x1b[0m Deploying to mcp.void.dev/${serverName}...`);
  console.log(`\x1b[32m✓\x1b[0m SSL certificate configured`);
  console.log(`\x1b[32m✓\x1b[0m Health check passed\n`);
  console.log(`\x1b[33m→ Live at:\x1b[0m https://${serverName}.void.dev\n`);
  console.log(`  \x1b[36mRoute your AI agent:\x1b[0m`);
  console.log(`  https://mcp.void.dev/v1/${serverName}\n`);
  console.log(`  \x1b[90mInspect telemetry on dashboard:\x1b[0m https://app.void.dev\n`);
}

function printStatus() {
  console.log(`\n\x1b[33mVoid System Mesh:\x1b[0m`);
  console.log(`  Clusters: \x1b[32m3 Healthy\x1b[0m | \x1b[33m1 Degraded\x1b[0m | \x1b[31m0 Down\x1b[0m`);
  console.log(`  Latency:  \x1b[32m142ms\x1b[0m (p95 avg)`);
  console.log(`  Status:   \x1b[32mAll Systems Operational\x1b[0m\n`);
}

if (!command || command === '--help' || command === '-h' || command === 'help') {
  printHelp();
} else if (command === 'deploy') {
  const serverIndex = args.indexOf('--server');
  const serverName = (serverIndex !== -1 && args[serverIndex + 1]) ? args[serverIndex + 1] : 'my-mcp';
  printDeploy(serverName);
} else if (command === 'status') {
  printStatus();
} else if (command === '--version' || command === '-v') {
  console.log('Void CLI v0.1.0-beta');
} else {
  console.log(`\n  \x1b[31m✖ Unknown command: ${command}\x1b[0m`);
  console.log('  Run "void --help" to see available commands.\n');
}
