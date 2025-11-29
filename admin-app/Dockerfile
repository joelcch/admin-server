# Stage 1: Build the application
FROM node:20 AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Create the production image
FROM node:20-slim
WORKDIR /app

# Copy package files and production node_modules from the builder stage
COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code
COPY . .

# Command to run the application
CMD ["node", "app.js"]
