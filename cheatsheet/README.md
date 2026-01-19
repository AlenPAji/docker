# Docker Command Cheatsheet

Quick reference for commonly used Docker commands.

## Container Lifecycle

```bash
# Run container
docker run image_name
docker run -d image_name                    # Detached mode
docker run -it image_name                   # Interactive with TTY
docker run --name my-container image_name   # With custom name
docker run --rm image_name                  # Remove after exit

# Start/Stop containers
docker start container_name
docker stop container_name
docker restart container_name
docker pause container_name
docker unpause container_name

# Remove containers
docker rm container_name
docker rm -f container_name                 # Force remove running container
docker container prune                      # Remove all stopped containers
```

## Image Management

```bash
# Build images
docker build -t image_name .
docker build -t image_name:tag .
docker build --no-cache -t image_name .

# List images
docker images
docker images -a                            # Include intermediate

# Remove images
docker rmi image_name
docker rmi -f image_name                    # Force remove
docker image prune                          # Remove dangling images
docker image prune -a                       # Remove all unused images

# Pull/Push images
docker pull image_name
docker pull image_name:tag
docker push username/image_name:tag

# Tag images
docker tag source_image:tag target_image:tag

# Image history
docker history image_name
```

## Container Information

```bash
# List containers
docker ps                                   # Running containers
docker ps -a                                # All containers
docker ps -q                                # Only container IDs

# Logs
docker logs container_name
docker logs -f container_name               # Follow logs
docker logs --tail 100 container_name       # Last 100 lines
docker logs -t container_name               # With timestamps

# Inspect
docker inspect container_name
docker inspect image_name
docker inspect --format='{{.State.Status}}' container_name

# Stats
docker stats                                # All containers
docker stats container_name                 # Specific container

# Processes
docker top container_name
```

## Executing Commands

```bash
# Execute command
docker exec container_name command
docker exec -it container_name bash         # Interactive shell
docker exec -u user container_name command  # As specific user

# Copy files
docker cp file.txt container_name:/path/
docker cp container_name:/path/file.txt ./
```

## Port Mapping

```bash
# Map ports
docker run -p 8080:80 image_name           # Host:Container
docker run -p 127.0.0.1:8080:80 image_name # Specific interface
docker run -P image_name                   # Map all exposed ports

# Check ports
docker port container_name
```

## Volume Management

```bash
# Create volumes
docker volume create volume_name

# List volumes
docker volume ls

# Inspect volume
docker volume inspect volume_name

# Remove volumes
docker volume rm volume_name
docker volume prune                        # Remove unused volumes

# Use volumes
docker run -v volume_name:/path image_name
docker run -v /host/path:/container/path image_name  # Bind mount
docker run -v /container/path:ro image_name          # Read-only

# Mount syntax (preferred)
docker run --mount source=vol,target=/path image_name
docker run --mount type=bind,source=/host,target=/container image_name
```

## Network Management

```bash
# Create network
docker network create network_name
docker network create --driver bridge network_name

# List networks
docker network ls

# Inspect network
docker network inspect network_name

# Connect/Disconnect
docker network connect network_name container_name
docker network disconnect network_name container_name

# Remove network
docker network rm network_name
docker network prune                       # Remove unused networks

# Use network
docker run --network network_name image_name
docker run --network host image_name       # Use host network
```

## Docker Compose

```bash
# Start services
docker compose up
docker compose up -d                       # Detached
docker compose up --build                  # Build images first
docker compose up service_name             # Specific service

# Stop services
docker compose down
docker compose down -v                     # Remove volumes
docker compose stop
docker compose stop service_name

# View services
docker compose ps
docker compose ps -a

# Logs
docker compose logs
docker compose logs -f
docker compose logs service_name

# Execute command
docker compose exec service_name command
docker compose exec service_name bash

# Build
docker compose build
docker compose build --no-cache

# Scale services
docker compose up -d --scale service=3

# Restart
docker compose restart
docker compose restart service_name

# Validate
docker compose config

# Pull images
docker compose pull
```

## Environment & Configuration

