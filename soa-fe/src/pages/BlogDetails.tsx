import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById, getMyLikeStatus, toggleLike } from "../services/BlogService";
import "../styles/blog.scss";
import { Blog } from "../models/Blog";

type RouteParams = { id: string };

export default function BlogDetails() {
  const { id: idParam } = useParams<RouteParams>();
  const id = useMemo(() => Number.parseInt(idParam ?? "", 10), [idParam]);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const b = await getBlogById(id);
        setBlog(b);
        // status + count (traži auth)
        try {
          const s = await getMyLikeStatus(id);
          setLiked(s.liked);
          setLikesCount(s.count);
        } catch {
          // ako nije ulogovan, samo prikaži broj iz modela ili 0
          setLikesCount(b.likes ?? 0);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <section className="blog-details">Loading…</section>;
  if (!blog) return <section className="blog-details">Blog nije pronađen.</section>;

  const onLike = async () => {
    if (busy) return;
    // Ako već lajkovan, nema potrebe da šalješ "like"; koristi toggle samo kad menjaš stanje
    if (liked) return;
    setBusy(true);
    try {
      const res = await toggleLike(id);
      setLiked(res.liked);
      setLikesCount(res.count);
    } finally {
      setBusy(false);
    }
  };

  const onDislike = async () => {
    if (busy) return;
    // “Dislike” u ovom sistemu znači “unlike”
    if (!liked) return;
    setBusy(true);
    try {
      const res = await toggleLike(id);
      setLiked(res.liked);
      setLikesCount(res.count);
    } finally {
      setBusy(false);
    }
  };

  const authorName = blog.author
    ? `${blog.author.name ?? ""} ${blog.author.surname ?? ""}`.trim() || blog.author.username
    : `User #${blog.userId}`;

  return (
    <section className="blog-details">
      <div className="details-hero">
        <div className="overlay" />
        <div className="hero-text">
          <h1>{blog.title}</h1>
          <div className="meta">
            <div className="author">
              {blog.author?.photo_url && (
                <img src={blog.author.photo_url} alt={authorName} className="avatar" />
              )}
              <span>{authorName}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="content prose max-w-none">
        <p>{blog.content}</p>
      </article>

      <div className="details-actions">
        <button
          className={`action-btn like ${liked ? "is-active" : ""}`}
          onClick={onLike}
          disabled={busy || liked}
          title={liked ? "Već si lajkovao ovaj blog" : "Sviđa mi se"}
        >
          👍 <small>{likesCount}</small>
        </button>

        <button
          className={`action-btn dislike ${!liked ? "is-active" : ""}`}
          onClick={onDislike}
          disabled={busy || !liked}
          title={!liked ? "Nije lajkovan" : "Poništi like"}
        >
          👎
        </button>

        <Link to="/blogs" className="back-link">← Back to list</Link>
      </div>
    </section>
  );
}
