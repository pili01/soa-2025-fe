import axios from "axios";
import { useEffect, useState } from "react";
import TourMap from "../components/Map";
import type { Keypoint, Tour } from "../models/Tour";
import { getTourKeyPoints, getTours } from "../services/CreateTourService";

export default function MyTours() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [keypoints, setKeyPoints] = useState<Keypoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const ac = new AbortController();
      setLoading(true);

      (async () => {
        try {

          const tourId = 3;
          if (tourId == null) return;

          const kps = await getTourKeyPoints(tourId, ac.signal);
          setKeyPoints(kps);
        } catch (err: any) {
          if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
            return;
          }
          setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
        } finally {
          setLoading(false);
        }
      })();

      return () => ac.abort();
    }, []);


  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {error}</p>;
    
  return (
    <TourMap
      mode="view"
      checkPoints={ keypoints }   
    />
  );
}