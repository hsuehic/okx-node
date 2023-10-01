FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter "okx-master^..." build
RUN pnpm --filter "okx-master" build

FROM base AS common
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
# COPY --from=prod-deps /app/packages/okx-sign/node_modules /app/packages/okx-sign/node_modules # okx-sign no dependencies
COPY --from=build /app/packages/okx-sign/dist /app/packages/okx-sign/dist

FROM common AS okx-master
COPY --from=prod-deps /app/packages/okx-master/node_modules/ /app/packages/okx-master/node_modules
COPY --from=build /app/packages/okx-master/dist /app/packages/okx-master/dist
COPY --from=build /app/packages/okx-master/static /app/packages/okx-master/static
WORKDIR /app/packages/okx-master

EXPOSE 80
CMD [ "pnpm", "start" ]
