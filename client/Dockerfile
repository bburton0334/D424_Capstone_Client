# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build argument for API URL (set during docker build)
ARG VITE_API_URL=https://freight-tracker-server.vercel.app
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (VITE_API_URL is baked in here)
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Copy nginx config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Railway provides PORT env variable
ENV PORT=80

# Replace $PORT in nginx config and start nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"
