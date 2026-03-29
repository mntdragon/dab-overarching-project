import { persistentAtom } from "@nanostores/persistent";

export type RealtimeState = {
  lastEventId: string | null;
  lastTs: string | null;
  count: number;
  connected: boolean;
};

export const realtime = persistentAtom<RealtimeState>(
  "realtime",
  {
    lastEventId: null,
    lastTs: null,
    count: 0,
    connected: false,
  },
  { encode: JSON.stringify, decode: JSON.parse }
);
