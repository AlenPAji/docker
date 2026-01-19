# Docker Troubleshooting

Common issues, debugging techniques, and solutions.

## Common Issues

### 1. Container Won't Start

**Symptoms:**
- Container exits immediately
- Status shows "Exited (1)"

**Diagnosis:**
```bash
# Check logs
docker logs container_name

# Check exit code
docker inspect container_name --format='{{.State.ExitCode}}'

# View last commands
docker ps -a
```

**Common Causes:**
- Application error in CMD/ENTRYPOINT
- Missing dependencies
- Configuration error
- Port already in use

**Solutions:**
```bash
# Run interactively to debug
docker run -it image_name /bin/sh

# Override entrypoint
docker run -it --entrypoint /bin/sh image_name

# Check port conflicts
sudo netstat -tulpn | grep PORT_NUMBER
```

### 2. "Port Already in Use" Error

**Error Message:**
```
Error: bind: address already in use
```

**Solutions:**
```bash
# Find process using port
sudo lsof -i :PORT_NUMBER
sudo netstat -tulpn | grep PORT_NUMBER

# Kill process
sudo kill -9 PID

# Use different port
docker run -p 8081:80 nginx

# Stop conflicting container
docker ps | grep PORT_NUMBER
docker stop container_id
```

### 3. Permission Denied Errors

**Symptoms:**
- Cannot write to mounted volumes
- Permission errors in logs

**Solutions:**
```bash
# Check file permissions
ls -la /path/to/volume

# Fix permissions on host
sudo chown -R $(id -u):$(id -g) /path/to/volume

# Run container as specific user
docker run --user $(id -u):$(id -g) image_name

# In Dockerfile
USER 1000:1000
```

### 4. Image Build Failures

**Common Issues:**

**Cannot find package:**
```dockerfile
# Update package index
RUN apt-get update && apt-get install -y package_name
```

**Cache issues:**
```bash
# Build without cache
docker build --no-cache -t image_name .

# Clean build cache
docker builder prune
```

**Network issues during build:**
```bash
# Use different DNS
docker build --network=host -t image_name .

# Set DNS in daemon.json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### 5. Container Network Issues

**Cannot reach other containers:**
```bash
# Check network
docker network ls
docker network inspect network_name

# Verify container is on network
docker inspect container_name | grep -A 10 Networks

# Connect to network
docker network connect network_name container_name

# Ping other container
docker exec container1 ping container2
```

**No internet access:**
```bash
# Check DNS resolution
docker exec container_name ping 8.8.8.8
docker exec container_name ping google.com

# Set DNS servers
docker run --dns 8.8.8.8 --dns 8.8.4.4 image_name

# Or in daemon.json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

### 6. Volume/Data Issues

**Data not persisting:**
```bash
# Check volume
docker volume ls
docker volume inspect volume_name

# Verify mount
docker inspect container_name | grep -A 10 Mounts

# Ensure volume is created
docker volume create volume_name
docker run -v volume_name:/data image_name
```

**Cannot access bind mount:**
```bash
# Check SELinux context (RHEL/CentOS)
ls -Z /path/to/directory

# Fix SELinux context
sudo chcon -Rt svirt_sandbox_file_t /path/to/directory

# Or use :z or :Z flag
docker run -v /path:/container/path:z image_name
```

### 7. "No space left on device"

**Diagnosis:**
```bash
# Check disk usage
docker system df

# Detailed view
docker system df -v
```

**Solutions:**
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes

# Clean build cache
docker builder prune -a
```

### 8. Container Running but Not Responding

**Diagnosis:**
```bash
# Check if process is running
docker exec container_name ps aux

# Check resource usage
docker stats container_name

# Check logs
docker logs -f container_name

# Inspect container
docker inspect container_name
```

**Solutions:**
```bash
# Restart container
docker restart container_name

# Check health status
docker inspect --format='{{.State.Health.Status}}' container_name

# Enter container
docker exec -it container_name /bin/sh
```

### 9. Docker Compose Issues

**Services not communicating:**
```bash
# Check network
docker compose ps
docker network ls

