const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// 🔐 Helper function to read secrets from files
function readSecret(secretPath) {
  try {
    return fs.readFileSync(secretPath, 'utf8').trim();
  } catch (error) {
    console.warn(`Could not read secret from ${secretPath}:`, error.message);
    return null;
  }
}

// 🔐 Get database password from secret file or fallback to env var
const dbPassword = process.env.DB_PASSWORD_FILE 
  ? readSecret(process.env.DB_PASSWORD_FILE)
  : process.env.DB_PASSWORD || 'secret123';

// 🔐 Get Redis password from secret file or fallback to env var
const redisPassword = process.env.REDIS_PASSWORD_FILE
  ? readSecret(process.env.REDIS_PASSWORD_FILE)
  : process.env.REDIS_PASSWORD || 'cachepass123';

// 🔐 Get API key from secret file (if exists)
const apiKey = process.env.API_KEY_FILE
  ? readSecret(process.env.API_KEY_FILE)
  : null;

console.log('🔐 Secrets loaded from:', {
  dbPassword: process.env.DB_PASSWORD_FILE ? '✅ Secret file' : '⚠️  Environment variable',
  redisPassword: process.env.REDIS_PASSWORD_FILE ? '✅ Secret file' : '⚠️  Environment variable',
  apiKey: apiKey ? '✅ Secret file' : '❌ Not configured'
});

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'appdb',
  user: process.env.DB_USER || 'apiuser',
  password: dbPassword,
});

// Redis connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'cache',
    port: process.env.REDIS_PORT || 6379,
  },
  password: redisPassword,
});

redisClient.connect().catch(console.error);

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbResult = await pool.query('SELECT NOW()');
    
    // Test Redis connection
    await redisClient.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      cache: 'connected',
      message: '✅ API is running with network isolation and secrets!',
      networks: {
        frontend: 'Cannot access (isolated)',
        backend: 'Connected (can receive requests)',
        database: 'Connected (can access DB and Redis)',
      },
      security: {
        databaseExposed: false,
        cacheExposed: false,
        apiDirectlyAccessible: false,
        secretsUsed: true,
        description: 'Database and cache are on internal network only! Passwords stored as secrets.'
      },
      secretsInfo: {
        dbPasswordSource: process.env.DB_PASSWORD_FILE ? 'secret file' : 'environment',
        redisPasswordSource: process.env.REDIS_PASSWORD_FILE ? 'secret file' : 'environment',
        apiKeyConfigured: !!apiKey
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Get users from database
app.get('/users', async (req, res) => {
  try {
    // Try cache first
    const cached = await redisClient.get('users');
    
    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached),
      });
    }
    
    // Query database
    const result = await pool.query('SELECT id, name, email FROM users LIMIT 10');
    
    // Cache the result
    await redisClient.setEx('users', 60, JSON.stringify(result.rows));
    
    res.json({
      source: 'database',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a test user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    // Invalidate cache
    await redisClient.del('users');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Network info endpoint
app.get('/network-info', (req, res) => {
  res.json({
    message: 'Network Isolation + Secrets Demo',
    currentService: 'API Backend',
    connectedNetworks: ['backend-network', 'database-network'],
    canAccess: {
      frontend: true,
      database: true,
      cache: true,
    },
    cannotAccess: {
      internet: 'Database network is internal only',
      directPublic: 'Not exposed to host, only via Nginx',
    },
    isolation: {
      level: 'Medium',
      description: 'Acts as bridge between frontend and database layers',
    },
    secretsManagement: {
      enabled: true,
      method: 'Docker Compose secrets (file-based)',
      secretsLocation: '/run/secrets/',
      secretsMounted: fs.existsSync('/run/secrets') ? fs.readdirSync('/run/secrets') : []
    }
  });
});

// Secrets info endpoint (for learning purposes - remove in production!)
app.get('/secrets-demo', (req, res) => {
  const secretsDir = '/run/secrets';
  
  if (!fs.existsSync(secretsDir)) {
    return res.json({
      message: 'No secrets directory found',
      note: 'Secrets are only available when using Docker Compose secrets'
    });
  }
  
  const secrets = fs.readdirSync(secretsDir);
  
  res.json({
    message: '🔐 Docker Secrets Demo',
    secretsDirectory: secretsDir,
    secretsFound: secrets,
    howToAccess: {
      example: 'cat /run/secrets/db_password',
      description: 'Secrets are mounted as read-only files'
    },
    securityNote: '⚠️  This endpoint is for learning only. Never expose secrets in production!',
    filePermissions: secrets.reduce((acc, secret) => {
      const stats = fs.statSync(`${secretsDir}/${secret}`);
      acc[secret] = {
        readable: true,
        writable: false,
        mode: stats.mode.toString(8)
      };
      return acc;
    }, {})
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`🔒 Network isolation enabled`);
  console.log(`🔐 Secrets management enabled`);
  console.log(`📡 Connected to networks: backend-network, database-network`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});
