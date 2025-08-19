#!/usr/bin/env node

/**
 * Synergy Well - Cross-Platform Development Environment Startup Script
 * This Node.js script starts all required services for the platform
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const config = {
  FRONTEND_PORT: 8080,
  BACKEND_PORT: 3001,
  MONGODB_PORT: 27017,
  MAX_RETRIES: 30,
  RETRY_INTERVAL: 1000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

class DevEnvironment {
  constructor() {
    this.processes = [];
    this.setupSignalHandlers();
  }

  log(message, color = colors.blue) {
    const timestamp = new Date().toISOString();
    console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
  }

  success(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
  }

  warning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  }

  error(message) {
    console.log(`${colors.red}❌ ${message}${colors.reset}`);
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  cleanup() {
    this.log('Cleaning up processes...');
    
    this.processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    });

    this.success('Cleanup completed');
    process.exit(0);
  }

  async checkPort(port, serviceName) {
    return new Promise((resolve) => {
      const server = http.createServer();
      
      server.listen(port, () => {
        server.close(() => resolve(true));
      });

      server.on('error', () => {
        this.warning(`${serviceName} port ${port} is already in use`);
        resolve(false);
      });
    });
  }

  async checkMongoDB() {
    return new Promise((resolve) => {
      exec(`mongosh --host localhost:${config.MONGODB_PORT} --eval "db.runCommand('ping')"`, 
        { timeout: 5000 }, 
        (error) => {
          if (error) {
            this.error(`MongoDB is not running on port ${config.MONGODB_PORT}`);
            this.log('Please start MongoDB using one of these methods:');
            this.log('  - brew services start mongodb-community');
            this.log('  - sudo systemctl start mongod');
            this.log('  - mongod --dbpath /path/to/your/db');
            resolve(false);
          } else {
            this.success(`MongoDB is running on port ${config.MONGODB_PORT}`);
            resolve(true);
          }
        }
      );
    });
  }

  async installDependencies(dir, name) {
    const nodeModulesPath = path.join(dir, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      this.log(`Installing ${name} dependencies...`);
      
      return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install'], { 
          cwd: dir, 
          stdio: 'pipe' 
        });

        npm.on('close', (code) => {
          if (code === 0) {
            this.success(`${name} dependencies installed`);
            resolve();
          } else {
            reject(new Error(`Failed to install ${name} dependencies`));
          }
        });
      });
    } else {
      this.log(`${name} dependencies already installed`);
    }
  }

  async waitForService(port, serviceName, maxRetries = config.MAX_RETRIES) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(`http://localhost:${port}`, resolve);
          req.on('error', reject);
          req.setTimeout(1000, () => req.destroy());
        });
        
        this.success(`${serviceName} started successfully on http://localhost:${port}`);
        return true;
      } catch {
        await new Promise(resolve => setTimeout(resolve, config.RETRY_INTERVAL));
      }
    }
    
    this.error(`${serviceName} failed to start within ${maxRetries} seconds`);
    return false;
  }

  startService(command, args, cwd, logFile, serviceName) {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const logPath = path.join(logsDir, logFile);
    const logStream = fs.createWriteStream(logPath);

    const proc = spawn(command, args, { 
      cwd, 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    proc.stdout.pipe(logStream);
    proc.stderr.pipe(logStream);

    proc.on('error', (error) => {
      this.error(`Failed to start ${serviceName}: ${error.message}`);
    });

    this.processes.push(proc);
    return proc;
  }

  async start() {
    this.log('🚀 Starting Synergy Well Development Environment');

    // Check if we're in the right directory
    if (!fs.existsSync('package.json') || !fs.existsSync('backend/package.json')) {
      this.error('Script must be run from the project root directory');
      process.exit(1);
    }

    // Check MongoDB
    if (!(await this.checkMongoDB())) {
      process.exit(1);
    }

    // Check ports
    if (!(await this.checkPort(config.FRONTEND_PORT, 'Frontend'))) {
      this.error('Frontend port is occupied. Please stop the existing process.');
      process.exit(1);
    }

    if (!(await this.checkPort(config.BACKEND_PORT, 'Backend'))) {
      this.error('Backend port is occupied. Please stop the existing process.');
      process.exit(1);
    }

    // Install dependencies
    this.log('📦 Checking dependencies...');
    try {
      await this.installDependencies(__dirname, 'Frontend');
      await this.installDependencies(path.join(__dirname, 'backend'), 'Backend');
    } catch (error) {
      this.error(`Dependency installation failed: ${error.message}`);
      process.exit(1);
    }

    // Start Backend
    this.log(`🔧 Starting Backend Server (Port: ${config.BACKEND_PORT})...`);
    this.startService('npm', ['run', 'dev'], 
      path.join(__dirname, 'backend'), 
      'backend.log', 
      'Backend'
    );

    // Wait for backend
    this.log('⏳ Waiting for backend to start...');
    if (!(await this.waitForService(config.BACKEND_PORT, 'Backend'))) {
      process.exit(1);
    }

    // Start Frontend
    this.log(`🎨 Starting Frontend Server (Port: ${config.FRONTEND_PORT})...`);
    this.startService('npm', ['run', 'dev'], 
      __dirname, 
      'frontend.log', 
      'Frontend'
    );

    // Wait for frontend
    this.log('⏳ Waiting for frontend to start...');
    if (!(await this.waitForService(config.FRONTEND_PORT, 'Frontend'))) {
      process.exit(1);
    }

    // Display status
    console.log('\n🎉 All services are running!\n');
    console.log(`📱 Frontend:  http://localhost:${config.FRONTEND_PORT}`);
    console.log(`🔧 Backend:   http://localhost:${config.BACKEND_PORT}`);
    console.log(`🔧 API Docs:  http://localhost:${config.BACKEND_PORT}/health`);
    console.log(`🍃 MongoDB:   mongodb://localhost:${config.MONGODB_PORT}\n`);
    console.log('📝 Logs are available in:');
    console.log('   Frontend: logs/frontend.log');
    console.log('   Backend:  logs/backend.log\n');
    console.log('💡 Commands:');
    console.log('   View backend logs:  tail -f logs/backend.log');
    console.log('   View frontend logs: tail -f logs/frontend.log');
    console.log('   Stop all services:  Ctrl+C\n');

    this.log('👀 Monitoring services... Press Ctrl+C to stop all services');

    // Keep process alive
    await new Promise(() => {});
  }
}

// Run the development environment
if (require.main === module) {
  const devEnv = new DevEnvironment();
  devEnv.start().catch(error => {
    console.error('Failed to start development environment:', error);
    process.exit(1);
  });
}

module.exports = DevEnvironment;
