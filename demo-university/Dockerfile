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

# Expose dynamic PORT (Railway assigns this at runtime)
ENV PORT=3001
EXPOSE 3001

# Start the Student Information System portal
CMD ["node", "server.js"]
