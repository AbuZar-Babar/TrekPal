FROM node:20

WORKDIR /app

# 1. Copy only dependency manifests
COPY package.json package-lock.json ./

# 2. Install deps INSIDE Linux container
RUN npm ci

# 3. Copy rest of the source
COPY . .

# 4. Expose Vite port
EXPOSE 5173

# 5. Start dev server
CMD ["npm", "run", "dev"]
