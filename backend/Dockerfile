FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production

EXPOSE 10000

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start"]
