import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Keypoint } from '../models/Tour';
import { createTourKeyPoint, deleteTourKeyPoint, getTourKeyPoints, updateTourKeyPoints } from '../services/CreateTourService';
import KeypointsStep from './KeyPointStep';

export default function TourWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [keyPoints, setKeyPoints] = useState<Keypoint[]>([]);
  const [mode, setMode] = useState("Add");
  const [deleteKp, setDeleteKp] = useState<number | null>(null);
  const createGuardRef = useRef<string | null>(null);
  const [currentKeyPoint, setCurrentKeyPoint] = useState<Keypoint>({
        id: 0,
        tourId: 3,
        name: "",
        description: "",
        imageUrl: "",
        latitude: 0,
        longitude: 0,
        ordinal: 1,
   });


  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const tourId = 3;

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const ac = new AbortController();

    (async () => {
      try {
        const list = await getTourKeyPoints(tourId );
        setKeyPoints(list);
        setMode("add");
      } catch (err) {
        if ((err as any)?.code === "ERR_CANCELED" || (err as any)?.name === "CanceledError") return;
        console.error("GET keypoints failed:", err);
      }
    })();

    return () => ac.abort();
  }, [tourId]);

  useEffect(() => {
    if (deleteKp !== null) {
      const doDelete = async () => {
        try {
          if(deleteKp )
          await deleteTourKeyPoint(deleteKp);
          const list = await getTourKeyPoints(tourId);
          setKeyPoints(list);
        } catch (err) {
          console.error("Greška pri brisanju keypoint-a:", err);
        }
      };

      doDelete();
    }
  }, [deleteKp]);


  useEffect(() => {
    if (!currentKeyPoint) return;

    const saveKeyPoint = async () => {
      try {
        if (mode === "edit") {
          await updateTourKeyPoints(currentKeyPoint, currentKeyPoint.id);

          const list = await getTourKeyPoints(tourId); 
          setKeyPoints(list);  
        }
      } catch (error) {
        console.error("Greška prilikom čuvanja keypointa:", error);
      }
    };

    saveKeyPoint();
  }, [mode, currentKeyPoint]); 

  const handleSetKeyPoints = (updater: React.SetStateAction<Keypoint[]>) => {
    const EPS = 1e-6;

    setKeyPoints(prev => {
      const next =
        typeof updater === "function"
          ? (updater as (p: Keypoint[]) => Keypoint[])(prev)
          : updater;

      const addedExactlyOne = next.length === prev.length + 1;
      const last = next.at(-1);
      if (!addedExactlyOne || !last) return prev;

      const exists = prev.some(p =>
        Math.abs(Number(p.latitude) - Number(last.latitude)) < EPS &&
        Math.abs(Number(p.longitude) - Number(last.longitude)) < EPS
      );
      if (exists) return prev;

      if (!Number.isFinite(last.latitude) || !Number.isFinite(last.longitude)) return prev;

      const { id: _id, ...payload } = last as Keypoint & { id?: number };
      const guardKey = `${payload.tourId}:${Number(payload.latitude).toFixed(6)},${Number(payload.longitude).toFixed(6)}`;
      if (createGuardRef.current === guardKey) return prev;
      createGuardRef.current = guardKey;

      void createTourKeyPoint(tourId, payload as Omit<Keypoint, "id">)
        .then(() => getTourKeyPoints(tourId).then(setKeyPoints))
        .catch(err => console.error(err))
        .finally(() => { createGuardRef.current = null; });

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Kreiranje turističke ture</h1>
          <p className="text-green-600">Napravite nezaboravno iskustvo za vaše goste</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              currentStep >= 1 ? 'bg-green-800 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-green-800' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
              currentStep >= 2 ? 'bg-green-800 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-8 mb-8">
          <span className={`font-medium ${currentStep === 1 ? 'text-green-800' : 'text-gray-500'}`}>
            Osnovne informacije
          </span>
          <span className={`font-medium ${currentStep === 2 ? 'text-green-800' : 'text-gray-500'}`}>
            Keypoint-ovi
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-6">Osnovne informacije o turi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naziv ture</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                    placeholder="Unesite naziv ture..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trajanje</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                    placeholder="npr. 3 sata"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Težina</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                  >
                    <option value="">Izaberite težinu...</option>
                    <option value="Lako">Lako</option>
                    <option value="Srednje">Srednje</option>
                    <option value="Teško">Teško</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cena</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                    placeholder="npr. 2000 RSD"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opis ture</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors resize-none"
                    placeholder="Opišite vašu turu..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <KeypointsStep
                currentKeyPoint={currentKeyPoint}
                setCurrentKeyPoint={setCurrentKeyPoint}
                keyPoints={keyPoints}
                mode = {mode}
                setMode = {setMode}
                setDeleteKp = {setDeleteKp}
                setKeyPoints={handleSetKeyPoints}
            />
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Nazad</span>
            </button>

            {currentStep === 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-green-800 text-white rounded-lg font-semibold hover:bg-green-900 transition-colors"
              >
                <span>Sledeći korak</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Kreiraj turu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};