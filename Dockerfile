FROM node:20-alpine AS dev-deps
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS prod-deps
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build
COPY . /app/
COPY --from=dev-deps /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
COPY ./package.json package-lock.json /app/
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]