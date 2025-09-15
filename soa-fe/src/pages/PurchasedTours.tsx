import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import ExecutionService from '../services/ExecutionService';
import { Tour, TourExecution, TourExecutionStatus } from '../models/Tour';
import * as CreateTourService from '../services/CreateTourService';

interface PurchasedTour {
    id: number;
    name: string;
    description: string;
    difficulty: string;
    tags: string[];
    price: number;
    status: TourExecutionStatus;
    started_at: string;
    ended_at: string;
    last_activity: string;
    tour_id: number;
    drivingStats: {
        distance: number;
        duration: number;
    };
    walkingStats: {
        distance: number;
        duration: number;
    };
    cyclingStats: {
        distance: number;
        duration: number;
    };
    firstKeypoint?: {
        imageUrl?: string;
    };
    purchased_at: string;
    executed: boolean;
    started?: boolean;
}

const PurchasedTours: React.FC = () => {
    const [tours, setTours] = useState<PurchasedTour[]>([]);
    const [executions, setExecutions] = useState<TourExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPurchasedTours();
    }, []);

    const fetchPurchasedTours = async () => {
        try {
            setLoading(true);
            setError('');
            const executions = await ExecutionService.getExecutions();
            console.log("Fetched executions:", executions);
            setExecutions(executions);
            const token = AuthService.getToken();
            if (!token) {
                setError('Niste prijavljeni');
                return;
            }
            const response = await fetch('http://localhost:8080/api/purchase/purchases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const updatedTours = (data.purchases || []).map((tour: PurchasedTour) => {
                const execution = executions.find(exec => exec.tour_id === tour.tour_id);
                return {
                    ...tour,
                    started: execution ? true : false,
                    executed: execution ? ['completed', 'failed', 'aborted'].includes(execution.status) : false,
                    status: execution ? execution.status : 'pending',
                    started_at: execution ? formatDate(execution.started_at) : '',
                    ended_at: execution ? formatDate(execution.ended_at) : '',
                    last_activity: execution ? formatDate(execution.last_activity) : '',
                }
            });
            console.log("Fetched purchased tours:", updatedTours);
            setTours(updatedTours);
            fetchToursData(updatedTours);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Greška pri učitavanju kupljenih tura');
        } finally {
            setLoading(false);
        }
    };

    const fetchToursData = async (updatedTours: PurchasedTour[]) => {
        try {
            setLoading(true);
            setError('');
            const detailedTours = await Promise.all(updatedTours.map(async (tour: PurchasedTour) => {
                const detailedTour = await CreateTourService.fetchTourInfo(tour.tour_id);
                console.log("Detail tour:", detailedTour);
                return {
                    ...tour,
                    name: detailedTour.tour.name,
                    description: detailedTour.tour.description,
                    difficulty: detailedTour.tour.difficulty,
                    tags: detailedTour.tour.tags,
                    drivingStats: detailedTour.tour.drivingStats,
                    walkingStats: detailedTour.tour.walkingStats,
                    cyclingStats: detailedTour.tour.cyclingStats,
                    firstKeypoint: detailedTour.keypoints && detailedTour.keypoints.length > 0
                        ? { imageUrl: detailedTour.keypoints[0].imageUrl }
                        : undefined,
                }
            }));
            console.log("Updated tours with details:", detailedTours);
            setTours(detailedTours);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Greška pri učitavanju izvršenih tura');
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (iso?: string | Date) => {
        if (!iso) return "";
        const d = typeof iso === "string" ? new Date(iso) : iso;
        if (isNaN(d.getTime())) return "";
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatDistance = (meters: number): string => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)}km`;
        }
        return `${meters}m`;
    };

    const handleStartTour = async (tourId: number) => {
        // Ovdje dodaj logiku za pokretanje ture (API poziv ili navigacija)
        // alert(`Pokrenuta tura sa ID: ${tourId}`);
        if (await ExecutionService.startTour(tourId)) {
            navigate(`/tour-execution/${tourId}`);
        } else {
            setError('Greška pri pokretanju ture');
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
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">Kupljene Ture</h2>
                    {tours.length === 0 ? (
                        <div className="alert alert-info">
                            Nemate kupljenih tura.
                        </div>
                    ) : (
                        <div className="row">
                            {tours.map((tour) => (
                                <div key={tour.id} className="col-lg-6 col-xl-4 mb-4">
                                    <div className="card h-100 shadow-sm">
                                        {tour.firstKeypoint?.imageUrl && (
                                            <img
                                                src={tour.firstKeypoint.imageUrl}
                                                className="card-img-top"
                                                alt={tour.name}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{tour.name}</h5>
                                            <p className="card-text text-muted">{tour.description}</p>
                                            <div className="mb-3">
                                                <span className={`badge me-2 ${tour.difficulty === 'Easy' ? 'bg-success' :
                                                    tour.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                    {tour.difficulty}
                                                </span>
                                                {tour.tags && tour.tags.map((tag: string, index: number) => (
                                                    <span key={index} className="badge bg-secondary me-1">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mb-3">
                                                <small className="text-muted">
                                                    <strong>Vožnja:</strong> {tour.drivingStats?.distance ? formatDistance(tour.drivingStats.distance) : 'N/A'} ({tour.drivingStats?.duration ? formatDuration(tour.drivingStats.duration) : 'N/A'})<br />
                                                    <strong>Hodanje:</strong> {tour.walkingStats?.distance ? formatDistance(tour.walkingStats.distance) : 'N/A'} ({tour.walkingStats?.duration ? formatDuration(tour.walkingStats.duration) : 'N/A'})<br />
                                                    <strong>Bicikl:</strong> {tour.cyclingStats?.distance ? formatDistance(tour.cyclingStats.distance) : 'N/A'} ({tour.cyclingStats?.duration ? formatDuration(tour.cyclingStats.duration) : 'N/A'})
                                                </small>
                                                <div className="mt-2">
                                                    <strong>Datum kupovine:</strong> {formatDate(tour.purchased_at)}
                                                </div>
                                            </div>
                                            <div className="mb-2">
                                                {!tour.started ? null : (
                                                    <div>
                                                        <strong>Status:</strong> <span className="badge bg-info text-dark">{tour.status}</span>
                                                        <div>
                                                            <strong>Pokrenuta:</strong> {tour.started_at}
                                                        </div>
                                                        {(tour.status === "in_progress" || tour.status === "completed" || tour.status === "failed" || tour.status === "aborted") && (
                                                            <div>
                                                                <strong>Posljednja aktivnost:</strong> {tour.last_activity}
                                                            </div>
                                                        )}
                                                        {(tour.status === "failed" || tour.status === "completed" || tour.status === "aborted") && (
                                                            <div>
                                                                <strong>Završena:</strong> {tour.ended_at}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-auto">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h4 className="text-primary mb-0">€{tour.price || 0}</h4>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => navigate(`/tour/${tour.tour_id}`)}
                                                        >
                                                            Pogledaj Detalje
                                                        </button>
                                                        {tour.status === 'in_progress' ? (
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => navigate(`/tour-execution/${tour.tour_id}`)}
                                                            >
                                                                Nastavi Turu
                                                            </button>
                                                        ) : null}
                                                        {tour.executed ? (
                                                            <button className="btn bg-secondary text-white fs-6"
                                                                onClick={() => navigate(`/tour-execution/${tour.tour_id}`)}>Detalji Izvršavanja</button>
                                                        ) : null}
                                                        {!tour.started && !tour.executed && (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleStartTour(tour.tour_id)}
                                                            >
                                                                Pokreni turu
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchasedTours;