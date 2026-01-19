# Testing Guide - Network Isolation & Secrets

Step-by-step guide to test and understand the example.

## 🧪 Testing Network Isolation

### Test 1: Frontend CAN reach API
```bash
docker compose exec frontend wget -qO- http://api:4000/health
```
**Expected**: ✅ Success - Returns JSON health status

**Why it works**: Both are on `backend-network`

---

### Test 2: Frontend CANNOT reach Database
```bash
docker compose exec frontend ping -c 2 db
```
**Expected**: ❌ Failure - "ping: bad address 'db'"

**Why it fails**: Frontend is NOT on `database-network`

---

### Test 3: Nginx CANNOT reach Database
```bash
docker compose exec nginx ping -c 2 db
```
**Expected**: ❌ Failure

**Why it fails**: Nginx is only on `frontend-network`

---

### Test 4: API CAN reach Database
```bash
docker compose exec api ping -c 2 db
```
**Expected**: ✅ Success

**Why it works**: API is on `database-network`

---

### Test 5: Database CANNOT reach Internet
```bash
docker compose exec db ping -c 2 google.com
```
**Expected**: ❌ Failure

**Why it fails**: `database-network` has `internal: true` (no internet!)

---

## 🔐 Testing Secrets

### Test 6: List Secrets in Container
```bash
docker compose exec api ls -la /run/secrets/
```
**Expected**: ✅ Shows secret files with read-only permissions

**Output**:
```
-r--r--r-- 1 root root 20 Jan 19 10:00 db_password
-r--r--r-- 1 root root 18 Jan 19 10:00 redis_password
-r--r--r-- 1 root root 32 Jan 19 10:00 api_key
```

---

### Test 7: Read a Secret
```bash
docker compose exec api cat /run/secrets/db_password
```
**Expected**: ✅ Shows the password content

**Output**: `MySecureDbPassword123!`

---

### Test 8: Try to Modify a Secret (Should Fail!)
```bash
docker compose exec api sh -c 'echo "hacked" > /run/secrets/db_password'
```
**Expected**: ❌ Failure - "Read-only file system"

**Why it fails**: Secrets are mounted as read-only!

---

### Test 9: Secrets NOT Visible in Environment
```bash
docker compose exec api env | grep PASSWORD
```
**Expected**: ✅ Shows `DB_PASSWORD_FILE=/run/secrets/db_password` but NOT the actual password

**Why**: We're using secret files, not environment variables!

---

### Test 10: Check Secrets API Endpoint
```bash
curl http://localhost/api/secrets-demo
```
**Expected**: ✅ JSON showing mounted secrets

**Output**:
```json
{
  "message": "🔐 Docker Secrets Demo",
  "secretsDirectory": "/run/secrets",
  "secretsFound": ["api_key", "db_password", "redis_password"],
  "howToAccess": {
    "example": "cat /run/secrets/db_password",
    "description": "Secrets are mounted as read-only files"
  }
}
```

---

## 📊 Network Topology Test

### Test 11: View Network Configuration
```bash
docker network ls
docker network inspect backend-net
docker network inspect database-net
```

### Test 12: See Which Containers Are on Which Networks
```bash
docker inspect nodejs-api | grep -A 20 Networks
```

---

## 🔒 Security Verification

### Test 13: Verify Database is NOT Exposed
```bash
# Try to connect from your host machine
psql -h localhost -p 5432 -U apiuser -d appdb
```
**Expected**: ❌ Connection refused

**Why**: Port 5432 is NOT exposed in docker-compose.yml

---

### Test 14: Verify Only Nginx is Exposed
```bash
netstat -tuln | grep :80
```
**Expected**: ✅ Shows port 80 is listening

**Why**: Only nginx exposes port 80

---

## 🎯 Full Workflow Test

### Test 15: Complete Application Flow
```bash
# 1. Access homepage
curl http://localhost/

# 2. Check API health
curl http://localhost/api/health

# 3. Get users from database (via API)
curl http://localhost/api/users

# 4. Check network info
curl http://localhost/api/network-info
```

---

## 📝 Clean Up

```bash
# Stop and remove everything
docker compose down

# Remove volumes too
docker compose down -v

# Remove networks
docker network prune
```

---

## 🎓 What You Learned

After running these tests, you now understand:

✅ **Network Isolation**:
- How containers on different networks can't communicate
- How `internal: true` blocks internet access
- How multi-network containers act as bridges

✅ **Secrets Management**:
- Secrets are mounted as read-only files
- Secrets are NOT visible in environment variables
- Secrets are protected from modification
- How to read secrets in your application

✅ **Security Layers**:
- Network isolation protects services from unauthorized access
- Secrets protect credentials from exposure
- Together, they create defense in depth

---

## 🚀 Next Steps

1. Try adding a new service to a specific network
2. Create a new secret and use it in a service
3. Experiment with different network configurations
4. Learn about Docker Swarm secrets for production
