import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTranscriptBooks, getTranscriptChapter, type TranscriptChapter } from 'nhx-ts-lib/transcripts';

/** 人纪视频逐字稿：书 → 章 → 段（分包懒加载） */
export default function Transcripts() {
  const [params, setParams] = useSearchParams();
  const book = params.get('book') ?? '';
  const ch = params.get('ch') ?? '';
  const [chapter, setChapter] = useState<TranscriptChapter | 'loading' | undefined>();

  const books = getTranscriptBooks();
  const info = books.find((b) => b.book === book);

  useEffect(() => {
    if (!book || !ch) { setChapter(undefined); return; }
    setChapter('loading');
    getTranscriptChapter(book, ch).then((c) => setChapter(c));
  }, [book, ch]);

  return (
    <div className="page cols">
      <aside className="side">
        <select value={book} onChange={(e) => setParams(e.target.value ? { book: e.target.value } : {})}>
          <option value="">选择书目…</option>
          {books.map((b) => <option key={b.book} value={b.book}>{b.title}（{b.paraCount} 段）</option>)}
        </select>
        {info && (
          <ul className="entity-list">
            {info.chapters.map((c) => (
              <li key={c.id} className={ch === c.id ? 'active' : ''}
                onClick={() => setParams({ book, ch: c.id })}>
                {c.title} <span className="muted">{c.paras}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="main">
        {!book && (
          <>
            <h2>人纪视频逐字稿</h2>
            <p className="muted">重黎数据集 · 五部 6486 段 · 书/章/段三级，段落级出处，适合引用与 RAG。</p>
            <ul className="doc-list">
              {books.map((b) => (
                <li key={b.book}>
                  <a style={{ cursor: 'pointer' }} onClick={() => setParams({ book: b.book })}>{b.title}</a>
                  <span className="muted"> {b.chapters.length} 章 · {b.paraCount} 段</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {chapter === 'loading' && <p className="muted">加载分包中…</p>}
        {chapter && chapter !== 'loading' && (
          <>
            <h2>{info?.title} · {chapter.title}</h2>
            <div className="paras">
              {chapter.paras.map(([n, text]) => (
                <p key={n}><span className="para-no">{n}</span>{text}</p>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
