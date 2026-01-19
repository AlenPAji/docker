# Docker Basics

Understanding the fundamental concepts of Docker.

## Topics Covered

### 1. What is Docker?
- Containerization concepts
- Docker vs Virtual Machines
- Benefits of using Docker

### 2. Core Components
- **Docker Engine** - The runtime that builds and runs containers
- **Docker Images** - Templates for creating containers
- **Docker Containers** - Running instances of images
- **Docker Registry** - Storage for Docker images (Docker Hub)

### 3. Architecture
- Client-Server architecture
- Docker daemon
- Docker CLI
- REST API

### 4. Installation
```bash
# Check Docker version
docker --version

# Verify installation
docker run hello-world
```

### 5. Basic Workflow
1. Write a Dockerfile
2. Build an image
3. Run a container
4. Manage container lifecycle

## Key Concepts

- **Images**: Read-only templates with instructions for creating containers
- **Containers**: Runnable instances of images
- **Dockerfile**: Text file with instructions to build an image
- **Layers**: Images are built in layers for efficiency

## Next Steps

- Move to [images/](../images/) to learn about creating Docker images
- Explore [containers/](../containers/) for container management
