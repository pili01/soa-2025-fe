import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBlogs, getBlogLikesCount } from "../services/BlogService";
import { Blog } from "../models/Blog";
import Message from "../components/Message";
import { getBlogsForMe, getBlogLikesCount } from "../services/BlogService";
import "../styles/blog.scss";

type BlogWithCounts = Blog & { likes?: number };

const PAGE_SIZE = 8;

function safeAuthorName(b: Blog) {
  const full = `${b.author?.name ?? ""} ${b.author?.surname ?? ""}`.trim();
  return full || b.author?.username || `User #${b.userId}`;
}
function formatDate(iso?: string | Date) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString();
}
function excerpt(text?: string, max = 140) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogWithCounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const base = await getBlogsForMe(); // Blog[]
        // dopuni broj lajkova (ako backend već ne vraća)
        const withCounts = await Promise.all(
          base.map(async (b) => {
            try {
              const count = await getBlogLikesCount(b.id);
              return { ...b, likes: count };
            } catch {
              return { ...b, likes: b.likes ?? 0 };
            }
          })
        );
        setBlogs(withCounts);
      } catch {
        setErr("Nešto je pošlo naopako pri učitavanju blogova.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil(blogs.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return blogs.slice(start, start + PAGE_SIZE);
  }, [blogs, page]);

  return (
    <section className="container py-3" aria-busy={loading}>

      {err && <Message type="error" text={err} onClose={() => setErr("")} />}
      {info && <Message type="success" text={info} onClose={() => setInfo("")} />}

      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h1 className="h2 mb-1 text-dark">Blog</h1>
          <p className="text-secondary mb-0">Dobrodošao u Travel application.</p>
        </div>
        <div className="d-none d-lg-block">
          <Link to="/blogs/create" className="btn btn-amber fw-bold">
            + Kreiraj blog
          </Link>
        </div>
      </div>

      {loading && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col" key={i}>
              <div className="card h-100 shadow-sm rounded-4">
                <div className="card-body">
                  <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </h5>
                  <p className="card-text placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-4"></span>
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-8"></span>
                  </p>
                </div>
                <div className="card-footer bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="placeholder col-3"></span>
                    <span className="btn btn-amber disabled placeholder col-3"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && blogs.length === 0 && (
        <div className="card border-0 shadow-sm rounded-4 text-center my-4">
          <div className="card-body py-5">
            <h3 className="h4 fw-bold text-dark mb-2">Nema blogova (još)</h3>
            <p className="text-secondary mb-3">
              Započni zajednicu — napiši svoj prvi blog post.
            </p>
            <Link to="/blogs/create" className="btn btn-amber fw-bold">
              + Kreiraj blog
            </Link>
          </div>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
            {paged.map((b) => (
              <div className="col" key={b.id}>
                <div className="card h-100 shadow-sm rounded-4">
                  <div className="card-body">
                    <h3 className="h4 card-title mb-2">
                      <Link to={`/blog/${b.id}`} className="stretched-link text-decoration-none text-dark fw-bold">
                        {b.title}
                      </Link>
                    </h3>

                    {b.content && (
                      <p className="card-text text-secondary mb-3">{excerpt(b.content)}</p>
                    )}

                    <div className="d-flex justify-content-between align-items-center text-secondary small">
                      <div className="d-flex align-items-center gap-2">
                        {b.author?.photo_url && (
                          <img
                            src={b.author.photo_url}
                            alt={safeAuthorName(b)}
                            className="rounded-circle border"
                            style={{ width: 26, height: 26, objectFit: "cover" }}
                            loading="lazy"
                          />
                        )}
                        <span>{safeAuthorName(b)}</span>
                      </div>
                      <span>{formatDate(b.createdAt as any)}</span>
                    </div>
                  </div>

                  <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <button className="btn btn-outline-success btn-sm rounded-pill px-3" disabled aria-label="Like">
                        <span className="me-2">👍</span>
                        <small className="fw-bold">{b.likes ?? 0}</small>
                      </button>
                      <Link to={`/blog/${b.id}`} className="btn btn-amber fw-bold">
                        Read
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="d-flex justify-content-center my-3" aria-label="Paginacija">
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  ← Prethodna
                </button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  Strana {page} / {totalPages}
                </span>
              </li>
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  Sledeća →
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      <button
        className="btn btn-amber rounded-circle position-fixed d-lg-none"
        style={{ right: 16, bottom: 16, width: 56, height: 56, fontWeight: 900 }}
        aria-label="Kreiraj blog"
        title="Kreiraj blog"
        onClick={() => navigate("/blogs/create")}
      >
        +
      </button>
    </section>
  );
}
