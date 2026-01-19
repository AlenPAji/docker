# Network Isolation + Secrets Example

A real-world example demonstrating **Docker network isolation** and **secrets management** for security.

## 🏗️ Architecture Overview

This example simulates a **3-tier web application** with:
- ✅ **Network Isolation** - Layered security boundaries
- ✅ **Secrets Management** - No hardcoded passwords
- ✅ **Best Practices** - Production-ready patterns

```
Internet
   ↓
[Nginx Reverse Proxy] ← Public access
   ↓ (frontend-network)
[React Frontend] ← Only accessible via Nginx
   ↓ (backend-network)
[Node.js API] ← Only accessible from Frontend
   ↓ (database-network) + 🔐 Secrets
[PostgreSQL + Redis] ← Completely isolated, no external access
```

## 🔒 Dual Security Layers

### 1. Network Isolation Strategy:

1. **frontend-network**: Nginx ↔ React app
   - Public-facing services
   - Nginx exposes ports to host

2. **backend-network**: React app ↔ API
   - Middle tier
   - API not directly accessible from internet

3. **database-network**: API ↔ Database + Cache
   - **Internal only** (no external access)
   - Maximum security for sensitive data

### 2. Secrets Management Strategy:

- 🔐 **No hardcoded passwords** in docker-compose.yml
- 🔐 **Secrets stored in files** (not in environment variables)
- 🔐 **Mounted as read-only** at `/run/secrets/`
- 🔐 **Never committed to Git** (.gitignore protection)

## 📁 Project Structure

```
network-isolation-example/
├── docker-compose.yml           # Main orchestration file
├── .gitignore                   # Protects secrets from Git
├── secrets/                     # 🔐 Secret files (NOT in Git)
│   ├── README.md
│   ├── db_password.txt
│   ├── redis_password.txt
│   └── api_key.txt
├── nginx/
│   └── nginx.conf
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   └── style.css
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── healthcheck.js
├── init.sql                     # Database initialization
└── README.md
```

## 🚀 Quick Start

### Step 1: Create Secrets

```bash
# Create secrets directory
mkdir -p secrets

# Create secret files with your passwords
echo "MySecureDbPassword123!" > secrets/db_password.txt
echo "RedisSecurePass456!" > secrets/redis_password.txt
echo "sk_live_super_secret_api_key_789" > secrets/api_key.txt

# Secure the files (Linux/Mac)
chmod 600 secrets/*.txt
```

### Step 2: Start Services

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### Step 3: Test the Application

```bash
# Open in browser
open http://localhost

# Or test with curl
curl http://localhost/api/health
```

### Step 4: Test Network Isolation

```bash
docker compose logs -f

# Check network isolation
docker compose exec api ping frontend    # ✅ Works (same backend-network)
docker compose exec api ping db           # ✅ Works (same database-network)
docker compose exec frontend ping db      # ❌ Fails (different networks)
docker compose exec nginx ping db         # ❌ Fails (different networks)

# Stop services
docker compose down
```

## 🔍 How It Works

### Access Flow

1. **User Request**: Browser → `http://localhost` (port 80)
2. **Nginx**: Receives request, routes to frontend or API
3. **Frontend**: Serves React app
4. **API**: Frontend calls API at `/api/*`
5. **Database**: API queries PostgreSQL
6. **Cache**: API uses Redis for caching

### Network Security

```yaml
# Nginx can ONLY talk to frontend
nginx:
  networks:
    - frontend-network

# Frontend can talk to API (but not database)
frontend:
  networks:
    - frontend-network  # Nginx can reach it
    - backend-network   # Can reach API

# API can talk to database (but not directly to nginx)
api:
  networks:
    - backend-network   # Frontend can reach it
    - database-network  # Can reach database

# Database is COMPLETELY isolated
db:
  networks:
    - database-network  # Only API can reach it (internal: true)
```

## 🧪 Testing Network Isolation

### Test 1: Frontend CAN reach API
```bash
docker compose exec frontend curl http://api:4000/health
# Expected: Success ✅
```

### Test 2: Frontend CANNOT reach Database
```bash
docker compose exec frontend ping db
# Expected: Failure ❌ (not on same network)
```

