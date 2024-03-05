# Specify the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Chromium and its dependencies
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Set Puppeteer to skip downloading Chromium since we're installing it manually.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Tell Puppeteer to use the installed version of Chromium.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the npm dependencies
RUN npm ci --only=production

# Copy the application code into the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set the timezone
ENV TZ="Europe/Zurich"

# Start the application
CMD [ "node", "start.js" ]
