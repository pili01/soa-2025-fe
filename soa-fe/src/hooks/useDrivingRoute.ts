import { useEffect, useMemo, useRef, useState } from "react";

type InputPoint = { latitude: number; longitude: number; ordinal: number };

type LineFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: "LineString"; coordinates: [number, number][] };
};

type SegmentFeature = LineFeature & {
  properties: { legIndex: number; fromIdx: number; toIdx: number };
};

const routeCache = new Map<string, { feature: LineFeature; bounds: [[number,number],[number,number]] }>();

export function useDrivingRoute(points: InputPoint[]) {
  const [segments, setSegments] = useState<SegmentFeature[]>([]);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedPoints = useMemo(() => {
    const sorted = [...(points ?? [])].sort((a, b) => a.ordinal - b.ordinal);
    return sorted.filter((p, i) =>
      i === 0 ||
      p.latitude !== sorted[i - 1].latitude ||
      p.longitude !== sorted[i - 1].longitude
    );
  }, [points]);

  const pointsKey = useMemo(
    () => orderedPoints.map(p => `${p.ordinal}:${p.longitude},${p.latitude}`).join("|"),
    [orderedPoints]
  );

  const timerRef = useRef<number | null>(null);
  const acRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (orderedPoints.length < 2) {
      setSegments([]);
      setBounds(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;

      setLoading(true);
      setError(null);

      try {
        const cached = routeCache.get(pointsKey);
        if (cached) {
          setSegments([{
            ...cached.feature,
            properties: { legIndex: 0, fromIdx: 0, toIdx: orderedPoints.length - 1 }
          }]);
          setBounds(cached.bounds);
          setLoading(false);
          return;
        }

        const coords = orderedPoints.map(p => `${p.longitude},${p.latitude}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full&steps=false`;

        const fetchWithRetry = async () => {
          let attempt = 0, delay = 400;
          while (true) {
            attempt++;
            try {
              const res = await fetch(url, { signal: ac.signal });
              if (!res.ok) {
                const retriable = res.status === 429 || res.status >= 500;
                if (!retriable) throw new Error(`HTTP ${res.status}`);
                if (attempt >= 3) throw new Error(`HTTP ${res.status} (max retries)`);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
                continue;
              }
              return res.json();
            } catch (e: any) {
              if (e.name === "AbortError") throw e;
              if (attempt >= 3) throw e;
              await new Promise(r => setTimeout(r, delay));
              delay *= 2;
            }
          }
        };

        const data = await fetchWithRetry();
        const route = data?.routes?.[0];
        const geometry = route?.geometry as LineFeature["geometry"] | undefined;
        if (!geometry?.coordinates?.length) throw new Error("Prazna geometrija rute.");

        const feature: LineFeature = { type: "Feature", properties: {}, geometry };

        const coordsArr = geometry.coordinates;
        const lons = coordsArr.map(c => c[0]);
        const lats = coordsArr.map(c => c[1]);
        const min: [number, number] = [Math.min(...lons), Math.min(...lats)];
        const max: [number, number] = [Math.max(...lons), Math.max(...lats)];
        const b: [[number, number],[number, number]] = [min, max];

        routeCache.set(pointsKey, { feature, bounds: b });

        setSegments([{
          ...feature,
          properties: { legIndex: 0, fromIdx: 0, toIdx: orderedPoints.length - 1 }
        }]);
        setBounds(b);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        console.error("Routing error:", e);
        setSegments([]);
        setBounds(null);
        setError(e?.message ?? "Failed to fetch route");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      acRef.current?.abort();
    };
  }, [pointsKey, orderedPoints.length]);

  return { segments, bounds, loading, error };
}
