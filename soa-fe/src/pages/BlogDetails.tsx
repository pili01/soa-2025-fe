import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBlogById,
  getMyLikeStatus,
  toggleLike,
  getComments,
  updateComment,
  deleteComment,
  createComment,
} from "../services/BlogService";
import AuthService from "../services/AuthService";
import { Blog } from "../models/Blog";
import { Comment } from "../models/Comment";
import Message from "../components/Message";
import "../styles/blog.scss";

type RouteParams = { id: string };

function authorFullName(b: Blog) {
  const full = `${b.author?.name ?? ""} ${b.author?.surname ?? ""}`.trim();
  return full || b.author?.username || `User #${b.userId}`;
}

function fmtDate(iso?: string | Date) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString();
}

export default function BlogDetails() {
  const currentUserId = AuthService.getCurrentUserId ? AuthService.getCurrentUserId() : null;

  const { id: idParam } = useParams<RouteParams>();
  const id = useMemo(() => Number.parseInt(idParam ?? "", 10), [idParam]);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBusy, setCommentBusy] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false);
      setErr("Neispravan ID bloga.");
      return;
    }

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const b = await getBlogById(id);
        setBlog(b);

        try {
          const s = await getMyLikeStatus(id);
          setLiked(s.liked);
          setLikesCount(s.count);
        } catch {
          setLikesCount(b.likes ?? 0);
        }

        try {
          const all = await getComments(id);
          setComments(all);
        } catch {
        }
      } catch {
        setErr("Blog nije pronađen ili je došlo do greške pri učitavanju.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleLike = async (isLike: boolean) => {
    if (likeBusy) return;
    if (!currentUserId) {
      setErr("Moraš biti prijavljen da bi lajkovao.");
      return;
    }
    if ((isLike && liked) || (!isLike && !liked)) return;
    setLikeBusy(true);
    try {
      const res = await toggleLike(id);
      setLiked(res.liked);
      setLikesCount(res.count);
    } catch {
      setErr("Nije uspelo menjanje like statusa.");
    } finally {
      setLikeBusy(false);
    }
  };

  const openEdit = (c: Comment) => {
    setEditCommentId(c.id);
    setEditCommentText(c.content);
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editCommentId) return;
    const txt = editCommentText.trim();
    if (!txt) return;
    try {
      setCommentBusy(true);
      const updated = await updateComment(editCommentId, txt);
      setComments((prev) =>
        prev.map((com) =>
          com.id === editCommentId
            ? { ...com, content: updated.data.content, updatedAt: updated.data.updatedAt }
            : com
        )
      );
      setEditModalOpen(false);
      setInfo("Komentar je izmenjen.");
    } catch {
      setErr("Izmena komentara nije uspela.");
    } finally {
      setCommentBusy(false);
    }
  };

  const removeComment = async (commentId: number) => {
    if (!window.confirm("Da li sigurno želiš da obrišeš komentar?")) return;
    try {
      setCommentBusy(true);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setInfo("Komentar je obrisan.");
    } catch {
      setErr("Brisanje komentara nije uspelo.");
    } finally {
      setCommentBusy(false);
    }
  };

  const submitNewComment = async () => {
    const txt = newCommentText.trim();
    if (!txt) return;
    if (!currentUserId) {
      setErr("Moraš biti prijavljen da bi ostavio komentar.");
      return;
    }
    try {
      setCommentBusy(true);
      const created = await createComment(id, txt);
      setComments((prev) => [...prev, created]);

      const fresh = await getComments(id);
      setComments(fresh);

      setNewCommentText("");
      setAddModalOpen(false);
      setInfo("Komentar je dodat.");
    } catch {
      setErr("Dodavanje komentara nije uspelo.");
    } finally {
      setCommentBusy(false);
    }
  };

  if (loading) {
    return (
      <section className="container py-3">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h1 className="h3 placeholder-glow mb-3">
              <span className="placeholder col-6"></span>
            </h1>
            <p className="placeholder-glow">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-6"></span>
              <span className="placeholder col-8"></span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!blog) {
    return (
      <section className="container py-3">
        <div className="alert alert-warning rounded-4 shadow-sm">Blog nije pronađen.</div>
      </section>
    );
  }

  const aName = authorFullName(blog);

  return (
    <section className="container py-3">
      {err && <Message type="error" text={err} onClose={() => setErr("")}/>} 
      {info && <Message type="success" text={info} onClose={() => setInfo("")}/>} 

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
        <div className="position-relative bg-dark text-white" style={{ minHeight: 160 }}>
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(135deg, rgba(0,0,0,.35), rgba(0,0,0,.6))" }} />
          <div className="position-relative p-4 p-md-5">
            <h1 className="display-6 mb-2">{blog.title}</h1>
            <div className="d-flex align-items-center gap-2 text-white-50">
              {blog.author?.photo_url && (
                <img
                  src={blog.author.photo_url}
                  alt={aName}
                  className="rounded-circle border"
                  style={{ width: 36, height: 36, objectFit: "cover" }}
                />
              )}
              <span>{aName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <article className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body">
              <div className="prose max-w-none">{blog.content}</div>
            </div>
            <div className="card-footer bg-white d-flex flex-wrap align-items-center gap-2">
              <div className="btn-group" role="group" aria-label="Likes">
                <button
                  className={`btn btn-outline-success ${liked ? "active" : ""}`}
                  onClick={() => handleLike(true)}
                  disabled={likeBusy || liked}
                  title={liked ? "Već si lajkovao ovaj blog" : "Sviđa mi se"}
                >
                  👍 <span className="ms-1 badge text-bg-light">{likesCount}</span>
                </button>
                <button
                  className={`btn btn-outline-secondary ${!liked ? "active" : ""}`}
                  onClick={() => handleLike(false)}
                  disabled={likeBusy || !liked}
                  title={!liked ? "Nije lajkovan" : "Poništi like"}
                >
                  👎
                </button>
              </div>
              <div className="ms-auto d-none d-md-block">
                <Link to="/blog" className="btn btn-amber fw-bold">← Back to list</Link>
              </div>
            </div>
          </article>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Comments</h5>
              <button
                className="btn btn-success btn-sm"
                onClick={() => setAddModalOpen(true)}
                disabled={!currentUserId || commentBusy}
                title={!currentUserId ? "Prijavi se da bi ostavio komentar" : "Add comment"}
              >
                + Add Comment
              </button>
            </div>
            <div className="card-body">
              {comments.length === 0 && (
                <div className="text-muted">No comments yet.</div>
              )}
              {comments.length > 0 && (
                <ul className="list-group list-group-flush">
                  {comments.map((c) => (
                    <li key={c.id} className="list-group-item px-0">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong>{c.authorUsername}</strong>
                            <small className="text-muted">{fmtDate(c.createdAt)}</small>
                          </div>
                          <div className="mt-1">{c.content}</div>
                          {c.updatedAt && (
                            <div className="text-muted" style={{ fontSize: ".85em" }}>
                              Edited: {fmtDate(c.updatedAt)}
                            </div>
                          )}
                        </div>
                        {currentUserId && c.userId === currentUserId && (
                          <div className="ms-3 d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => openEdit(c)} disabled={commentBusy}>
                              Edit
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => removeComment(c.id)} disabled={commentBusy}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <h6 className="text-secondary text-uppercase mb-2">About the author</h6>
              <div className="d-flex align-items-center gap-3">
                {blog.author?.photo_url && (
                  <img
                    src={blog.author.photo_url}
                    alt={aName}
                    className="rounded-circle border"
                    style={{ width: 48, height: 48, objectFit: "cover" }}
                  />
                )}
                <div>
                  <div className="fw-semibold">{aName}</div>
                  <small className="text-muted">Author</small>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white">
              <Link to="/blog" className="btn btn-outline-secondary w-100">← Back to list</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Comment Modal */}
      {addModalOpen && (
        <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
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
                  onChange={(e) => setNewCommentText(e.target.value)}
                  rows={3}
                  placeholder="Enter your comment..."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitNewComment} disabled={commentBusy || !newCommentText.trim()}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Comment Modal */}
      {editModalOpen && (
        <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.3)" }}>
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
                  onChange={(e) => setEditCommentText(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveEdit}
                  disabled={commentBusy || !editCommentText.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
