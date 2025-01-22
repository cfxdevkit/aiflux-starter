FROM node:23.3.0-slim

# Install necessary development tools and utilities
RUN apt-get update && \
    apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    curl \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install pnpm globally
RUN npm install -g pnpm@9.15.1

# Create and set the working directory
WORKDIR /workspace

# Set up non-root user
USER node

# The source code will be mounted at runtime, so we don't need to COPY anything here 