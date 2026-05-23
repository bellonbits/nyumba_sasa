# Multi-stage Dockerfile for Nyumba Sasa Next.js Frontend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Production Build Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for production build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Next.js static export build (output: "export" is configured in next.config.ts)
RUN npm run build

# Production Server (Nginx) to serve the static export
FROM nginx:1.25-alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default Nginx files
RUN rm -rf ./*

# Copy exported static files from builder
COPY --from=builder /app/out .

# Custom Nginx configuration to handle SPA-like routing (routing everything to index.html fallback if needed)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
