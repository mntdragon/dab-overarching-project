<!-- Svelte island for SSE consumption -->

<script lang="ts">
  import { onMount } from "svelte";
  import { realtime } from "../stores/realtime";

  let es: EventSource | null = null;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    realtime.set({ ...realtime.get(), connected: true });

    es = new EventSource("/api/sse");

    es.addEventListener("tick", (evt: MessageEvent) => {
      retry = 0;
      const data = JSON.parse(String(evt.data));
      realtime.set({
        lastEventId: (evt as any).lastEventId ?? null,
        lastTs: data.ts ?? null,
        count: data.n ?? 0,
        connected: true,
      });
    });

    es.onerror = () => {
      realtime.set({ ...realtime.get(), connected: false });
      es?.close();
      es = null;

      // simple backoff: 0.5s, 1s, 2s, 4s (cap)
      const delay = Math.min(4000, 500 * Math.pow(2, retry++));
      timer = setTimeout(connect, delay);
    };
  }

  onMount(() => {
    connect();
    return () => {
      if (timer) clearTimeout(timer);
      es?.close();
    };
  });
</script>

<div style="padding: 12px; border: 1px solid #ddd; border-radius: 10px;">
  <strong>Realtime Island (SSE)</strong>
  <div>Connected: {$realtime.connected ? "yes" : "no"}</div>
  <div>Count: {$realtime.count}</div>
  <div>Last TS: {$realtime.lastTs ?? "-"}</div>
</div>
