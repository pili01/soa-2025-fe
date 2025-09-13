import { useEffect } from 'react';

type Props = {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
  duration?: number;
  onClose?: () => void;
};

export default function Message({ type, text, duration = 3000, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bsClass =
    type === 'error' ? 'alert-danger' :
    type === 'warning' ? 'alert-warning' :
    type === 'info' ? 'alert-info' : 'alert-success';

  return (
    <div
      className={`alert ${bsClass} alert-dismissible fade show position-fixed top-0 end-0 m-3 shadow`}
      role="alert"
      style={{ zIndex: 1080, minWidth: 280 }}
    >
      {text}
      <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
    </div>
  );
}
