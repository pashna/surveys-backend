FROM node:20-alpine AS base

#
## step 1: Prune monorepo
#
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo@1.12.5
COPY . .
RUN turbo prune @formbricks/web --docker

#
## step 2: Install & build
#
FROM base AS installer

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install necessary build tools and compilers
RUN apk update && apk add --no-cache g++ cmake make gcc python3 openssl-dev jq


# Set hardcoded environment variables
ENV DATABASE_URL="postgresql://placeholder:for@build:5432/gets_overwritten_at_runtime?schema=public"
ENV NEXTAUTH_SECRET="placeholder_for_next_auth_of_64_chars_get_overwritten_at_runtime"
ENV ENCRYPTION_KEY="placeholder_for_build_key_of_64_chars_get_overwritten_at_runtime"

ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN

# Set the working directory
WORKDIR /app

# Copy the package information
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install the dependencies
RUN pnpm install

# Prepare the build
COPY --from=builder /app/out/full/ .
# Create a .env file
RUN touch /app/apps/web/.env

# Build the project
RUN pnpm post-install --filter=web...
RUN pnpm turbo run build --filter=web...

# Extract Prisma version
RUN jq -r '.devDependencies.prisma' packages/database/package.json > /prisma_version.txt

#
## step 3: setup production runner
#
FROM base AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache curl \
    && apk add --no-cache supercronic \
    # && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /home/nextjs

COPY --from=installer /app/apps/web/next.config.mjs .
COPY --from=installer /app/apps/web/package.json .
# Leverage output traces to reduce image size
COPY --from=installer --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nextjs /app/packages/database/schema.prisma ./packages/database/schema.prisma
COPY --from=installer --chown=nextjs:nextjs /app/packages/database/package.json ./packages/database/package.json
COPY --from=installer --chown=nextjs:nextjs /app/packages/database/migrations ./packages/database/migrations
COPY --from=installer --chown=nextjs:nextjs /prisma_version.txt .
COPY /docker/cronjobs /app/docker/cronjobs

# Install Prisma globally
RUN PRISMA_VERSION=$(cat prisma_version.txt) && npm install -g prisma@$PRISMA_VERSION

EXPOSE 3000
ENV HOSTNAME "0.0.0.0"
# USER nextjs

# Prepare volume for uploads
RUN mkdir -p /home/nextjs/apps/web/uploads/
VOLUME /home/nextjs/apps/web/uploads/

CMD supercronic -quiet /app/docker/cronjobs & \
    (cd packages/database && pnpm db:migrate:deploy) && \
    exec node apps/web/server.js
