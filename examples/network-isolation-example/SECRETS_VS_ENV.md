# Secrets vs Environment Variables 🔐 vs 🌍

A beginner-friendly guide to understanding the difference and when to use each.

## 🎯 Quick Answer

| Feature | Environment Variables | Docker Secrets |
|---------|---------------------|----------------|
| **Security** | 🟡 Low | 🟢 High |
| **Visibility** | ❌ Visible in `docker inspect` | ✅ Hidden from inspect |
| **Storage** | In memory (visible) | Files (mounted read-only) |
| **Easy to Change** | ❌ Anyone can see/steal | ✅ Protected |
| **Best For** | Non-sensitive config | Passwords, API keys |

---

## 🌍 Environment Variables

### What Are They?

Environment variables are **settings stored in memory** that your application can read.

### How to Set Them

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - NODE_ENV=production
      - API_URL=https://api.example.com
      - DB_PASSWORD=mypassword123  # ❌ BAD! Visible to everyone!
```

### How to Read Them (In Code)

```javascript
// Node.js
const dbPassword = process.env.DB_PASSWORD;
console.log(dbPassword); // "mypassword123"
```

### The Problem - Anyone Can See Them! 😱

```bash
# Run this command to see ALL environment variables
docker inspect api | grep -A 10 Env

# Output shows your password in plain text!
"Env": [
  "NODE_ENV=production",
  "DB_PASSWORD=mypassword123",  # 🚨 EXPOSED!
  ...
]
```

**Even worse:**
```bash
# Enter the container and see all variables
docker exec api env

# Output:
DB_PASSWORD=mypassword123  # 😱 Anyone can see this!
```

---

## 🔐 Docker Secrets

### What Are They?

Secrets are **sensitive data stored as files** that Docker mounts into your container as **read-only**.

### How to Set Them

**Step 1: Create a secret file**
```bash
echo "mypassword123" > secrets/db_password.txt
```

**Step 2: Define in docker-compose.yml**
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  api:
    secrets:
      - db_password  # Mount the secret
```

**Step 3: Docker mounts it at `/run/secrets/db_password`**

### How to Read Them (In Code)

```javascript
// Node.js
const fs = require('fs');

// Read from the secret file
const dbPassword = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();
console.log(dbPassword); // "mypassword123"
```

### Why It's Better - Hidden and Protected! 🛡️

```bash
# Try to inspect - NO PASSWORD SHOWN!
docker inspect api | grep PASSWORD

# Output:
"DB_PASSWORD_FILE=/run/secrets/db_password"  # ✅ Just shows the FILE path, not the password!
```

**Secrets are read-only:**
```bash
# Try to change the secret (you can't!)
docker exec api sh -c 'echo "hacked" > /run/secrets/db_password'
# Error: Read-only file system ✅
```

---

## 📊 Detailed Comparison

### 1. Visibility

#### Environment Variables (❌ Exposed)
```bash
$ docker exec api env
DB_PASSWORD=mypassword123  # 🚨 Visible!
API_KEY=secret_key_789     # 🚨 Visible!
```

#### Secrets (✅ Hidden)
```bash
$ docker exec api env
DB_PASSWORD_FILE=/run/secrets/db_password  # ✅ Only shows path
# Actual password is in the file, not visible in env!
```

---

### 2. Storage Location

#### Environment Variables
- Stored in **container's memory**
- Visible in process list
- Can be seen in logs accidentally

#### Secrets
- Stored as **files in `/run/secrets/`**
- Mounted as **tmpfs** (in-memory filesystem)
- **Read-only** - can't be modified
- Not visible in environment variables

---

### 3. How They Look

#### Environment Variables in docker-compose.yml
```yaml
services:
  api:
    environment:
      - DB_HOST=postgres
      - DB_PASSWORD=mypassword  # ❌ Password in plain text!
```

**Problem**: If you commit this to Git, everyone sees the password!

#### Secrets in docker-compose.yml
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt  # ✅ Actual password is in a file

services:
  api:
    secrets:
      - db_password  # ✅ Just reference the secret name
```

**Better**: The password file is in `.gitignore`, never committed!

---

## 🎓 Real-World Examples

### ❌ BAD: Using Environment Variables for Passwords

```yaml
# docker-compose.yml
services:
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD=supersecret123  # 🚨 VISIBLE TO EVERYONE!
```

**What happens:**
1. Anyone with access to the server can run `docker inspect db`
2. They see: `POSTGRES_PASSWORD=supersecret123`
3. Your database is compromised! 😱

---

### ✅ GOOD: Using Secrets for Passwords

```yaml
# docker-compose.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  db:
    image: postgres
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password  # ✅ Uses secret file
    secrets:
      - db_password