### Test 3: Nginx CANNOT reach Database
```bash
docker compose exec nginx ping db
# Expected: Failure ❌ (not on same network)
```

### Test 4: API CAN reach Database
```bash
docker compose exec api ping db
# Expected: Success ✅
```

### Test 5: Database CANNOT reach Internet
```bash
docker compose exec db ping google.com
# Expected: Failure ❌ (internal network)
```

## 📊 Network Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Host Machine (Your Computer)                                │
│                                                              │
│  Port 80 ──→ [Nginx Reverse Proxy]                         │
│                      │                                       │
│              ┌───────┴────────┐                             │
│              │                │                             │
│         ┌────▼─────────┐      │                             │
│         │ frontend-net │      │                             │
│         │    (bridge)  │      │                             │
│         └────┬─────────┘      │                             │
│              │                │                             │
│         [React App]───────────┘                             │
│              │                                               │
│         ┌────▼─────────┐                                    │
│         │ backend-net  │                                    │
│         │   (bridge)   │                                    │
│         └────┬─────────┘                                    │
│              │                                               │
│         [Node.js API]                                       │
│              │                                               │
│         ┌────▼──────────┐                                   │
│         │ database-net  │                                   │
│         │  (internal)   │ ← No internet access              │
│         └────┬──────────┘                                   │
│              │                                               │
│         ┌────▼────┐  ┌──────┐                              │
│         │   DB    │  │Redis │                              │
│         │(postgres)│  │      │                              │
│         └─────────┘  └──────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎓 Learning Points

### 1. **Bridge Networks** (Default)
- Containers on the same bridge can communicate
- Uses container names as hostnames (DNS)
- Isolated from other networks

### 2. **Internal Networks**
- `internal: true` blocks all external access
- No internet, no host access
- Perfect for databases and sensitive services

### 3. **Multi-Network Containers**
- A container can be on multiple networks
- Acts as a "bridge" between isolated segments
- Example: API connects frontend ↔ database

### 4. **Port Exposure**
- Only Nginx exposes ports to host
- All other services are internal
- Reduces attack surface

## 🔐 Security Advantages

| Service | Accessible From | Reason |
|---------|----------------|---------|
| Nginx | Internet | Entry point (reverse proxy) |
| Frontend | Nginx only | Not directly exposed |
| API | Frontend only | Protected from direct access |
| Database | API only | Maximum isolation |
| Redis | API only | Cache not exposed |

## 💡 Real-World Use Cases

### E-commerce Application
```
[Nginx] → frontend-net → [Store Frontend]
                              ↓ backend-net
                         [Payment API]
                              ↓ database-net
                    [Customer DB] [Order DB]
```

### Microservices Architecture
```
[API Gateway] → public-net → [Auth Service]
                                   ↓ service-net
                              [User Service]
                                   ↓ data-net
                         [User DB] [Session Cache]
```

### Development Environment
```
[Nginx] → frontend-net → [Dev Server]
                              ↓ backend-net
                         [API Server]
                              ↓ database-net
                    [Test DB] [Mock Services]
```

## 🛠️ Customization

### Add More Security Layers
```yaml
# Create additional networks for different concerns
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
  database-network:
    driver: bridge
    internal: true  # No internet access
  monitoring-network:
    driver: bridge  # For Prometheus, Grafana, etc.
  logging-network:
    driver: bridge  # For ELK stack, etc.
```

### Add Firewall Rules
```yaml
services:
  api:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## 📚 Related Topics

- [Docker Networking Basics](../networking/)
- [Docker Compose Guide](../compose/)
- [Security Best Practices](../security/)

## 🎯 Key Takeaways

### Network Isolation
1. **Layer your networks** - Separate concerns (frontend/backend/database)
2. **Use internal networks** - Block internet access for sensitive data
3. **Minimize exposure** - Only expose what's necessary
4. **Multi-network containers** - Connect isolated segments safely
5. **Test isolation** - Verify containers can't reach what they shouldn't

### Secrets Management
1. **Never hardcode secrets** - Use files, environment variables, or secret managers
2. **Keep secrets out of Git** - Add to .gitignore
3. **Use read-only mounts** - Secrets at `/run/secrets/` are read-only
4. **Rotate regularly** - Change passwords periodically
5. **Use secret managers in production** - Vault, AWS Secrets Manager, etc.

---

## 🔐 BONUS: Understanding Docker Secrets (Simple Explanation)

### What Are Secrets?

Secrets are **sensitive information** like:
- Passwords
- API keys
- Certificates
- Tokens

### Why NOT Use Environment Variables?

```yaml
# ❌ BAD: Visible in docker inspect
environment:
  - DB_PASSWORD=mypassword123

