import { useEffect, useMemo, useState, useCallback } from "react";
import type { TourReview } from "../models/Tour";

type GalleryProps = {
  reviews: TourReview[];       // iz ovoga čitamo review.imageUrls
  title?: string;
};

type Photo = {
  url: string;
  alt: string;
  reviewId: number;
  rating: number;
  touristId: number;
  dateISO: string;
};

export default function Gallery({ reviews, title = "Galerija" }: GalleryProps) {
  // Izvuci sve fotke iz recenzija (ravnanje nizova)
    const photos = useMemo<Photo[]>(
    () =>
        (reviews ?? []).flatMap((r) =>
        (r.imageUrls ?? []).map((url, idx) => ({
            url,
            alt: r.comment?.trim() || `Fotografija ${idx + 1}`,
            reviewId: r.id,
            rating: r.rating,
            touristId: r.touristId,
            // ✨ normalizacija: uvek string
            dateISO:
            typeof (r as any).commentDate === 'string'
                ? (r as any).commentDate
                : new Date((r as any).commentDate).toISOString(),
        }))
        ),
    [reviews]
    );

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const count = photos.length;

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % count);
  }, [count]);

  // Keyboard: ESC/←/→
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, prev, next]);

  if (count === 0) {
    return (
      <div className="text-center text-muted py-3">
        Nema fotografija za prikaz.
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">{title}</h5>
        <small className="text-muted">{count} fotografij{count === 1 ? "a" : (count < 5 ? "e" : "a")}</small>
      </div>

      {/* Grid — 2/3/4 kolone po širini */}
      <div className="row g-2">
        {photos.map((p, i) => (
          <div key={`${p.reviewId}-${i}`} className="col-6 col-md-4 col-lg-3">
            <button
              type="button"
              onClick={() => openAt(i)}
              className="p-0 border-0 bg-transparent w-100"
              style={{ cursor: "zoom-in" }}
              aria-label={`Otvori sliku ${i + 1}`}
            >
              <img
                src={p.url}
                alt={p.alt}
                className="img-fluid rounded"
                style={{ aspectRatio: "1 / 1", objectFit: "cover", width: "100%" }}
                loading="lazy"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.85)", zIndex: 1080 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Pregled fotografije"
        >
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{ width: "min(95vw, 1100px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Slika */}
            <div className="bg-dark rounded overflow-hidden shadow">
              <img
                src={photos[idx].url}
                alt={photos[idx].alt}
                className="d-block w-100"
                style={{ maxHeight: "80vh", objectFit: "contain" }}
              />
            </div>

            {/* Caption */}
            <div className="d-flex justify-content-between align-items-center text-white-50 mt-2">
              <div className="small">
                <strong className="text-white">{idx + 1}/{count}</strong>{" "}
                · {photos[idx].rating}★ · Turista {photos[idx].touristId} ·{" "}
                {new Date(photos[idx].dateISO).toLocaleDateString()}
              </div>
              <div className="d-flex align-items-center gap-2">
                <a href={photos[idx].url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-light">
                  Otvori original
                </a>
                <button className="btn btn-sm btn-outline-light" onClick={close} aria-label="Zatvori">
                  Zatvori ✕
                </button>
              </div>
            </div>

            {/* Strelice */}
            {count > 1 && (
              <>
                <button
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2"
                  onClick={prev}
                  aria-label="Prethodna"
                >
                  ‹
                </button>
                <button
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={next}
                  aria-label="Sledeća"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
