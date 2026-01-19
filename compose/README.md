# Docker Compose

Define and run multi-container Docker applications.

## What is Docker Compose?

- Tool for defining multi-container applications
- Uses YAML file (`docker-compose.yml`)
- Simplifies complex container orchestration
- Manages networks, volumes, and dependencies

## Installation

```bash
# Check version
docker compose version

# or (older syntax)
docker-compose --version
```

## Basic docker-compose.yml Structure

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - frontend

  app:
    build: ./app
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://db:5432/mydb
    networks:
      - frontend
      - backend

  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  db-data:
```

## Docker Compose Commands

```bash
# Start services
docker compose up

# Start in detached mode
docker compose up -d

# Build and start
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# View running services
docker compose ps

# View logs
docker compose logs

# Follow logs
docker compose logs -f

# Logs for specific service
docker compose logs web

# Execute command in service
docker compose exec web bash

# Scale services
docker compose up -d --scale app=3

# Restart services
docker compose restart

# Pull latest images
docker compose pull

# Validate compose file
docker compose config
```

## Service Configuration

### Build Configuration
```yaml
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
      args:
        - NODE_ENV=development
    image: myapp:dev
```

### Environment Variables
```yaml
services:
  app:
    environment:
      - DEBUG=true
      - API_KEY=${API_KEY}  # From .env file
    env_file:
      - .env
      - .env.local
```

### Port Mapping
```yaml
services:
  web:
    ports:
      - "8080:80"           # host:container
      - "8443:443"
      - "127.0.0.1:3000:3000"  # Bind to localhost only
```

### Volume Mounts
```yaml
services:
  app:
    volumes:
      - ./src:/app/src                    # Bind mount
      - node_modules:/app/node_modules    # Named volume
      - /app/logs                          # Anonymous volume
```

### Dependencies
```yaml
services:
  web:
    depends_on:
      - db
      - redis
  
  # With health checks (compose v3.8+)
  api:
    depends_on:
      db:
        condition: service_healthy
```

### Health Checks
```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Restart Policy
```yaml
services:
  app:
    restart: unless-stopped
    # Options: "no", "always", "on-failure", "unless-stopped"
```

### Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Complete Example: MERN Stack

```yaml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:6
    container_name: mongodb
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db
    networks:
      - mern-network
    ports:
      - "27017:27017"

  # Express API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: express-api
    restart: unless-stopped
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/mydb?authSource=admin
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - mern-network
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: react-app
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - api
    networks:
      - mern-network
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - api
    networks:
      - mern-network

networks:
  mern-network:
    driver: bridge

volumes:
  mongo-data:
```

## Environment Variables

### .env File
```env
# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=myapp

# Application
APP_PORT=3000
NODE_ENV=production
API_KEY=your-secret-key
```

### Using in Compose
```yaml
services:
  db:
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

## Networking

### Default Network
- Compose creates a default network
- All services can communicate using service names

### Custom Networks
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

## Profiles

Group services for different environments:

```yaml
services:
  web:
    image: nginx
  
  db:
    image: postgres
    profiles: ["production"]
  
  test-db:
    image: postgres
    profiles: ["test"]
```

```bash
# Start only production profile services
docker compose --profile production up
```

## Override Files

### docker-compose.override.yml
Automatically merged with docker-compose.yml:

```yaml
services:
  app:
    volumes:
      - ./src:/app/src  # Development bind mount
    environment:
      - DEBUG=true
```

### Multiple Compose Files
```bash
# Use specific compose files
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Best Practices

1. **Use version control** - Track compose files in git
2. **Environment variables** - Use .env files, don't hardcode
3. **Named volumes** - Better than bind mounts for data
4. **Health checks** - Ensure services are ready
5. **Resource limits** - Prevent resource exhaustion
6. **Use profiles** - Organize services by environment
7. **Don't use latest tag** - Pin specific versions
8. **One concern per service** - Follow single responsibility
9. **Use networks** - Isolate services appropriately
10. **Document** - Comment complex configurations

## Troubleshooting

```bash
# View service logs
docker compose logs -f service_name

# Rebuild specific service
docker compose up -d --build service_name

# Validate syntax
docker compose config

# Check service status
docker compose ps

# Remove all resources
docker compose down -v --remove-orphans

# Debug networking
docker compose exec service_name ping other_service
```

## Related Topics

- See [examples/](../examples/) for complete compose examples
- Check [networking/](../networking/) for network details
- Explore [volumes/](../volumes/) for data persistence
