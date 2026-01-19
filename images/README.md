# Docker Images

Learn how to create, manage, and optimize Docker images.

## Building Images

### Basic Dockerfile
```dockerfile
FROM ubuntu:22.04
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y python3
CMD ["python3", "app.py"]
```

### Common Dockerfile Instructions
- `FROM` - Base image
- `WORKDIR` - Set working directory
- `COPY` / `ADD` - Copy files into image
- `RUN` - Execute commands during build
- `CMD` - Default command when container starts
- `ENTRYPOINT` - Configure container as executable
- `ENV` - Set environment variables
- `EXPOSE` - Document exposed ports
- `VOLUME` - Create mount point

## Image Management Commands

```bash
# Build an image
docker build -t myapp:1.0 .

# List images
docker images

# Remove an image
docker rmi image_name

# Tag an image
docker tag source_image:tag target_image:tag

# Push to registry
docker push username/image:tag

# Pull from registry
docker pull username/image:tag

# Inspect image details
docker inspect image_name

# View image history
docker history image_name
```

## Best Practices

1. **Use specific base image tags** - Avoid `latest`
2. **Minimize layers** - Combine RUN commands
3. **Use .dockerignore** - Exclude unnecessary files
4. **Multi-stage builds** - Reduce final image size
5. **Order matters** - Put frequently changing layers last
6. **Use official images** - Start with trusted sources

## Multi-Stage Build Example

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/index.js"]
```

## Image Optimization

- Use Alpine-based images
- Remove unnecessary dependencies
- Clear cache after installs
- Leverage build cache
- Scan for vulnerabilities

## Related Topics

- See [examples/](../examples/) for complete Dockerfile examples
- Check [security/](../security/) for image security practices
