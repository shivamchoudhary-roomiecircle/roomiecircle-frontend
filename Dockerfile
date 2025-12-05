# Stage 1: Build
FROM node:18-alpine as build
WORKDIR /app

# Copy package files
COPY package*.json ./
# Use --legacy-peer-deps to ignore potential Bun/NPM conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Accept build mode as argument (default: production)
ARG BUILD_MODE=production

# Run the build with the specified mode
RUN npm run build -- --mode ${BUILD_MODE}

# --- 🔍 DETECTIVE STEP 1 🔍 ---
# Print the contents of the /app folder. 
# Do we see 'dist'? Do we see 'build'?
RUN echo "=== CONTENTS OF /app ===" && ls -la /app

# --- 🔍 DETECTIVE STEP 2 🔍 ---
# Print the contents of the output folder (if it exists)
RUN echo "=== CONTENTS OF /app/dist ===" && ls -la /app/dist || echo "DIST FOLDER NOT FOUND"

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]