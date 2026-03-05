# SELF EXPERIMENT

This demo showcases a modern Astro 5.x implementation using the Content Layer API, Islands Architecture, and a Hono backend for real-time Server-Sent Events (SSE).

## The Architecture Overview

A a decoupled system where:

- `Astro` handles the static-first frontend and MDX-based content.
- `Hono` serves as a lightweight API for SSE.
- `Nano Stores` bridges the state gap between independent islands and persists data across page navigations.
- `Traefik` acts as the reverse proxy, unifying the frontend and backend under a single port (8000).

## Hono SSE (Server)

This service emits real-time updates that our Astro islands will consume.

The Hono streamSSE helper provides a lightweight way to push data to the client without the overhead of WebSockets.

## Astro: Content Layer & MDX

Content Layer API, allowing to pull data from any source (local or remote) and treat it as a structured collection.

## Shared State: Nano Stores

To maintain state across different UI frameworks (React, Vue, Svelte) and across page navigations

## Island Architecture

A dynamic "Island" component that connects to our SSE stream and the shared state. By putting components inside MDX, content creators then trigger "islands" of interactivity within static text.

```
---
title: "Modern Architecture"
status: "Published"
---
import StatusIsland from '../../components/StatusIsland';

# This is a static MDX Page

Content Collections allow us to keep this text structured. 
Below is an **Island** that maintains state even if you navigate away!

<StatusIsland client:visible />
```