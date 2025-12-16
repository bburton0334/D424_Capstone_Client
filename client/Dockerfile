# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build argument for API URL
ARG VITE_API_URL=https://freight-tracker-server.vercel.app
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - use lightweight Node server
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Railway provides PORT env variable (default 3000)
ENV PORT=3000

# Serve the static files (-s for SPA mode, -l for listen port)
CMD ["sh", "-c", "serve -s dist -l $PORT"]
