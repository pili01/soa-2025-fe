import { useEffect, useMemo, useState } from "react";
import AuthService from "../services/AuthService";
import type { CreateReviewDto } from "../services/CreateTourService";

type AddReviewProps = {
  tourId: number;
  onCreated: (dto: CreateReviewDto, files: File[]) => void;
};

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 5;

export default function AddReview({ tourId, onCreated }: AddReviewProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [visitDate, setVisitDate] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthed = AuthService.isAuthenticated();

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach(u => URL.revokeObjectURL(u)), [previews]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = Array.from(e.target.files ?? []);
    if (!fl.length) return;
    if (fl.find(f => !f.type.startsWith("image/"))) return setError("Samo slike su dozvoljene.");
    if (fl.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)) return setError(`Maksimalna veličina slike je ${MAX_FILE_SIZE_MB}MB.`);
    if (files.length + fl.length > MAX_FILES) return setError(`Maksimalno ${MAX_FILES} slika po recenziji.`);
    setError(null);
    setFiles(prev => [...prev, ...fl]);
  };

  const removeFileAt = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthed) return setError("Morate biti prijavljeni da biste ostavili recenziju.");
    if (!rating || rating < 1 || rating > 5) return setError("Ocena mora biti između 1 i 5.");
    if (!visitDate) return setError("Unesite datum posete.");

    setSubmitting(true);
    setError(null);
    try {
      const dto: CreateReviewDto = {
        tourId,
        rating,
        comment,
        visitDate: new Date(visitDate).toISOString(),
      };
      onCreated(dto, files); // ⬅️ roditelj poziva servis (sa fajlovima!)

      setOpen(false);
      setRating(0);
      setComment("");
      setVisitDate("");
      setFiles([]);
    } catch (err: any) {
      setError(err?.message || "Greška pri pripremi recenzije.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={() => setOpen(true)} disabled={!isAuthed}>
          Napiši recenziju
        </button>
      </div>

      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }} onClick={() => !submitting && setOpen(false)}>
          <div className="bg-white rounded shadow p-3" style={{ width: "min(640px,95%)", maxHeight: "90vh", overflowY: "auto", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Dodaj recenziju</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => !submitting && setOpen(false)}>✕</button>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Ocena</label>
                <div>
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" className={`btn btn-sm ${i <= rating ? "btn-warning" : "btn-outline-secondary"} me-1`} onClick={() => setRating(i)}>★</button>
                  ))}
                  <span className="ms-2 text-muted">({rating || 0}/5)</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Datum posete</label>
                <input type="date" className="form-control" value={visitDate} onChange={e => setVisitDate(e.target.value)} max={new Date().toISOString().split("T")[0]} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Komentar</label>
                <textarea className="form-control" rows={4} value={comment} onChange={e => setComment(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Dodaj fotografije</label>
                <input type="file" className="form-control" accept="image/*" multiple onChange={handleFiles} />
                {files.length > 0 && (
                  <div className="mt-3">
                    <div className="row g-2">
                      {previews.map((src, i) => (
                        <div key={i} className="col-4 col-sm-3">
                          <div className="position-relative">
                            <img src={src} alt={`preview-${i}`} className="img-thumbnail" style={{ aspectRatio: "1/1", objectFit: "cover", width: "100%" }} />
                            <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={() => removeFileAt(i)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={() => !submitting && setOpen(false)}>Otkaži</button>
                <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? "Snima se…" : "Sačuvaj recenziju"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}