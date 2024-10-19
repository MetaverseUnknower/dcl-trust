FROM node:18-alpine

# Install required tools for node-gyp (Python, make, g++)
RUN apk add --no-cache python3 make g++

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port for the server
EXPOSE 34567

# Command to run the application
CMD ["npm", "run", "start"]
