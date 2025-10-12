# Cordium Configuration Panel

A web-based configuration and management interface for Cordium Discord bots.

## Features

### Initial Setup
- Discord bot credentials configuration
- Database connection settings
- Real-time configuration status validation

### Advanced Configuration
- Events system settings (listen, report, folder paths)
- Endpoints system settings (listen, report, folder paths)
- Project folder structure customization
- API port configuration
- Timezone and locale settings
- Development mode toggle (hot-reload)

### File Management
- **Commands Manager** - Create, edit, and delete slash commands
- **Events Manager** - Modify event handler callbacks
- **Endpoints Manager** - Edit API endpoint implementations
- **Sandbox** - Test and develop code snippets

### Interface Features
- Responsive Bootstrap 5 design
- Dark/Light theme with persistent preference
- CodeMirror-powered code editor with syntax highlighting
- Real-time file browser
- Secure file operations with path validation
- Loading states and notification system

## Usage

### Automatic Launch

When you run `npm start`, the configurator launches automatically if required credentials are missing:

```bash
npm start
```

Access at: `http://localhost:3001`

### Manual Launch

Force launch the configuration panel even if already configured:

```bash
npm run config
```

## API Endpoints

The configurator server provides these REST endpoints:

### Configuration
- `GET /api/config/status` - Check if bot is configured
- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration

### File Management
- `GET /api/files/:category` - List files in category (commands/events/endpoints/sandbox)
- `GET /api/file/:category/*` - Get file content
- `POST /api/file/:category/*` - Save file content
- `DELETE /api/file/:category/*` - Delete file (commands/sandbox only)

### Bot Control
- `POST /api/bot/start` - Validate configuration status

## Security

- Path traversal protection on all file operations
- Read-only access to existing events and endpoints
- Write access only to commands and sandbox files
- Environment variables never exposed in frontend
- CORS not enabled by default

## File Restrictions

### Read/Write Access
- Commands (`src/commands/`) - Full access
- Sandbox (`src/sandbox/`) - Full access

### Read-Only Access
- Events (`src/events/`) - Content modification only
- Endpoints (`src/endpoints/`) - Content modification only

### No Access
- Internal framework files (`internals/`)
- Node modules
- Configuration folder structure

## Configuration Flow

1. **Initial Setup** - Configure Discord credentials (required)
2. **Database Setup** - Configure database connection (optional)
3. **Advanced Settings** - Customize behavior and paths
4. **File Management** - Create commands and edit code
5. **Launch Bot** - Restart the application with `npm start`

## Theme System

The interface supports dark and light themes:

- Click the theme toggle in the navbar
- Preference saved in localStorage
- CodeMirror themes automatically switch:
  - Dark mode: Dracula theme
  - Light mode: Elegant theme

## Port Configuration

Default port: `3001`

To change the port, edit `configurator/server.js`:

```javascript
const PORT = 3001;
```

Make sure the port doesn't conflict with your bot's API port (default `8080`).

## Technical Stack

### Backend
- Express.js 5.1.0
- Node.js fs/path modules
- Body parser middleware

### Frontend
- Bootstrap 5.3.2 (responsive framework)
- Bootstrap Icons 1.11.3
- CodeMirror 5.65.2 (code editor)
- Vanilla JavaScript (no framework dependencies)

## Development

The configurator is independent from the main bot:

- Runs on separate port
- Can be launched while bot is running
- Changes saved immediately to disk
- Bot requires restart to pick up changes (unless in dev mode)

## Browser Support

Tested and supported on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires JavaScript enabled and modern CSS support (CSS Grid, Flexbox, CSS Variables).

