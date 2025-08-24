import axios from "axios";
import { useEffect, useState } from "react";
import TourMap from "../components/map";
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
          const demoTours = await getTours(ac.signal);
          setTours(demoTours);

          console.log("Tours", tours);

          const tourId = demoTours?.[2]?.id;
          console.log("Tour Id", tourId);
          if (tourId == null) return;

          console.log("Vadimo kps");
          const kps = await getTourKeyPoints(tourId, ac.signal);
          console.log("Kps:", kps);
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