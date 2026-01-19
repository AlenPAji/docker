# Docker Volumes

Data persistence and sharing between containers and host.

## Volume Types

### 1. Named Volumes
- Managed by Docker
- Best for production
- Stored in Docker's storage directory

### 2. Bind Mounts
- Map host directory to container
- Direct access to host filesystem
- Good for development

### 3. tmpfs Mounts
- Stored in host memory
- Temporary, non-persistent
- Good for sensitive data

## Volume Commands

```bash
# Create a volume
docker volume create my-volume

# List volumes
docker volume ls

# Inspect volume
docker volume inspect my-volume

# Remove volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune

# Remove specific unused volumes
docker volume prune --filter "label=environment=dev"
```

## Using Volumes

### Named Volumes
```bash
# Create and use named volume
docker run -v my-data:/app/data nginx

# Explicit --mount syntax (recommended)
docker run --mount source=my-data,target=/app/data nginx

# Read-only volume
docker run -v my-data:/app/data:ro nginx
```

### Bind Mounts
```bash
# Bind mount host directory
docker run -v /host/path:/container/path nginx

# Using --mount (more explicit)
docker run --mount type=bind,source=/host/path,target=/container/path nginx

# Read-only bind mount
docker run -v /host/path:/container/path:ro nginx

# Current directory bind mount
docker run -v $(pwd):/app nginx
```

### tmpfs Mounts
```bash
# Create tmpfs mount
docker run --mount type=tmpfs,target=/app/temp nginx

# With size limit
docker run --tmpfs /app/temp:rw,size=100m nginx
```

## Volume Examples

### Database Persistence
```bash
# PostgreSQL with named volume
docker run -d \
  --name postgres-db \
  -v postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Data persists even after container removal
docker rm -f postgres-db
docker run -d --name postgres-db -v postgres-data:/var/lib/postgresql/data postgres:15
# Data is still there!
```

### Development with Bind Mounts
```bash
# Live code reloading for development
docker run -d \
  --name dev-app \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/package.json:/app/package.json \
  -p 3000:3000 \
  node:18 \
  npm run dev
```

### Sharing Data Between Containers
```bash
# Create shared volume
docker volume create shared-data

# Multiple containers using same volume
docker run -d --name writer -v shared-data:/data alpine sh -c "echo 'Hello' > /data/message.txt"
docker run --name reader -v shared-data:/data alpine cat /data/message.txt
```

## Volume Drivers

### Local Driver (Default)
```bash
docker volume create --driver local my-volume
```

### Third-Party Drivers
- NFS volumes
- Cloud storage (AWS EFS, Azure Files)
- Distributed storage (GlusterFS, Ceph)

```bash
# NFS volume example
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/nfs \
  nfs-volume
```

## Backup and Restore

### Backup Volume
```bash
# Backup volume to tar file
docker run --rm \
  -v my-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/my-data-backup.tar.gz -C /data .
```

### Restore Volume
```bash
# Restore from backup
docker run --rm \
  -v my-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/my-data-backup.tar.gz"
```

### Copy Between Volumes
```bash
# Copy data from one volume to another
docker run --rm \
  -v old-volume:/from \
  -v new-volume:/to \
  alpine sh -c "cp -r /from/* /to/"
```

## Volume Location

```bash
# Find volume location on host
docker volume inspect my-volume | grep Mountpoint

# Typical location (Linux)
/var/lib/docker/volumes/my-volume/_data
```

## Best Practices

1. **Use named volumes for production** - Better than bind mounts
2. **Backup important data** - Regular backups of volume data
3. **Use .dockerignore** - Exclude unnecessary files from bind mounts
4. **Set proper permissions** - Avoid permission issues
5. **Clean up unused volumes** - Prevent disk space issues
6. **Use volume labels** - Organize and manage volumes
7. **Prefer volumes over containers** - Don't store data in container layer

## Volume Labels

```bash
# Create volume with labels
docker volume create --label environment=production --label app=web my-volume

# Filter volumes by label
docker volume ls --filter label=environment=production
```

## Troubleshooting

```bash
# Check volume usage
docker system df -v

# Inspect volume details
docker volume inspect my-volume

# Check container volume mounts
docker inspect -f '{{json .Mounts}}' container_name | jq

# Verify data in volume
docker run --rm -v my-volume:/data alpine ls -la /data
```

## Related Topics

- See [compose/](../compose/) for volumes in Docker Compose
- Check [examples/](../examples/) for practical volume usage
- Explore [security/](../security/) for volume security considerations
