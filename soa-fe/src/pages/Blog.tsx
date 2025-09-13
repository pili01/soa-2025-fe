import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs, getBlogLikesCount } from "../services/BlogService";
import "../styles/blog.scss";
import { Blog } from "../models/Blog";

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const base = await getBlogs(); // Blog[]
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="blog-page">
      <header className="blog-header">
        <h1 className="blog-title">Blog</h1>
        <p className="blog-subtitle">Dobrodošao u Travel application.</p>
      </header>

      {loading && <div className="blog-skeleton">Loading…</div>}

      <div className="blog-grid">
        {blogs.map((b) => (
          <article key={b.id} className="blog-card">
            <div className="blog-card__body">
              <h3 className="blog-card__title">
                <Link to={`/blog/${b.id}`} className="blog-card__link">
                  {b.title}
                </Link>
              </h3>

              <div className="blog-card__meta">
                <div className="blog-card__author">
                  {b.author?.photo_url && (
                    <img
                      src={b.author.photo_url}
                      alt={`${b.author.name ?? ""} ${b.author.surname ?? ""}`.trim() || b.author.username}
                      className="avatar"
                    />
                  )}
                  <span>
                    {b.author
                      ? `${b.author.name ?? ""} ${b.author.surname ?? ""}`.trim() || b.author.username
                      : `User #${b.userId}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="blog-card__actions">
              <button className="action-btn like" aria-label="Like" disabled>
                <span>👍</span>
                <small>{b.likes ?? 0}</small>
              </button>
              <Link to={`/blog/${b.id}`} className="read-more">Read</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
