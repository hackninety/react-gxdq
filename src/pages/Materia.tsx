import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHerbs, getHerb, type HerbMeta } from 'nhx-ts-lib/herbs';
import { getAcupoints, getAcupoint, getMeridians } from 'nhx-ts-lib/acupoints';
import { getFormulas, getFormula } from 'nhx-ts-lib/formulas';
import type { EntryBody, SourceRef } from 'nhx-ts-lib';
import { foldIncludes } from 'nhx-ts-lib';
import { Link } from 'react-router-dom';
import { Md } from '../components/Md';

type Tab = 'herbs' | 'acupoints' | 'formulas';
const TABS: { id: Tab; label: string }[] = [
  { id: 'herbs', label: `中药 ${getHerbs().length}` },
  { id: 'acupoints', label: `穴位 ${getAcupoints().length}` },
  { id: 'formulas', label: `方剂 ${getFormulas().length}` },
];

function Refs({ refs }: { refs: SourceRef[] }) {
  if (!refs.length) return null;
  return (
    <details className="refs" open>
      <summary>人纪原文引用（{refs.length}）</summary>
      {refs.map((r, i) => (
        <blockquote key={i}>
          {r.quote}
          <div className="muted">—— {r.file}{r.page != null && ` · 第 ${r.page} 页`}</div>
        </blockquote>
      ))}
    </details>
  );
}

/** 方药穴三库：同步索引过滤 + 详情懒加载（正文 + 原文引用） */
export default function Materia() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) ?? 'herbs';
  const sel = params.get('id') ?? '';
  const [q, setQ] = useState('');
  const [meridian, setMeridian] = useState('');
  const [detail, setDetail] = useState<(Record<string, unknown> & EntryBody) | undefined>();

  const list = useMemo(() => {
    const match = (hay: string) => !q || foldIncludes(hay, q);
    if (tab === 'herbs') {
      return getHerbs().filter((h) => match(`${h.name}${h.category ?? ''}${h.gongxiao ?? ''}${h.zhuzhi ?? ''}`)).map((h) => ({ id: h.id, name: h.name, sub: h.category ?? h.source ?? '' }));
    }
    if (tab === 'acupoints') {
      return getAcupoints()
        .filter((a) => (!meridian || a.meridian === meridian) && match(`${a.name}${a.meridian ?? ''}${a.effect ?? ''}`))
        .map((a) => ({ id: a.id, name: a.name, sub: a.meridian ?? '' }));
    }
    return getFormulas().filter((f) => match(`${f.name}${f.source ?? ''}${f.category ?? ''}`)).map((f) => ({ id: f.id, name: f.name, sub: `${f.source ?? ''} ${f.category ?? ''}` }));
  }, [tab, q, meridian]);

  useEffect(() => {
    if (!sel) { setDetail(undefined); return; }
    setDetail(undefined);
    const load = tab === 'herbs' ? getHerb(sel) : tab === 'acupoints' ? getAcupoint(sel) : getFormula(sel);
    load.then((d) => setDetail(d as never));
  }, [tab, sel]);

  const herbMeta = tab === 'herbs' && detail ? (detail as unknown as HerbMeta) : undefined;

  return (
    <div className="page cols">
      <aside className="side">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''}
              onClick={() => setParams({ tab: t.id })}>{t.label}</button>
          ))}
        </div>
        <input className="search-box" placeholder="过滤（支持繁体）…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tab === 'acupoints' && (
          <select value={meridian} onChange={(e) => setMeridian(e.target.value)}>
            <option value="">全部经络</option>
            {getMeridians().map((m) => <option key={m.meridian} value={m.meridian}>{m.meridian}（{m.count}）</option>)}
          </select>
        )}
        <ul className="entity-list">
          {list.map((e) => (
            <li key={e.id} className={sel === e.id ? 'active' : ''}
              onClick={() => setParams({ tab, id: e.id })}>
              <b>{e.name}</b> <span className="muted">{e.sub}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main">
        {!sel && <p className="muted">← 选择条目查看详情（正文与人纪原文引用按需加载）</p>}
        {sel && detail === undefined && <p className="muted">加载中…</p>}
        {detail && (
          <>
            <div className="main-head">
              <h2>{String(detail.name ?? sel)}</h2>
              {'xingwei' in detail && detail.xingwei != null && <span className="badge">{String(detail.xingwei)}</span>}
              {'meridian' in detail && detail.meridian != null && <span className="badge">{String(detail.meridian)}</span>}
              {'source' in detail && detail.source != null && <span className="badge">{String(detail.source)}</span>}
              {'code' in detail && detail.code != null && <span className="badge">{String(detail.code)}</span>}
            </div>
            {herbMeta?.guijing && <p className="muted">归经：{herbMeta.guijing}{herbMeta.gongxiao && ` ｜ 功效：${herbMeta.gongxiao}`}</p>}
            {herbMeta?.zhuzhi && <p className="muted">主治：{herbMeta.zhuzhi}</p>}
            {herbMeta?.bencaoDoc && <p><Link className="btn" to={`/read/${herbMeta.bencaoDoc}`}>查看《神农本草经》倪师讲稿 →</Link></p>}
            <Md src={detail.md} />
            <Refs refs={detail.refs} />
          </>
        )}
      </main>
    </div>
  );
}
