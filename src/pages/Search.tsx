import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { foldIncludes } from 'nhx-ts-lib';
import { findHerbs } from 'nhx-ts-lib/herbs';
import { findAcupoints } from 'nhx-ts-lib/acupoints';
import { findFormulas } from 'nhx-ts-lib/formulas';
import { findCases } from 'nhx-ts-lib/cases';
import { searchTranscripts, type TranscriptHit } from 'nhx-ts-lib/transcripts';
import { loadInstalledLibs, type GxDocMeta, type LoadedLib } from '../gx/libs';
import { LIBS } from '../gx/taxonomy';
import { FidelityBadge } from '../components/badges';

/** 跨库检索：四库篇目 + 方药穴医案索引即时命中；逐字稿全文为按需深检 */
export default function Search() {
  const [q, setQ] = useState('');
  const [deep, setDeep] = useState<TranscriptHit[] | 'loading' | undefined>();
  const [libs, setLibs] = useState<LoadedLib[]>();

  useEffect(() => {
    if (q && !libs) loadInstalledLibs().then(setLibs);
  }, [q, libs]);

  const docs = useMemo(() => {
    if (!q || !libs) return [] as GxDocMeta[];
    const out: GxDocMeta[] = [];
    for (const lib of libs) {
      let n = 0;
      for (const m of lib.manifest) {
        if (foldIncludes(`${m.title} ${m.book}`, q)) {
          out.push(m);
          if (++n >= 10) break;
        }
      }
    }
    return out;
  }, [q, libs]);

  const herbs = q ? findHerbs(q, { limit: 8 }) : [];
  const acus = q ? findAcupoints(q, { limit: 8 }) : [];
  const formulas = q ? findFormulas(q, { limit: 8 }) : [];
  const cases = q ? findCases(q, { limit: 12 }) : [];

  async function runDeep() {
    setDeep('loading');
    setDeep(await searchTranscripts(q, { limit: 20 }));
  }

  return (
    <div className="page">
      <h2>检索</h2>
      <input className="search-box" autoFocus placeholder="方剂 / 药 / 穴位 / 病名 / 卦名 / 篇目…（支持繁体输入）"
        value={q} onChange={(e) => { setQ(e.target.value); setDeep(undefined); }} />

      {q && (
        <div className="results">
          <section>
            <h3>四库篇目 <span className="muted">{!libs ? '加载中…' : docs.length}</span></h3>
            <ul className="doc-list">
              {docs.map((d) => (
                <li key={`${d.lib}/${d.path}`}>
                  <Link to={`/read/${d.lib}/${d.path}`}>{d.title}</Link>
                  <span className="muted"> 《{d.book}》{d.dynasty ? ` · ${d.dynasty}` : ''}</span>
                  <span className="badge">{LIBS.find((l) => l.id === d.lib)?.title}</span>
                  {d.fidelity && <FidelityBadge f={d.fidelity} />}
                </li>
              ))}
            </ul>
          </section>

          {(herbs.length + acus.length + formulas.length) > 0 && (
            <section>
              <h3>方 · 药 · 穴</h3>
              <ul className="doc-list">
                {formulas.map((f) => <li key={f.id}><Link to={`/materia?tab=formulas&id=${f.id}`}>{f.name}</Link><span className="muted"> 方剂 · {f.source ?? ''}</span></li>)}
                {herbs.map((h) => <li key={h.id}><Link to={`/materia?tab=herbs&id=${h.id}`}>{h.name}</Link><span className="muted"> 中药 · {h.category ?? ''}</span></li>)}
                {acus.map((a) => <li key={a.id}><Link to={`/materia?tab=acupoints&id=${a.id}`}>{a.name}</Link><span className="muted"> 穴位 · {a.meridian ?? ''}</span></li>)}
              </ul>
            </section>
          )}

          {cases.length > 0 && (
            <section>
              <h3>医案 <span className="muted">{cases.length}</span></h3>
              <ul className="doc-list">
                {cases.map((c) => (
                  <li key={c.id}><Link to={`/cases?id=${c.id}`}>{c.title}</Link>
                    {c.date && <span className="muted"> {c.date}</span>}
                    {c.summary && <span className="muted"> — {c.summary.slice(0, 40)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3>人纪逐字稿（深检）</h3>
            {deep === undefined && <button className="btn" onClick={runDeep}>在 6486 段逐字稿中检索「{q}」</button>}
            {deep === 'loading' && <p className="muted">加载逐字稿分包中…</p>}
            {Array.isArray(deep) && (
              <ul className="doc-list">
                {deep.map((h, i) => (
                  <li key={i}>
                    <Link to={`/transcripts?book=${h.book}&ch=${h.chapterId}`}>《{h.bookTitle}》{h.chapterTitle} #{h.para}</Link>
                    <div className="muted snippet">{h.text.slice(0, 100)}…</div>
                  </li>
                ))}
                {deep.length === 0 && <li className="muted">无命中</li>}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
