FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV BACKEND_URL=http://backend:8080
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 80
CMD ["node", "server.mjs"]
