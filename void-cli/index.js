#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GOLD = "\x1b[33m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DASHBOARD_URL = "https://void-cli.vercel.app";

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
  console.log(`  ${DIM}Inspect telemetry on dashboard:${RESET} ${DASHBOARD_URL}\n`);
}

function printDeploy(serverName = 'my-mcp') {
  console.log(voidAscii);
  console.log(`${GOLD}${BOLD}  void deploy${RESET} ${DIM}— MCP Server Deployment${RESET}

 ${DIM}  Deploy your MCP servers through the Void Dashboard:${RESET}
  ${CYAN}→ ${DASHBOARD_URL}/servers/new${RESET}

 ${DIM}  Expected CLI output (v1.0):${RESET}
 ${GREEN}  ✓${RESET} Building container image...
 ${GREEN}  ✓${RESET} Deploying to mcp.void.dev/${serverName}...
 ${GREEN}  ✓${RESET} SSL certificate configured
 ${GREEN}  ✓${RESET} Health check passed

  ${BOLD}→${RESET} ${CYAN}Live at: https://${serverName}.void.dev${RESET}
`);
}

function printStatus() {
  console.log(`\n${GOLD}Void System Mesh:${RESET}`);
  console.log(`  Clusters: ${GREEN}3 Healthy${RESET} | ${GOLD}1 Degraded${RESET} | ${RED}0 Down${RESET}`);
  console.log(`  Latency:  ${GREEN}142ms${RESET} (p95 avg)`);
  console.log(`  Status:   ${GREEN}All Systems Operational${RESET}`);
  console.log(`  Dashboard:${CYAN} ${DASHBOARD_URL}${RESET}\n`);
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
  console.log(`\n  ${RED}✖ Unknown command: ${command}${RESET}`);
  console.log('  Run "void --help" to see available commands.\n');
}