```

**What happens:**
1. Password is stored in `secrets/db_password.txt`
2. This file is in `.gitignore` (not in Git)
3. Docker mounts it as read-only at `/run/secrets/db_password`
4. PostgreSQL reads from the file
5. No one can see the password in `docker inspect`! ✅

---

## 🤔 When to Use Each

### Use Environment Variables For:

✅ **Non-sensitive configuration**
- Server URLs (`API_URL=https://api.example.com`)
- Port numbers (`PORT=3000`)
- Environment type (`NODE_ENV=production`)
- Feature flags (`ENABLE_LOGGING=true`)
- Non-secret settings (`MAX_CONNECTIONS=100`)

```yaml
services:
  api:
    environment:
      - NODE_ENV=production     # ✅ OK - Not sensitive
      - API_URL=https://api.com # ✅ OK - Public info
      - PORT=3000               # ✅ OK - Not secret
```

---

### Use Secrets For:

🔐 **Sensitive credentials**
- Passwords
- API keys
- Private keys / Certificates
- Tokens
- Any data that should be protected

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt

services:
  api:
    secrets:
      - db_password  # ✅ GOOD - Sensitive!
      - api_key      # ✅ GOOD - Sensitive!
```

---

## 🧪 Test It Yourself

### Experiment 1: See Environment Variables

```bash
# Start your containers
docker compose up -d

# Enter the API container
docker exec -it api sh

# See ALL environment variables
env

# You'll see things like:
# NODE_ENV=production
# PORT=3000
# DB_PASSWORD_FILE=/run/secrets/db_password  # ← Note: shows FILE path, not password!
```

---

### Experiment 2: Access Secrets

```bash
# Enter the container
docker exec -it api sh

# List secret files
ls -la /run/secrets/

# Output:
# -r--r--r-- 1 root root 20 Jan 19 10:00 db_password
# -r--r--r-- 1 root root 32 Jan 19 10:00 api_key
# Note: "r--r--r--" means READ-ONLY!

# Read a secret
cat /run/secrets/db_password
# Output: MySecureDbPassword123!

# Try to modify (you can't!)
echo "hacked" > /run/secrets/db_password
# Error: Read-only file system ✅
```

---

### Experiment 3: Compare Visibility

```bash
# Compare environment variables vs secrets
docker inspect api | grep -A 10 environment
docker inspect api | grep -A 10 Password

# Environment variables: VISIBLE in output
# Secrets: Only see the FILE PATH, not the actual password
```

---

## 📝 Summary Table

| What You Want | Use This |
|--------------|----------|
| Database password | 🔐 Secret |
| API key | 🔐 Secret |
| Private SSL certificate | 🔐 Secret |
| JWT secret | 🔐 Secret |
| Encryption key | 🔐 Secret |
| Server URL | 🌍 Environment variable |
| Port number | 🌍 Environment variable |
| App name | 🌍 Environment variable |
| Debug mode (true/false) | 🌍 Environment variable |
| Log level | 🌍 Environment variable |

---

## 🎯 Key Takeaways

### Environment Variables:
- ✅ Easy to use
- ✅ Good for non-sensitive config
- ❌ Visible to anyone with container access
- ❌ Can leak in logs
- ❌ Not encrypted

### Docker Secrets:
- ✅ Hidden from `docker inspect`
- ✅ Read-only (can't be modified)
- ✅ Protected from accidental exposure
- ✅ Better for passwords and keys
- ⚠️  Slightly more complex to set up

---

## 💡 Pro Tips

1. **Never put passwords in environment variables**
   - Use secrets instead!

2. **Add secrets folder to .gitignore**
   ```
   secrets/
   *.txt
   ```

3. **Use environment variables for configs**
   - But secrets for credentials!

4. **In production, use external secret managers**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault

---

## 🚀 Next Steps

Try both methods in the example:

1. Add an environment variable for `NODE_ENV`
2. Add a secret for `JWT_SECRET`
3. Compare how you access them in code
4. Run `docker inspect` to see the difference!

**Remember**: 
- 🌍 Environment variables = **Configuration** (not secret)
- 🔐 Secrets = **Credentials** (private and protected)
