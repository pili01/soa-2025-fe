import { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import { normalizeImageUrl } from '../utils/url';

type Props = {
  src: string;               // može biti relativno (npr. '/uploads/abc.jpg') ili absolute
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function SecureImage({ src, alt = '', className, style }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked: string | null = null;
    const ac = new AbortController();

    (async () => {
      try {
        const token = AuthService.getToken();
        const url = normalizeImageUrl(src);

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const local = URL.createObjectURL(blob);
        setBlobUrl(local);
        revoked = local;
        setFailed(false);
      } catch (e) {
        setFailed(true);
      }
    })();

    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
      ac.abort();
    };
  }, [src]);

  if (failed) {
    return (
      <div className="bg-light text-muted d-flex align-items-center justify-content-center"
           style={{ aspectRatio: '1 / 1', ...style }}>
        Nema slike
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="placeholder-glow" style={{ aspectRatio: '1 / 1', ...style }}>
        <span className="placeholder col-12" style={{ height: '100%', display: 'block' }} />
      </div>
    );
  }

  return <img src={blobUrl} alt={alt} className={className} style={style} />;
}
