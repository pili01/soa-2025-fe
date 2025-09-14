import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Message from "../components/Message";
import { createBlog as apiCreateBlog } from "../services/BlogService";

export default function CreateBlog() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string>(
    "# New blog post\n\nWrite with **Markdown**. Use the toolbar or keyboard shortcuts (Ctrl+B, Ctrl+I)."
  );

  const [showPreview, setShowPreview] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function wrapSelection(before: string, after = before) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;

    const hasSel = end > start;
    const selected = content.slice(start, end) || "text";

    const updated = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(updated);

    const caretStart = start + before.length;
    const caretEnd = caretStart + selected.length;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caretStart, caretEnd);
    });
  }

  function toggleInline(fmt: "bold" | "italic" | "code") {
    if (fmt === "bold") wrapSelection("**");
    if (fmt === "italic") wrapSelection("*");
    if (fmt === "code") wrapSelection("`");
  }

  function prefixLines(prefix: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;

    const startLine = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const endLine = content.indexOf("\n", end) === -1 ? content.length : content.indexOf("\n", end);

    const block = content.slice(startLine, endLine);
    const lines = block.split("\n");
    const out = lines
      .map((l) => (l.startsWith(prefix) ? l : prefix + l))
      .join("\n");

    const updated = content.slice(0, startLine) + out + content.slice(endLine);
    setContent(updated);

    const delta = out.length - block.length;
    requestAnimationFrame(() => {
      const newStart = start + (prefix.length);
      const newEnd = end + delta;
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }

  function addHeading(level: 1 | 2 | 3) {
    const hashes = "#".repeat(level) + " ";
    prefixLines(hashes);
  }

  function addQuote() {
    prefixLines("> ");
  }

  function addUl() {
    prefixLines("- ");
  }

  function addOl() {
    prefixLines("1. ");
  }

  function addCheckbox() {
    prefixLines("- [ ] ");
  }

  function addLink() {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const sel = content.slice(start, end);

    if (sel) {
      const before = `[${sel}](https://)`;
      const updated = content.slice(0, start) + before + content.slice(end);
      setContent(updated);
      requestAnimationFrame(() => {
        const pos = start + before.indexOf("https://");
        ta.focus();
        ta.setSelectionRange(pos, pos + "https://".length);
      });
    } else {
      const insertion = "[link text](https://)";
      const updated = content.slice(0, start) + insertion + content.slice(end);
      setContent(updated);
      requestAnimationFrame(() => {
        const pos = start + insertion.indexOf("link text");
        ta.focus();
        ta.setSelectionRange(pos, pos + "link text".length);
      });
    }
  }

  function onEditorKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleInline("bold");
      }
      if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        toggleInline("italic");
      }
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) return setErr("Naslov je obavezan.");
    if (!trimmedContent) return setErr("Sadržaj je obavezan.");

    try {
      setBusy(true);
      const res = await apiCreateBlog({ title: trimmedTitle, content: trimmedContent });
      const created: any = (res as any)?.data ?? res;

      setInfo("Blog je uspešno kreiran.");
      if (created?.id) {
        navigate(`/blog/${created.id}`);
      } else {
        navigate("/blogs");
      }
    } catch (e: any) {
      setErr("Kreiranje nije uspelo.");
    } finally {
      setBusy(false);
    }
  }

  function fillSample() {
    setTitle("{{$randomJobTitle}}");
    setContent("{{$randomPhrase}}\n\nThis supports **bold**, *italic*, `code`, lists, and more.");
  }

  const words = useMemo(() => (content.trim() ? content.trim().split(/\s+/).length : 0), [content]);

  return (
    <section className="container py-3">
      {err && <Message type="error" text={err} onClose={() => setErr("")} />} 
      {info && <Message type="success" text={info} onClose={() => setInfo("")} />} 

      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h3 mb-1">Create Blog</h1>
          <small className="text-secondary">Write in Markdown. Live preview on the right.</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button type="button" className="btn btn-outline-info btn-sm" onClick={fillSample} title="Fill with sample placeholders">
            Sample data
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              className="form-control"
              placeholder="Enter a concise title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          {/* Toolbar */}
          <div className="btn-toolbar mb-2" role="toolbar" aria-label="Markdown toolbar">
            <div className="btn-group btn-group-sm me-2" role="group" aria-label="Inline">
              <button type="button" className="btn btn-outline-secondary" onClick={() => toggleInline("bold")} title="Bold (Ctrl+B)"><strong>B</strong></button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => toggleInline("italic")} title="Italic (Ctrl+I)"><em>I</em></button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => toggleInline("code")} title="Inline code">{`</>`}</button>
            </div>
            <div className="btn-group btn-group-sm me-2" role="group" aria-label="Blocks">
              <button type="button" className="btn btn-outline-secondary" onClick={() => addHeading(1)} title="Heading 1">H1</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => addHeading(2)} title="Heading 2">H2</button>
              <button type="button" className="btn btn-outline-secondary" onClick={addQuote} title="Quote">“”</button>
            </div>
            <div className="btn-group btn-group-sm me-2" role="group" aria-label="Lists">
              <button type="button" className="btn btn-outline-secondary" onClick={addUl} title="Bulleted list">• List</button>
              <button type="button" className="btn btn-outline-secondary" onClick={addOl} title="Numbered list">1. List</button>
              <button type="button" className="btn btn-outline-secondary" onClick={addCheckbox} title="Task list">[ ]</button>
            </div>
            <div className="btn-group btn-group-sm" role="group" aria-label="Links">
              <button type="button" className="btn btn-outline-secondary" onClick={addLink} title="Insert link">🔗</button>
            </div>
            <div className="ms-auto small text-secondary d-none d-md-block" role="status" aria-live="polite">
              {words} words
            </div>
          </div>

          <div className="row g-3">
            <div className={showPreview ? "col-12 col-lg-6" : "col-12"}>
              <label htmlFor="content" className="form-label">Content (Markdown)</label>
              <textarea
                id="content"
                ref={taRef}
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onEditorKeyDown}
                rows={showPreview ? 16 : 22}
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
                placeholder="Start typing in Markdown..."
                required
              />
            </div>

            {showPreview && (
              <div className="col-12 col-lg-6">
                <label className="form-label">Preview</label>
                <div className="border rounded p-3 bg-white markdown-body" style={{ minHeight: 300, overflow: "auto" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card-footer bg-white d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-amber fw-bold" disabled={busy}>
            {busy ? "Saving…" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}

