import { useCallback, useState } from 'react';

type Props = { images: string[]; title?: string };

export default function ReviewGallery({ images = [], title }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const openAt = (i: number) => { setIdx(i); setOpen(true); };
  const close = useCallback(() => setOpen(false), []);

  if (!images.length) return null;

  const toImageUrl = (raw: string) => {
  try {
        const u = new URL(raw);
        const parts = u.pathname.split('/');
        const filename = parts[parts.length - 1];
        return `http://localhost:3001/api/images/review/${filename}`;
    } catch {
        return `http://localhost:8080/api/image/img/${raw}`;
    }
   };

  return (
    <div>
      {title && <h6 className="mb-2">{title}</h6>}
      <div className="row g-2">
        {images.map((filename, i) => (
          <div key={`${filename}-${i}`} className="col-6 col-md-4 col-lg-3">
            <button
              type="button"
              className="p-0 border-0 bg-transparent w-100"
              onClick={() => openAt(i)}
            >
              <img
                src={toImageUrl(filename)}
                alt={`Slika ${i + 1}`}
                className="img-fluid rounded"
                style={{ aspectRatio: '1/1', objectFit: 'cover', width: '100%' }}
              />
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
          onClick={close}
        >
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{ width: 'min(95vw,1100px)' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={toImageUrl(images[idx])}
              className="d-block w-100"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
