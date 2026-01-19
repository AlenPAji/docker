# Docker Security

Best practices and configurations for securing Docker containers and environments.

## Security Principles

1. **Least Privilege** - Run with minimum necessary permissions
2. **Defense in Depth** - Multiple layers of security
3. **Immutability** - Treat containers as immutable
4. **Isolation** - Separate concerns and environments
5. **Secrets Management** - Never hardcode sensitive data

## Image Security

### Use Trusted Base Images
```dockerfile
# ✅ Good - Official image with specific version
FROM node:18-alpine

# ❌ Bad - Unknown source and latest tag
FROM random-user/node:latest
```

### Scan Images for Vulnerabilities
```bash
# Docker Scout (built-in)
docker scout cves image_name

# Trivy
trivy image image_name

# Snyk
snyk container test image_name

# Check for outdated images
docker scout quickview
```

### Minimize Image Size
```dockerfile
# Multi-stage build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
```

### Don't Include Secrets in Images
```dockerfile
# ❌ Bad - Secrets in build
RUN echo "API_KEY=secret123" > config.env

# ✅ Good - Use build args and external secrets
ARG NPM_TOKEN
RUN npm install && rm -f .npmrc
```

## Container Security

### Run as Non-Root User
```dockerfile
# Create and use non-root user
FROM node:18-alpine
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
USER appuser
WORKDIR /home/appuser/app
```

```bash
# Verify user
docker exec container_name whoami
```

### Use Read-Only Filesystem
```bash
# Make root filesystem read-only
docker run --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  nginx
```

```yaml
# Docker Compose
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### Drop Capabilities
```bash
# Drop all capabilities and add only what's needed
docker run --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  nginx
```

```yaml
# Docker Compose
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Limit Resources
```bash
# Prevent DoS attacks
docker run \
  --memory="256m" \
  --memory-swap="256m" \
  --cpus="0.5" \
  --pids-limit=100 \
  nginx
```

### Disable Inter-Container Communication
```bash
# Create network with ICC disabled
docker network create --driver bridge \
  --opt com.docker.network.bridge.enable_icc=false \
  secure-network
```

## Secrets Management

### Docker Secrets (Swarm)
```bash
# Create secret
echo "my-secret-password" | docker secret create db_password -

# Use in service
docker service create \
  --name db \
  --secret db_password \
  postgres
```

### Environment Variables (Not Recommended for Secrets)
```bash
# ❌ Avoid for sensitive data - visible in inspect
docker run -e DATABASE_PASSWORD=secret app

# ✅ Better - Use secrets management tools
docker run --env-file .env app
```

### External Secrets Management
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Kubernetes Secrets

### .dockerignore Sensitive Files
```
# .dockerignore
.env
.env.local
*.key
*.pem
secrets/
.git
.gitignore
```

## Network Security

### Use Custom Networks
```bash
# Isolate services
docker network create frontend
docker network create backend

docker run --network frontend web
docker run --network backend db
```

### Internal Networks
```bash
# No external access
docker network create --internal db-network
```

### Encrypt Traffic
```yaml
services:
  app:
    environment:
      - TLS_ENABLED=true
    volumes:
      - ./certs:/certs:ro
```

### Firewall Rules
```bash
# Limit Docker daemon exposure
# Only bind to localhost
dockerd -H unix:///var/run/docker.sock -H tcp://127.0.0.1:2375
```

## Host Security

### Secure Docker Daemon
```bash
# Use TLS for Docker daemon
dockerd \
  --tlsverify \
  --tlscacert=ca.pem \
  --tlscert=server-cert.pem \
  --tlskey=server-key.pem \
  -H=0.0.0.0:2376
```

### Limit Docker Daemon Access
```bash
# Only allow specific users
sudo usermod -aG docker username

# Audit Docker daemon
docker system info | grep Security
```

### Enable Content Trust
```bash
# Verify image signatures
export DOCKER_CONTENT_TRUST=1
docker pull nginx
```

### Use Security Profiles

#### AppArmor
```bash
# Use AppArmor profile
docker run --security-opt apparmor=docker-default nginx
```

#### SELinux
```bash
# Use SELinux labels
docker run --security-opt label=level:s0:c100,c200 nginx
```

#### Seccomp
```bash
# Custom seccomp profile
docker run --security-opt seccomp=seccomp-profile.json nginx
```

## Monitoring and Logging

### Enable Logging
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Runtime Security Monitoring
```bash
# Falco - Runtime security
# Monitors system calls for suspicious activity

# Docker Bench Security
docker run -it --net host --pid host --userns host --cap-add audit_control \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc:/etc \
  --label docker_bench_security \
  docker/docker-bench-security
```

## Security Scanning in CI/CD

```yaml
# GitHub Actions example
name: Security Scan
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build image
        run: docker build -t myapp .
      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp
          format: 'sarif'
          output: 'trivy-results.sarif'
```

## Security Checklist

### Image
- [ ] Use official base images
- [ ] Pin specific versions (no `latest`)
- [ ] Scan for vulnerabilities
- [ ] Use multi-stage builds
- [ ] Run as non-root user
- [ ] No secrets in layers
- [ ] Minimal image size

### Container
- [ ] Resource limits set
- [ ] Read-only filesystem where possible
- [ ] Drop unnecessary capabilities
- [ ] Use security profiles (AppArmor/SELinux)
- [ ] Health checks configured
- [ ] Proper restart policy

### Network
- [ ] Custom networks used
- [ ] Network isolation implemented
- [ ] TLS encryption enabled
- [ ] Only necessary ports exposed
- [ ] Firewall rules configured

### Secrets
- [ ] No hardcoded secrets
- [ ] Secrets management solution used
- [ ] .dockerignore configured
- [ ] Environment variables secured
- [ ] Secrets rotated regularly

### Host
- [ ] Docker daemon secured
- [ ] TLS authentication enabled
- [ ] Content trust enabled
- [ ] Regular updates applied
- [ ] Security monitoring active

## Tools and Resources

### Security Scanning Tools
- **Trivy** - Vulnerability scanner
- **Snyk** - Container security
- **Clair** - Static analysis
- **Docker Scout** - Built-in scanning
- **Aqua Security** - Complete platform

### Compliance
- **Docker Bench Security** - CIS Docker Benchmark
- **OpenSCAP** - Security compliance
- **InSpec** - Compliance framework

### Monitoring
- **Falco** - Runtime security
- **Sysdig** - Container monitoring
- **Prometheus + Grafana** - Metrics

## Best Practices Summary

1. **Never run containers as root**
2. **Scan images regularly**
3. **Use minimal base images**
4. **Keep images updated**
5. **Implement network isolation**
6. **Use secrets management**
7. **Enable logging and monitoring**
8. **Apply resource limits**
9. **Use read-only filesystems**
10. **Regular security audits**

## Related Topics

- See [examples/](../examples/) for secure configurations
- Check [images/](../images/) for secure image building
- Explore [networking/](../networking/) for network security
