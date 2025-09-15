import { Layer, Map, MapLayerMouseEvent, MapRef, Marker, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import pinIcon from "../assets/map-point.png";
import { useDrivingRoute } from "../hooks/useDrivingRoute";
import type { Keypoint } from "../models/Tour";
import pinPosition from "../assets/my-location.png";
import { Position } from "../models/Position";
import { createNewPosition, getPosition } from "../services/PositionService";

export type TourMapProps = {
  mode: "view" | "edit" | "touristLocation";
  checkPoints: Keypoint[];
  selectedId?: string | number;
  draftLocation?: { latitude: number; longitude: number };
  onAddKeyPoint?: (pos: { latitude: number; longitude: number }) => void;
  onPickCoords?: (pos: { latitude: number; longitude: number }) => void;
};

const MAPTILER_STYLE =
  "https://api.maptiler.com/maps/streets-v2/style.json?key=eQ7kHusRBi4TZNe7vYuj";

export default function TourMap({
  mode,
  checkPoints = [],
  selectedId,
  draftLocation,
  onAddKeyPoint,
  onPickCoords,
}: TourMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [pickMode, setPickMode] = useState(false);

  type RawPos = any;

  const [position, setPosition] = useState({
    id: 1,
    userId: 0,
    longitude: 0,
    latitude: 0
  });

    useEffect(() => {
    const fetchPosition = async () => {
      try {
        const pos = await getPosition();
        setPosition(pos);
      } catch (err) {
        console.error("Failed to load position", err);
      }
    };

    fetchPosition();
  }, []);

  const initialView = useMemo(
    () => ({
      longitude: 19.8335,
      latitude: 45.2671,
      zoom: 12,
      bearing: 0,
      pitch: 0,
    }),
    []
  );

  const points = useMemo(
    () =>
      checkPoints.map((k) => ({
        latitude: k.latitude,
        longitude: k.longitude,
        ordinal: k.ordinal,
      })),
    [checkPoints]
  );

  const { segments, bounds } = useDrivingRoute(points);

  const segmentsFC = useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: segments ?? [],
      }) as GeoJSON.FeatureCollection,
    [segments]
  );

  useEffect(() => {
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: 24, maxZoom: 16 });
    }
  }, [bounds]);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const { lng, lat } = e.lngLat;

      if (pickMode) {
        const pos = { latitude: +lat, longitude: +lng };

        const position: Position = { id: 0, userId: 0, latitude: +lat, longitude: +lng };

        createNewPosition(position);
        setPosition(position);

        console.log(
          "coords:",
          pos,
        );

        if (onPickCoords) onPickCoords(pos);
        else onAddKeyPoint?.(pos);
        setPickMode(false);
        return;
      }

      if (mode === "touristLocation") {
        setPickMode(true);
      }

      if (mode !== "edit") return;
      onAddKeyPoint?.({ latitude: +lat, longitude: +lng });
    },
    [pickMode, mode, onAddKeyPoint, onPickCoords]
  );

  return (
    <div style={{ width: "100%", height: "85vh", position: "relative" }}>
      {mode === "view" && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setPickMode((v) => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              background: pickMode ? "#1976d2" : "#fff",
              color: pickMode ? "#fff" : "#333",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            }}
            title={pickMode ? "Klikni na mapu da izabereš koordinate" : "Uključi biranje koordinata"}
          >
            {pickMode ? "Klikni na mapu…" : "Where are you?"}
          </button>
        </div>
      )}
      <Map
        ref={mapRef}
        id="tour-map"
        initialViewState={initialView}
        mapStyle={MAPTILER_STYLE}
        onClick={handleMapClick}
        dragRotate={false}
        style={{
          width: "100%",
          height: "100%",
          cursor: pickMode ? "crosshair" : undefined,
        }}
      >
        {checkPoints.map((k, index) => {
          const isSelected = String(k.id) === String(selectedId ?? "");
          return (
            <Marker
              key={`checkpoint-${k.id ?? index}`}
              longitude={Number(k.longitude)}
              latitude={Number(k.latitude)}
              anchor="bottom"
              offset={[0, 0]}
            >
              <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: k.isReached ? 'green' : '#dc3545',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                {index + 1}
                </div>
            </Marker>
          );
        })}

        {position && Number(position.latitude) !== 0 && Number(position.longitude) !== 0 && (
          <Marker longitude={position.longitude} latitude={position.latitude} anchor="bottom">
            <img
              src={pinPosition}
              alt="marker"
              width={34}
              height={34}
              draggable={false}
              style={{ display: "block", userSelect: "none" }}
            />
          </Marker>
          )}

        <Source id="route-segments" type="geojson" data={segmentsFC}>
          <Layer
            id="route-line"
            type="line"
            layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{
              "line-width": 5,
              "line-color": "#1976d2",
              "line-opacity": 0.8,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
