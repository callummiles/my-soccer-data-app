FROM node:18

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy server code and environment files
COPY server/ ./server/
COPY server/.env.production ./.env

# Create SSL directory
RUN mkdir -p ssl

# Install dependencies
RUN npm install

# Expose both HTTP and HTTPS ports
EXPOSE 8080 443

# Start the server
CMD ["npm", "start"]