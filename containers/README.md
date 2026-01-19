# Docker Containers

Managing container lifecycle and operations.

## Container Lifecycle

```
Created → Running → Paused/Stopped → Removed
```

## Basic Container Commands

### Running Containers
```bash
# Run a container
docker run nginx

# Run in detached mode
docker run -d nginx

# Run with name
docker run --name my-nginx nginx

# Run with port mapping
docker run -p 8080:80 nginx

# Run with environment variables
docker run -e "ENV=production" myapp

# Run with volume mount
docker run -v /host/path:/container/path nginx

# Run interactively
docker run -it ubuntu bash
```

### Managing Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop container_name

# Start a stopped container
docker start container_name

# Restart a container
docker restart container_name

# Pause/Unpause a container
docker pause container_name
docker unpause container_name

# Remove a container
docker rm container_name

# Remove all stopped containers
docker container prune

# Force remove running container
docker rm -f container_name
```

### Container Information
```bash
# View container logs
docker logs container_name

# Follow logs in real-time
docker logs -f container_name

# View container processes
docker top container_name

# Inspect container details
docker inspect container_name

# View container resource usage
docker stats container_name
```

### Executing Commands in Containers
```bash
# Execute command in running container
docker exec container_name ls -la

# Interactive shell in running container
docker exec -it container_name bash

# Copy files to/from container
docker cp file.txt container_name:/path/
docker cp container_name:/path/file.txt ./
```

## Container Configuration Options

### Resource Limits
```bash
# Limit memory
docker run -m 512m nginx

# Limit CPU
docker run --cpus="1.5" nginx

# Set CPU shares
docker run --cpu-shares=512 nginx
```

### Networking
```bash
# Use specific network
docker run --network my-network nginx

# Expose all ports
docker run -P nginx

# Map multiple ports
docker run -p 8080:80 -p 8443:443 nginx
```

### Restart Policies
```bash
# Always restart
docker run --restart always nginx

# Restart on failure
docker run --restart on-failure nginx

# Restart unless manually stopped
docker run --restart unless-stopped nginx
```

## Container Best Practices

1. **One process per container** - Follow single responsibility
2. **Use read-only filesystem** - Add `--read-only` flag when possible
3. **Don't run as root** - Use `USER` instruction in Dockerfile
4. **Set resource limits** - Prevent resource exhaustion
5. **Use health checks** - Monitor container health
6. **Clean up regularly** - Remove unused containers

## Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

## Next Steps

- Explore [networking/](../networking/) for container communication
- Learn about [volumes/](../volumes/) for data persistence
- Check [compose/](../compose/) for multi-container applications
