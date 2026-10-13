FROM node:20-slim

# Install build dependencies for better-sqlite3 native bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy application source code
COPY . .

# Ensure data directory exists
RUN mkdir -p data

# Seed initial database if not present
RUN node scripts/seed-database.js

# Start the Student Information System portal (binds to dynamic process.env.PORT or 3001)
CMD ["node", "server.js"]