```bash
# Set environment variables
docker run -e VAR=value image_name
docker run -e VAR1=val1 -e VAR2=val2 image_name
docker run --env-file .env image_name

# Set working directory
docker run -w /app image_name

# Set user
docker run -u 1000:1000 image_name
docker run --user username image_name
```

## Resource Limits

```bash
# Memory limits
docker run -m 512m image_name              # Max memory
docker run -m 512m --memory-swap 1g image_name

# CPU limits
docker run --cpus="1.5" image_name         # Max CPUs
docker run --cpu-shares=512 image_name

# PID limit
docker run --pids-limit 100 image_name
```

## Restart Policies

```bash
docker run --restart no image_name         # Don't restart (default)
docker run --restart always image_name     # Always restart
docker run --restart unless-stopped image_name
docker run --restart on-failure image_name
docker run --restart on-failure:5 image_name  # Max 5 retries
```

## System Management

```bash
# System info
docker info
docker version

# Disk usage
docker system df
docker system df -v

# Clean up
docker system prune                        # Remove unused data
docker system prune -a                     # Remove all unused
docker system prune -a --volumes          # Include volumes

# Events
docker events
docker events --filter 'event=stop'
```

## Registry & Authentication

```bash
# Login
docker login
docker login registry.example.com
docker login -u username -p password

# Logout
docker logout
docker logout registry.example.com

# Search
docker search image_name
docker search --filter stars=100 image_name
```

## Dockerfile Instructions

```dockerfile
# Base image
FROM ubuntu:22.04

# Metadata
LABEL maintainer="you@example.com"
LABEL version="1.0"

# Environment variables
ENV NODE_ENV=production
ENV PATH="/app/bin:${PATH}"

# Working directory
WORKDIR /app

# Copy files
COPY . .
COPY --chown=user:group . .
ADD archive.tar.gz /app                   # Also extracts archives

# Run commands
RUN apt-get update && apt-get install -y package
RUN npm install

# Expose ports
EXPOSE 80
EXPOSE 443

# Volumes
VOLUME /data

# User
USER appuser

# Default command
CMD ["node", "server.js"]
CMD node server.js                        # Shell form

# Entrypoint
ENTRYPOINT ["executable"]
ENTRYPOINT executable                     # Shell form

# Health check
HEALTHCHECK CMD curl -f http://localhost/ || exit 1
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/

# Arguments
ARG VERSION=latest
ARG BUILD_DATE

# Multi-stage
FROM node:18 AS builder
# ... build steps ...
FROM node:18-alpine
COPY --from=builder /app/dist ./dist
```

## Common Patterns

```bash
# Remove all stopped containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Stop all running containers
docker stop $(docker ps -q)

# Get container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Get container status
docker inspect -f '{{.State.Status}}' container_name

# Follow logs of multiple containers
docker logs -f $(docker ps -q)

# Save/Load images
docker save image_name > image.tar
docker load < image.tar

# Export/Import containers
docker export container_name > container.tar
docker import container.tar new_image_name
```

## Filtering

```bash
# Filter by status
docker ps --filter "status=exited"
docker ps --filter "status=running"

# Filter by name
docker ps --filter "name=my-app"

# Filter by label
docker ps --filter "label=env=production"

# Filter images by dangling
docker images --filter "dangling=true"

# Multiple filters
docker ps --filter "status=running" --filter "name=web"
```

## Format Output

```bash
# JSON format
docker inspect --format='{{json .}}' container_name

# Specific field
docker inspect --format='{{.State.Status}}' container_name
docker inspect --format='{{.NetworkSettings.IPAddress}}' container_name

# Table format
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}"
```

## Quick Tips

```bash
# Clean everything (DANGEROUS!)
docker stop $(docker ps -q) && docker system prune -af --volumes

# Check last created container
docker ps -l

# Check container exit code
docker inspect --format='{{.State.ExitCode}}' container_name

# Run one-off command
docker run --rm image_name command

# Update container restart policy
docker update --restart unless-stopped container_name

# Rename container
docker rename old_name new_name
```

## Related Topics

- See [basics/](../basics/) for fundamental concepts
- Check [compose/](../compose/) for Compose-specific commands
- Explore [troubleshooting/](../troubleshooting/) for debugging commands

---

**Print this cheatsheet** or keep it handy for quick reference!
