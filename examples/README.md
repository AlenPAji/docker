# Docker Examples

Real-world application examples and complete configurations.

## Available Examples

### Web Applications
- [Node.js Express API](./nodejs-api/)
- [Python Flask App](./python-flask/)
- [React Frontend](./react-app/)
- [Full MERN Stack](./mern-stack/)

### Databases
- [PostgreSQL](./postgres/)
- [MongoDB](./mongodb/)
- [Redis Cache](./redis/)
- [MySQL](./mysql/)

### Reverse Proxies & Load Balancers
- [Nginx Reverse Proxy](./nginx-proxy/)
- [Traefik](./traefik/)

### Complete Stacks
- [WordPress + MySQL](./wordpress/)
- [LAMP Stack](./lamp-stack/)
- [Microservices Architecture](./microservices/)

## Quick Start Examples

### Simple Node.js Application

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Python Flask Application

**Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
USER nobody
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

**requirements.txt:**
```
Flask==2.3.0
gunicorn==21.2.0
```

### Nginx Static Site

**Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY ./html /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped
```

### PostgreSQL + pgAdmin

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@example.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres-data:
```

### Redis Cache

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass mypassword
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379:0:mypassword
    ports:
      - "8081:8081"
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis-data:
```

### Multi-Service Application

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:4000
    depends_on:
      - backend
    networks:
      - app-network

  # Backend API
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/appdb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    networks:
      - app-network

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=appdb
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  # Cache
  cache:
    image: redis:7-alpine
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

### Development Environment with Hot Reload

**docker-compose.dev.yml:**
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    command: npm run dev
```

### WordPress with MySQL

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      - WORDPRESS_DB_HOST=db
      - WORDPRESS_DB_USER=wordpress
      - WORDPRESS_DB_PASSWORD=secret
      - WORDPRESS_DB_NAME=wordpress
    volumes:
      - wordpress-data:/var/www/html
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wordpress
      - MYSQL_PASSWORD=secret
      - MYSQL_ROOT_PASSWORD=rootsecret
    volumes:
      - db-data:/var/lib/mysql
    restart: unless-stopped

volumes:
  wordpress-data:
  db-data:
```

## Usage

```bash
# Navigate to example directory
cd examples/nodejs-api

# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Related Topics

- See [compose/](../compose/) for Docker Compose details
- Check [networking/](../networking/) for network configurations
- Explore [volumes/](../volumes/) for data persistence patterns
