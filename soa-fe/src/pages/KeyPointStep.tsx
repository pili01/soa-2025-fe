import { Check, Edit3, MapPin, Plus, Trash2, X } from 'lucide-react';
import TourMap from '../components/map';
import { Keypoint } from '../models/Tour';

interface KeypointsStepProps {
  currentKeyPoint: Keypoint;
  setCurrentKeyPoint: React.Dispatch<React.SetStateAction<Keypoint>>;
  keyPoints: Keypoint[];
  setMode: React.Dispatch<React.SetStateAction<string>>;
  mode: string;
  setDeleteKp: React.Dispatch<React.SetStateAction<number | null>>;
  setKeyPoints: React.Dispatch<React.SetStateAction<Keypoint[]>>;
}

export default function KeypointsStep({
  currentKeyPoint,
  setCurrentKeyPoint,
  keyPoints,
  setMode,
  mode,
  setDeleteKp,
  setKeyPoints,
}: KeypointsStepProps) {
  return (
        <div>
            <h2 className="text-2xl font-bold text-green-800 mb-6">Keypoint-ovi ture</h2>
            
            <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dodati keypoint-ovi</h3>
            {keyPoints.map((kp,index) => (
            <div className="space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold text-green-800">{kp.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{kp.description}</p>
                    <p className="text-xs text-gray-500">Koordinate: {kp.latitude}, {kp.longitude}</p>
                    </div>
                    <button className="ml-4 p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition-colors"
                            onClick={() => {setCurrentKeyPoint(kp); 
                                            setMode('edit');}}>
                    <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                    className="ml-2 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    onClick={() => {
                        setDeleteKp(kp.id);
                    }}
                    >
                    <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                </div>
                
            </div>
            ))}

            <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Još uvek nemate dodane keypoint-ove</p>
                <p className="text-sm">Dodajte prvi keypoint ispod</p>
            </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-orange-800">Dodaj novi keypoint</h3>
                
                <div className="flex space-x-2" style={{display: 'none'}}>
                <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Check className="h-4 w-4" />
                </button>
                <button className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <X className="h-4 w-4" />
                </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Naziv keypoint-a</label>
                <input
                    type="text"
                    value={currentKeyPoint.name}
                    onChange={(e) =>
                    setCurrentKeyPoint(kp => ({ ...kp, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="npr. Trg Republike"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL slike</label>
                <input
                    type="text"
                    value={currentKeyPoint.imageUrl}
                    onChange={(e) =>
                        setCurrentKeyPoint(kp => ({ ...kp, imageUrl: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="https://example.com/slika.jpg"
                />
                </div>
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Opis</label>
                <textarea
                    rows={3}
                    value={currentKeyPoint.description}
                    onChange={(e) =>
                        setCurrentKeyPoint(kp => ({ ...kp, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none transition-colors"
                    placeholder="Opišite ovaj keypoint..."
                ></textarea>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokacija na mapi</label>
                <div className="w-full h-64 bg-green-100 border-2 border-dashed border-green-300 rounded-lg overflow-hidden">
                    <TourMap
                    mode="edit"
                    checkPoints={keyPoints}
                    selectedId={currentKeyPoint?.id}
                    draftLocation={{
                    latitude: currentKeyPoint.latitude,
                    longitude: currentKeyPoint.longitude,
                    }}
                    onAddKeyPoint={({ longitude, latitude }) => {
                        setCurrentKeyPoint(prev => ({
                        ...(prev ?? {
                            id: 0, tourId: 11, name: "", description: "", imageUrl: "",
                            latitude: 0, longitude: 0, ordinal: (keyPoints?.length ?? 0) + 1
                        }),
                        latitude,
                        longitude,
                        }));
                    }}
                    />
                </div>
            </div>

            <button
            onClick={() => {
                if (mode === 'edit') {
                setKeyPoints(prev =>
                    (prev ?? []).map(p => (p.id === currentKeyPoint.id ? currentKeyPoint : p))
                );
                console.log("Trenutni kp", currentKeyPoint);
                setMode('add');
                } else {
                setKeyPoints(prev => [
                    ...(prev ?? []),
                    {
                    ...currentKeyPoint,
                    id: 0
                    },
                ]);
                }

                setCurrentKeyPoint({
                id: 0,
                tourId: 11,
                name: '',
                description: '',
                imageUrl: '',
                latitude: 0,
                longitude: 0,
                ordinal: 1,
                });
            }}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
            <Plus className="h-5 w-5" />
            {mode === 'add' ? <span>Add</span> : <span>Update</span>}
            </button>
            </div>

            <div className="mt-4">
            </div>
    </div>
  );
}
