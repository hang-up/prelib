FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS development-stage

ENV HOST=0.0.0.0
ENV PORT=4200

COPY . .

EXPOSE 4200

CMD ["npm", "run", "dev"]