# ✅ GOOD: Stored securely in files
secrets:
  - db_password
```

**Problem with environment variables:**
```bash
# Anyone can see your passwords!
docker inspect api | grep PASSWORD
# Output: DB_PASSWORD=mypassword123  😱
```

### How Docker Secrets Work (For Kids! 🧒)

Imagine you have a secret note to pass to your friend:

#### Method 1: Environment Variables (BAD)
```
You: "Hey everyone! My secret is 'password123'!"
Everyone hears: 👂👂👂 😱
```

#### Method 2: Docker Secrets (GOOD)
```
You: Quietly slip a sealed envelope to your friend 📧
Only your friend can open and read it! ✅
```

### How Secrets Work in Docker Compose

#### 1. Create Secret File
```bash
# Create a text file with your password
echo "SuperSecret123!" > secrets/db_password.txt
```

#### 2. Define Secret in docker-compose.yml
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt  # Points to the file
```

#### 3. Use Secret in a Service
```yaml
services:
  db:
    secrets:
      - db_password  # Give this service access to the secret
```

#### 4. Access Secret in Container
```bash
# Inside the container, read the secret
cat /run/secrets/db_password
# Output: SuperSecret123!
```

### Real Example from Our docker-compose.yml

```yaml
# Define the secret
secrets:
  db_password:
    file: ./secrets/db_password.txt

# Use in PostgreSQL
services:
  db:
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password  # Tell Postgres to read from file
    secrets:
      - db_password  # Mount the secret
```

**What happens:**
1. Docker reads `./secrets/db_password.txt` from your computer
2. Mounts it inside container at `/run/secrets/db_password`
3. PostgreSQL reads the password from that file
4. Password is **never visible** in `docker inspect`!

### Secrets Location in Container

```bash
# Inside any container with secrets
ls -la /run/secrets/

# Output:
# -r--r--r-- 1 root root 20 Jan 19 10:00 db_password
# -r--r--r-- 1 root root 18 Jan 19 10:00 redis_password
# -r--r--r-- 1 root root 32 Jan 19 10:00 api_key

# Note: Files are read-only (r--r--r--)
```

### Testing Secrets

```bash
# Enter the API container
docker compose exec api sh

# Read the database password secret
cat /run/secrets/db_password
# Output: MySecureDbPassword123!

# Try to change it (you can't!)
echo "hacked" > /run/secrets/db_password
# Error: Read-only file system ✅
```

### Comparison Table

| Method | Visibility | Security | Use Case |
|--------|-----------|----------|----------|
| **Hardcoded** | ❌ Everyone sees in code | 🔴 Very Bad | Never! |
| **Environment Vars** | ⚠️ Visible in `docker inspect` | 🟡 Okay for dev | Development only |
| **Secrets Files** | ✅ Hidden, read-only | 🟢 Good | Docker Compose |
| **Secret Managers** | ✅ Encrypted, audited | 🟢🟢 Best | Production |

### Production Secret Managers

When you deploy to production, use these instead of files:

1. **AWS Secrets Manager**
   ```bash
   aws secretsmanager get-secret-value --secret-id db_password
   ```

2. **HashiCorp Vault**
   ```bash
   vault kv get secret/database/password
   ```

3. **Kubernetes Secrets**
   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: db-password
   data:
     password: BASE64_ENCODED_PASSWORD
   ```

4. **Azure Key Vault**
   ```bash
   az keyvault secret show --vault-name myVault --name db-password
   ```

---

**Remember**: 
- 🏰 Network isolation is like castle walls (protects from outside)
- 🔐 Secrets management is like a safe (protects your valuables)
- Together, they make your application **super secure**! 💪
