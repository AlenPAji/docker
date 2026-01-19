# Docker Networking

Understanding and configuring Docker networks for container communication.

## Network Drivers

### 1. Bridge (Default)
- Default network driver
- Containers on same bridge can communicate
- Isolated from host network

### 2. Host
- Container shares host's network
- No network isolation
- Better performance

### 3. None
- No networking
- Complete isolation

### 4. Overlay
- Multi-host networking
- Used in Docker Swarm

### 5. Macvlan
- Assign MAC address to container
- Appears as physical device

## Network Commands

```bash
# List networks
docker network ls

# Create a network
docker network create my-network

# Create with specific driver
docker network create --driver bridge my-bridge

# Inspect network
docker network inspect my-network

# Connect container to network
docker network connect my-network container_name

# Disconnect container from network
docker network disconnect my-network container_name

# Remove network
docker network rm my-network

# Remove all unused networks
docker network prune
```

## Network Usage

### Creating Custom Bridge Network
```bash
# Create network
docker network create --driver bridge --subnet 172.20.0.0/16 my-app-network

# Run containers on network
docker run -d --name db --network my-app-network postgres
docker run -d --name web --network my-app-network nginx
```

### Container Communication
```bash
# Containers can communicate using container names as hostnames
# Inside 'web' container:
ping db  # This works!
```

### Port Publishing
```bash
# Publish specific port
docker run -p 8080:80 nginx

# Publish to specific host interface
docker run -p 127.0.0.1:8080:80 nginx

# Publish all exposed ports to random ports
docker run -P nginx

# Publish multiple ports
docker run -p 8080:80 -p 8443:443 nginx
```

## DNS Resolution

- Docker has built-in DNS server (127.0.0.11)
- Containers can resolve each other by name
- Custom DNS can be configured

```bash
# Use custom DNS
docker run --dns 8.8.8.8 nginx

# Add DNS search domain
docker run --dns-search example.com nginx
```

## Network Configuration Examples

### User-Defined Bridge Network
```bash
docker network create \
  --driver bridge \
  --subnet 172.25.0.0/16 \
  --gateway 172.25.0.1 \
  --opt "com.docker.network.bridge.name"="my-bridge" \
  my-custom-network
```

### Host Network
```bash
# Container uses host's network stack
docker run --network host nginx
```

### Connect Existing Container
```bash
# Connect running container to network
docker network connect my-network running-container
```

## Network Security

### Isolate Containers
```bash
# Create separate networks for different services
docker network create frontend-network
docker network create backend-network

# Frontend can't access backend directly
docker run --network frontend-network web
docker run --network backend-network db
```

### Internal Network
```bash
# Create network with no external access
docker network create --internal private-network
```

## Troubleshooting

```bash
# Check container's network settings
docker inspect container_name | grep -A 20 NetworkSettings

# View container IP address
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Test connectivity between containers
docker exec container1 ping container2

# Check port bindings
docker port container_name
```

## Best Practices

1. **Use custom bridge networks** - Better than default bridge
2. **Network isolation** - Separate concerns (frontend/backend)
3. **Use container names** - DNS resolution instead of IPs
4. **Limit port exposure** - Only expose necessary ports
5. **Use overlay for multi-host** - In production clusters
6. **Document network topology** - Keep track of connections

## Related Topics

- See [compose/](../compose/) for networking in Docker Compose
- Check [security/](../security/) for network security practices
- Explore [examples/](../examples/) for network configurations
