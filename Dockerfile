ARG APP_VERSION=dev

FROM node:24-alpine AS dev-deps
ARG APP_VERSION
COPY . /app
WORKDIR /app
ENV APP_VERSION=$APP_VERSION
RUN npm ci

FROM node:24-alpine AS prod-deps
ARG APP_VERSION
COPY ./package.json package-lock.json /app/
WORKDIR /app
ENV APP_VERSION=$APP_VERSION
RUN npm ci --omit=dev

FROM node:24-alpine AS build
ARG APP_VERSION
COPY . /app/
COPY --from=dev-deps /app/node_modules /app/node_modules
WORKDIR /app
ENV APP_VERSION=$APP_VERSION
RUN npm run build

FROM node:24-alpine AS runner
ARG APP_VERSION
ENV NODE_ENV=production
ENV APP_VERSION=$APP_VERSION
LABEL org.opencontainers.image.version=$APP_VERSION
COPY ./package.json package-lock.json /app/
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]
