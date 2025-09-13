import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById, getMyLikeStatus, toggleLike, getComments, updateComment, deleteComment, createComment } from "../services/BlogService";
import "../styles/blog.scss";
import { Blog } from "../models/Blog";
import { Comment } from "../models/Comment";
import AuthService from "../services/AuthService";

type RouteParams = { id: string };

export default function BlogDetails() {
  const currentUserId = AuthService.getCurrentUserId ? AuthService.getCurrentUserId() : null;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const { id: idParam } = useParams<RouteParams>();
  const id = useMemo(() => Number.parseInt(idParam ?? "", 10), [idParam]);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [comments, setComments] = useState<Array<Comment>>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

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

          const allComments = await getComments(id); // Pretpostavimo da postoji funkcija za dobijanje komentara
          setComments(allComments);
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

      <div className="details-actions d-flex align-items-center">
        
        <button
          className="btn btn-sm btn-success ms-3"
          onClick={() => setAddModalOpen(true)}
        >
          Add Comment
        </button>

        <Link to="/blogs" className="back-link ms-3">← Back to list</Link>
      </div>

      {/* Add Comment Modal */}
      {addModalOpen && (
        <div className="modal show" style={{ display: 'block',background: 'rgba(0,0,0,0.3)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Comment</h5>
                <button type="button" className="btn-close" onClick={() => setAddModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  rows={3}
                  placeholder="Enter your comment..."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    if (newCommentText.trim()) {
                      const created = await createComment(id, newCommentText.trim());
                      setComments([...comments, created]);
                      setAddModalOpen(false);
                      setNewCommentText("");
                    }
                  }}
                >Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Comments section */}
      <div className="blog-details blog-comments mt-4 p-3 border rounded bg-dark">
        <h5 className="mb-3">Comments:</h5>
        {comments.length === 0 && <div className="text-muted">No comments yet.</div>}
        {comments.map(c => (
          <div key={c.id} className="mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center mb-1">
              <strong className="me-2">{c.authorUsername}</strong>
              <span className="text-muted" style={{ fontSize: '0.9em' }}>
                {new Date(c.createdAt).toLocaleString()}
              </span>
              {currentUserId && c.userId === currentUserId && (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() => {
                      setEditCommentId(c.id);
                      setEditCommentText(c.content);
                      setEditModalOpen(true);
                    }}
                  >Edit</button>
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this comment?")) {
                        await deleteComment(c.id);
                        setComments(comments.filter(com => com.id !== c.id));
                      }
                    }}
                  >Delete</button>
                </>
              )}
            </div>
            <div>{c.content}</div>
            {c.updatedAt && (
              <div className="text-muted" style={{ fontSize: '0.85em' }}>
                Edited: {new Date(c.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}

        {/* Edit Comment Modal */}
        {editModalOpen && (
          <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Comment</h5>
                  <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    value={editCommentText}
                    onChange={e => setEditCommentText(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={async () => {
                      if (editCommentId && editCommentText.trim()) {
                        const updated = await updateComment(editCommentId, editCommentText.trim());
                        console.log(updated.data)
                        setComments(comments.map(com => com.id === editCommentId ? { ...com, content: updated.data.content, updatedAt: updated.data.updatedAt } : com));
                        setEditModalOpen(false);
                      }
                    }}
                  >Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
