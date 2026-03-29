# apps/api/Dockerfile
FROM denoland/deno:alpine-2.1.2

WORKDIR /app

COPY deno.json* deno.lock* ./

# Copy source
COPY main.ts ./main.ts

COPY src ./src

# Cache dependencies
RUN deno cache --lock=deno.lock main.ts


EXPOSE 3000

CMD ["deno", "task", "start"]
