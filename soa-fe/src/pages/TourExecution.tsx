import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import TourMap from '../components/Map';
import { FinishedKeypoint, Keypoint, Tour, TourExecution, TourExecutionStatus } from '../models/Tour';
import ExecutionService from '../services/ExecutionService';
import CreateTour from './CreateTour';
import * as CreateTourService from '../services/CreateTourService';

interface ExecutionResponse {
    execution: TourExecution;
    finished_keypoints?: FinishedKeypoint[];
}

const formatDate = (iso?: string | Date) => {
    if (!iso) return "";
    const d = typeof iso === "string" ? new Date(iso) : iso;
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TourExecutionPage: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const [executionInfo, setExecutionInfo] = useState<ExecutionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);
    const [tour_id, setTourId] = useState<number | null>(tourId ? parseInt(tourId) : null);
    const [tourInfo, setTourInfo] = useState<Tour | null>(null);
    const [keyPoints, setKeyPoints] = useState<Keypoint[]>([]);
    const [showLocationSelection, setShowLocationSelection] = useState(false);
    const navigate = useNavigate();

    // Fetch execution info every 10 seconds
    useEffect(() => {
        if (!tourId) return;
        setTourId(parseInt(tourId));
        fetchExecution();
        fetchTourInfo();
    }, [tourId]);

    useEffect(() => {
        // alert(executionInfo?.execution.status)
        if (executionInfo && executionInfo.execution.status === 'in_progress') {
            console.log("Postavljanje intervala za otvaranje mape");
            const interval = setInterval(() => setShowLocationSelection(true), 10000);
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        }
    }, [executionInfo]);

    const fetchExecution = async () => {
        try {
            if (!tour_id) return;
            setLoading(true);
            setError('');
            // Replace with your API endpoint for execution info
            const data = await ExecutionService.getExecutionByTourId(tour_id);
            setExecutionInfo(data ? { execution: data } : null);
            // console.log("Execution info:", executionInfo);
            // refreshKeyPoints();
        } catch (err: any) {
            setError(err.message || 'Greška pri učitavanju izvršenja ture');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchTourInfo = async () => {
        try {
            if (!tour_id) return;
            setLoading(true);
            setError('');
            const data = await CreateTourService.fetchTourInfo(tour_id);
            setTourInfo(data.tour);
            setKeyPoints(data.keypoints || []);
            // console.log("Tour info:", data);
            // console.log("Key points:", keyPoints);
        } catch (err: any) {
            setError(err.message || 'Greška pri učitavanju izvršenja ture');
        } finally {
            setLoading(false);
        }
    };

    const checkIfKeypointReached = async () => {
        try {
            if (!tour_id) return;
            if (executionInfo?.execution.status !== 'in_progress'){
                console.warn('Tura nije u toku. Ne možete doći do ključne tačke.');
                return;
            }
            setLoading(true);
            setError('');
            const data = await ExecutionService.isKeypointReached(tour_id);
            if (data) {
                alert('Čestitamo! Stigli ste do nove ključne tačke ture.');
                window.location.reload();
            } else {
                console.log('Još niste stigli do nove ključne tačke. Nastavite dalje!');
            }
        } catch (err: any) {
            setError(err.message || 'Greška pri učitavanju izvršenja ture');
        } finally {
            setLoading(false);
        }
    }

    const handleAbortTour = async () => {
        if (!tour_id) return;
        try {
            setLoading(true);
            setError('');
            const response = await ExecutionService.abortTour(tour_id);
            if (!response) throw new Error('Greška pri napuštanju ture');
            alert('Tura je napuštena!');
            fetchExecution();
        } catch (err: any) {
            setError(err.message || 'Greška pri napuštanju ture');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Učitavanje...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => setError('')}>Pokušaj ponovo</button>
                </div>
            </div>
        );
    }

    if (!executionInfo) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">Nema informacija o izvršenju ture.</div>
            </div>
        );
    }

    const { execution, finished_keypoints } = executionInfo;
    const isFinished = ['completed', 'failed', 'aborted'].includes(execution.status);

    // Dynamic card color for tour status
    let tourCardClass = "card mb-4 ";
    if (execution.status === "completed") tourCardClass += "bg-success bg-opacity-25 border-success";
    else if (execution.status === "failed" || execution.status === "aborted") tourCardClass += "bg-danger bg-opacity-25 border-danger";
    else if (execution.status === "in_progress") tourCardClass += "bg-primary bg-opacity-10 border-primary";
    else tourCardClass += "bg-secondary bg-opacity-10 border-secondary";

    // Add isReached property to keyPoints for map rendering
    const reachedKeypointIds = execution.finished_keypoints?.map(fk => fk.keypoint_id) ?? [];
    const keyPointsWithReached = keyPoints.map(kp => ({
        ...kp,
        isReached: reachedKeypointIds.includes(kp.id)
    }));

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className={tourCardClass}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="mb-2">Izvršavanje Ture</h3>
                                <div>
                                    <h4 className="card-title">{tourInfo?.name}</h4>
                                    <p className="lead text-muted">{tourInfo?.description}</p>
                                </div>
                                <div>
                                    <strong>Status:</strong> <span className="badge bg-info text-dark">{execution.status}</span>
                                </div>
                                <div>
                                    <strong>Pokrenuta:</strong> {formatDate(execution.started_at)}
                                </div>
                                {(execution.status === "in_progress" || isFinished) && (
                                    <div>
                                        <strong>Posljednja aktivnost:</strong> {formatDate(execution.last_activity)}
                                    </div>
                                )}
                                {isFinished && (
                                    <div>
                                        <strong>Završena:</strong> {formatDate(execution.ended_at)}
                                    </div>
                                )}
                                {/* Difficulty and Tags */}
                                <div className="mt-3">
                                    <span className={`badge me-2 ${tourInfo?.difficulty === 'Easy' ? 'bg-success' :
                                        tourInfo?.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                                        }`}>
                                        {tourInfo?.difficulty}
                                    </span>

                                    {tourInfo?.tags && tourInfo.tags.map((tag, index) => (
                                        <span key={index} className="badge bg-secondary me-1">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {!isFinished && (
                                <button className="btn btn-danger" onClick={handleAbortTour}>Napusti turu</button>
                            )}
                        </div>
                    </div>

                    {/* Modal for location selection */}
                    {!isFinished && (
                        <>
                            <button
                                className="btn btn-primary mb-3"
                                onClick={() => setShowLocationSelection(true)}
                            >
                                Izaberi lokaciju na mapi
                            </button>

                            {showLocationSelection && (
                                <div className="modal d-block" tabIndex={-1}>
                                    <div className="modal-dialog modal-lg modal-dialog-centered">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h4 className="modal-title" id="locationModalLabel">
                                                    Mapa - Izbor Lokacije
                                                </h4>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setShowLocationSelection(false)}
                                                    aria-label="Close"
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <small className="text-muted">Osvježava se svakih 10 sekundi</small>
                                                <TourMap
                                                    mode="touristLocation"
                                                    // checkPoints={[]}
                                                    checkPoints={keyPointsWithReached}
                                                    onPickCoords={checkIfKeypointReached}
                                                />
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowLocationSelection(false)}
                                                >
                                                    Zatvori
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                        </>
                    )}

                    {/* Keypoints Section */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="mb-0">
                                Sve Ključne Tačke
                            </h3>
                        </div>
                        <div className="card-body">
                            {keyPoints && keyPoints.length > 0 ? (
                                <div className="row">
                                    {keyPoints.map((keypoint) => {
                                        const reached = execution.finished_keypoints?.find(fk => fk.keypoint_id === keypoint.id);
                                        const keypointCardClass = reached ? "card h-100 border-success bg-success bg-opacity-25" : "card h-100";
                                        return (
                                            <div key={keypoint.id} className="col-lg-6 col-xl-4 mb-3">
                                                <div className={keypointCardClass}>
                                                    {keypoint.imageUrl && (
                                                        <img
                                                            src={keypoint.imageUrl}
                                                            className="card-img-top"
                                                            alt={keypoint.name}
                                                            style={{ height: '150px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div className="card-body">
                                                        <h6 className="card-title">
                                                            {keypoint.ordinal}. {keypoint.name}
                                                        </h6>
                                                        <p className="card-text small">{keypoint.description}</p>
                                                        <h6 className="card-title">
                                                            Reached at {reached?.completed_at ? ` ${formatDate(reached.completed_at)}` : ' - Not reached yet'}
                                                        </h6>
                                                        <small className="text-muted">
                                                            Koordinate: {keypoint.latitude.toFixed(4)}, {keypoint.longitude.toFixed(4)}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (null)}
                        </div>
                    </div>
                    {/*Map section*/}
                    <div className="card shadow-sm border-0 mb-3">
                        <div className="card-body p-0">
                            <div className="ratio ratio-16x9">
                                <div className="bg-light d-flex align-items-center justify-content-center">
                                    <TourMap
                                        mode="view"
                                        checkPoints={keyPointsWithReached}
                                        onPickCoords={checkIfKeypointReached}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourExecutionPage;