# Verify DNS resolution
docker compose exec service1 ping service2

# Recreate network
docker compose down
docker compose up -d
```

**"Service X depends on Y which is undefined":**
```yaml
# Ensure service is defined
services:
  x:
    depends_on:
      - y  # Make sure 'y' service exists
  y:
    image: some_image
```

**Environment variables not loading:**
```bash
# Check .env file exists
ls -la .env

# Validate compose file
docker compose config

# Explicitly specify env file
docker compose --env-file .env.production up
```

### 10. Performance Issues

**Slow container:**
```bash
# Check resource usage
docker stats

# Set resource limits
docker run -m 512m --cpus="1.0" image_name

# Check I/O
docker exec container_name iostat
```

**Slow build:**
```bash
# Use buildkit
DOCKER_BUILDKIT=1 docker build .

# Optimize Dockerfile layer order
# Put frequently changing code last

# Use .dockerignore
# Exclude unnecessary files
```

## Debugging Techniques

### Inspect Everything
```bash
# Container details
docker inspect container_name

# Image details
docker inspect image_name

# Volume details
docker volume inspect volume_name

# Network details
docker network inspect network_name
```

### Interactive Debugging
```bash
# Run shell in container
docker exec -it container_name /bin/sh
docker exec -it container_name /bin/bash

# Run new container interactively
docker run -it --entrypoint /bin/sh image_name

# Debug specific service in compose
docker compose run --rm service_name /bin/sh
```

### Log Analysis
```bash
# Follow logs
docker logs -f container_name

# Logs with timestamps
docker logs -t container_name

# Last N lines
docker logs --tail 100 container_name

# Since specific time
docker logs --since 2024-01-01T00:00:00 container_name

# Compose logs
docker compose logs -f service_name
```

### Network Debugging
```bash
# Install network tools in container
docker exec container_name apk add curl wget netcat-openbsd

# Test connectivity
docker exec container_name curl http://service:port
docker exec container_name nc -zv service port

# Check DNS
docker exec container_name nslookup service_name
docker exec container_name cat /etc/resolv.conf
```

### Process Debugging
```bash
# List processes
docker exec container_name ps aux

# Check resource usage
docker stats container_name

# Top processes
docker top container_name
```

## Docker Daemon Issues

### Docker daemon won't start
```bash
# Check daemon status
sudo systemctl status docker

# View daemon logs
sudo journalctl -u docker

# Restart daemon
sudo systemctl restart docker

# Check daemon configuration
cat /etc/docker/daemon.json
```

### Reset Docker
```bash
# Stop Docker
sudo systemctl stop docker

# Remove Docker data (WARNING: deletes everything)
sudo rm -rf /var/lib/docker

# Start Docker
sudo systemctl start docker
```

## Useful Commands

```bash
# System information
docker system info

# Disk usage
docker system df

# Events in real-time
docker events

# Check Docker version
docker version
docker compose version

# List everything
docker ps -a
docker images -a
docker volume ls
docker network ls
```

## Best Practices for Troubleshooting

1. **Check logs first** - Most issues show up in logs
2. **Use docker inspect** - Get detailed information
3. **Isolate the problem** - Test components individually
4. **Check resource usage** - Memory/CPU limits
5. **Verify networking** - DNS resolution and connectivity
6. **Review recent changes** - What changed before the issue?
7. **Clean up regularly** - Prevent disk space issues
8. **Use health checks** - Monitor container health
9. **Document solutions** - Keep track of fixes
10. **Test in isolation** - Reproduce in minimal setup

## Getting Help

### Official Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Forums](https://forums.docker.com/)
- [Docker Community Slack](https://dockercommunity.slack.com/)

### Debug Information to Provide
When asking for help, include:
- Docker version: `docker version`
- System info: `docker system info`
- Container logs: `docker logs container_name`
- Compose file (if applicable)
- Dockerfile (if applicable)
- Error messages
- Steps to reproduce

## Related Topics

- See [basics/](../basics/) for fundamental concepts
- Check [networking/](../networking/) for network issues
- Explore [security/](../security/) for security-related problems
