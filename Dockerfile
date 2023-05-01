# Specify the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the npm dependencies
RUN npm ci --only=production

# Copy the application code into the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "node", "start.js" ]
