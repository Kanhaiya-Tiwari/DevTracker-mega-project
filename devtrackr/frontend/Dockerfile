FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV VITE_API_BASE_URL=/api/v1

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
