#!/bin/bash
set -e

# --- Configuration ---
# The port the application will be accessible on.
APP_PORT="74674"
# The directory where the project will be cloned.
PROJECT_DIR="/opt/netcup-sentinel"
# The name of the Docker container.
CONTAINER_NAME="netcup_sentinel_frontend"

# --- Colors for output ---
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_YELLOW='\033[1;33m'

# --- Helper Functions ---
function print_info {
    echo -e "${C_BLUE}[INFO] $1${C_RESET}"
}

function print_success {
    echo -e "${C_GREEN}[SUCCESS] $1${C_RESET}"
}

function print_warning {
    echo -e "${C_YELLOW}[WARNING] $1${C_RESET}"
}

function print_error {
    echo -e "${C_RED}[ERROR] $1${C_RESET}"
    exit 1
}

# --- Main Script ---

# 1. Check for root privileges
if [ "$(id -u)" -ne 0 ]; then
    print_error "This script must be run as root. Please use 'sudo' or log in as the root user."
fi

# 2. Check for Git repository URL argument
if [ -z "$1" ]; then
    print_error "You must provide the Git repository URL as an argument.\nUsage: ./install.sh https://github.com/your_username/your_repo.git"
fi
REPO_URL=$1

print_info "Starting Netcup VPS Sentinel deployment..."

# 3. Install dependencies
print_info "Updating package lists..."
apt-get update -y

print_info "Checking and installing dependencies (git, docker)..."

# Install Git if not present
if ! command -v git &> /dev/null; then
    print_info "Git not found. Installing..."
    apt-get install -y git
else
    print_success "Git is already installed."
fi

# Install Docker if not present (using the official Docker repository for best practice)
if ! command -v docker &> /dev/null; then
    print_info "Docker not found. Installing Docker Engine..."
    apt-get install -y ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    print_success "Docker is already installed."
fi

# 4. Clone the repository
print_info "Cloning repository from $REPO_URL..."
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory $PROJECT_DIR already exists. Removing for a fresh clone."
    rm -rf "$PROJECT_DIR"
fi
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 5. Create Docker deployment files
print_info "Creating Docker configuration files..."

# Create Dockerfile
cat <<EOF > Dockerfile
# Use a lightweight Nginx image as the base
FROM nginx:alpine

# Copy all application source files to the Nginx web root directory
COPY . /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# The command to start the Nginx server when the container launches
CMD ["nginx", "-g", "daemon off;"]
EOF
print_success "Dockerfile created."

# Create docker-compose.yml
cat <<EOF > docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    container_name: ${CONTAINER_NAME}
    ports:
      - "${APP_PORT}:80"
    restart: unless-stopped
EOF
print_success "docker-compose.yml created."

# Create nginx.conf
cat <<EOF > nginx.conf
server {
    listen 80;
    server_name localhost;

    # Set the root directory for the web server
    root /usr/share/nginx/html;
    # The default file to serve
    index index.html;

    # This block is crucial for single-page applications (SPAs) like Angular
    # It ensures that all routes are handled by index.html for client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
print_success "nginx.conf created."

# 6. Build and deploy the application
print_info "Building and starting the application container..."
if docker compose up --build -d; then
    print_success "Deployment complete!"
    echo -e "\n------------------------------------------------------"
    echo -e "${C_GREEN}Netcup VPS Sentinel is now running.${C_RESET}"
    echo -e "You can access it at: ${C_YELLOW}http://<your_server_ip>:${APP_PORT}${C_RESET}"
    echo "------------------------------------------------------\n"
    docker compose ps
else
    print_error "Failed to deploy the application. Please check the logs above."
fi