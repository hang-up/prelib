FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS development-stage

ENV FRONTEND_HOST=0.0.0.0
ENV FRONTEND_PORT=6384

COPY . .

EXPOSE 6384

CMD ["npm", "run", "dev"]
