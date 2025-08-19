# 🚀 Synergy Well - Development Environment

## Quick Start

### Option 1: One-Command Startup (Recommended)
```bash
npm run dev:full
```

### Option 2: Cross-Platform Node.js Script
```bash
npm run dev:cross
```

### Option 3: Manual Startup
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (running on localhost:27017)
3. **npm** or **yarn**

### MongoDB Setup
```bash
# macOS (via Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from https://www.mongodb.com/try/download/community
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:full` | Start all services (bash script - Unix/macOS) |
| `npm run dev:cross` | Start all services (Node.js script - cross-platform) |
| `npm run dev:frontend` | Start only frontend (port 8080) |
| `npm run dev:backend` | Start only backend (port 3001) |
| `npm run dev:kill` | Kill all development processes |
| `npm run install:all` | Install all dependencies (frontend + backend) |
| `npm run clean` | Clean and reinstall all dependencies |

## 🌐 Service URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **MongoDB**: mongodb://localhost:27017

## 📁 Project Structure

```
synergy-well/
├── src/                    # Frontend source code
├── backend/               # Backend source code
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # MongoDB models
│   │   └── routes/       # API routes
│   └── package.json
├── logs/                 # Development logs
├── start-dev.sh         # Unix/macOS startup script
├── start-dev.js         # Cross-platform Node.js script
├── start-dev.bat        # Windows batch script
└── package.json

```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:3001/api
```

#### Backend (backend/.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/synergy-well
CLERK_SECRET_KEY=your_clerk_secret
OPENAI_API_KEY=your_openai_key
```

## 🐛 Troubleshooting

### Port Already in Use
The startup scripts automatically detect and offer to kill existing processes on required ports (8080, 3001).

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh --host localhost:27017 --eval "db.runCommand('ping')"

# Start MongoDB (macOS)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

### Dependency Issues
```bash
# Clean and reinstall all dependencies
npm run clean
```

### View Logs
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs  
tail -f logs/frontend.log
```

## 🏗️ Development Features

### Intelligent Port Management
- Automatically detects port conflicts
- Offers to terminate existing processes
- Prevents multiple instances

### Service Health Monitoring
- Waits for services to be ready before proceeding
- Health checks for all services
- Graceful startup and shutdown

### Cross-Platform Support
- Bash script for Unix/macOS (`start-dev.sh`)
- Node.js script for all platforms (`start-dev.js`)
- Batch script for Windows (`start-dev.bat`)

### Logging
- Separate log files for each service
- Timestamped console output
- Error detection and reporting

## 🔄 Development Workflow

1. **Start Services**: `npm run dev:full`
2. **Make Changes**: Edit frontend/backend code
3. **Hot Reload**: Changes automatically refresh
4. **View Logs**: Monitor `logs/` directory
5. **Stop Services**: Press `Ctrl+C`

## 📊 Current Implementation Status

### ✅ Completed (Phase 1.1 & 1.2)
- [x] Clerk authentication integration
- [x] Express.js backend with TypeScript
- [x] MongoDB database setup
- [x] Basic API endpoints
- [x] CORS and security middleware
- [x] Webhook integration for user sync
- [x] Development environment scripts

### 🔄 Next Steps (Phase 2)
- [ ] Employee data management
- [ ] Department structure
- [ ] Role-based permissions
- [ ] Data migration from Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev:full`
5. Submit a pull request

## 📞 Support

For issues with the development environment, check:
1. Prerequisites are installed
2. MongoDB is running
3. Ports 8080 and 3001 are available
4. Log files in `logs/` directory
