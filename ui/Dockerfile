# Stage 1: Build the React application
FROM node:18-alpine AS build

# Install dependencies required by node-gyp (Python, make, g++)
RUN apk add --no-cache python3 make g++

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the source code into the container
COPY . .

# Build the React application using Vite
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port for serving
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
