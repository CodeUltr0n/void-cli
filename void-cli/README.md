# Void International CLI

```
  __   _____ ___ ___    ___ _  _ _____ ___ ___ _  _   _ _____ ___ ___  _  _   _   _
  \ \ / / _ \_ _|   \  |_ _| \| |_   _| __| _ \ \| | /_\_   _|_ _/ _ \| \| | /_\ | |
   \ V / (_) | || |) |  | || .` | | | | _||   / .` |/ _ \| |  | | (_) | .` |/ _ \| |__
    \_/ \___/___|___/  |___|_|\_| |_| |___|_|_\_|\_/_/ \_\_| |___\___/|_|\_/_/ \_\____|
```

> The Infrastructure Layer for MCP

---

## Installation

### From npm (recommended)
```bash
npm install -g @ketan_chokkara/void-cli
```

### From GitHub (no npm account needed)
```bash
npx github:CodeUltr0n/void
```

### Run without installing
```bash
npx @ketan_chokkara/void-cli --help
```

---

## Usage

```bash
# View all commands
void --help

# Deploy an MCP server
void deploy --server hotel-booking

# Check system status
void status

# List connected MCP servers
void server list

# Test routing decisions
void route test

# Version
void --version
```

---

## Example

```bash
$ void deploy --server hotel-booking

✓ Building container image...
✓ Deploying to mcp.void.dev/hotel-booking...
✓ SSL certificate configured
✓ Health check passed

→ Live at: https://hotel-booking.void.dev

  Route your AI agent:
  https://mcp.void.dev/v1/hotel-booking

  Inspect telemetry on dashboard: https://app.void.dev
```

---

## Requirements

- Node.js >= 18.0.0

## License

MIT © Ketan Chokkara
