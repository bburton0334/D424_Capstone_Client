# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Railway uses PORT env variable (default to 80 for local testing)
ENV PORT=80

# Start nginx with envsubst to replace $PORT in config
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

