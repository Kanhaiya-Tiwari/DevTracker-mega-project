# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# Copy source code (excluding .env file)
COPY --exclude=.env . .

# Build the application
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:1.29-alpine AS production

USER root
RUN apk upgrade --no-cache

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
USER 101
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
