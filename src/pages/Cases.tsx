import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCaseGroups, getCaseIndex, getCaseMarkdown, findCases } from 'nhx-ts-lib/cases';
import { FidelityBadge } from '../components/badges';
import { Md } from '../components/Md';

/** 医案库：11 组 959 篇；索引即时过滤，正文按组分包懒加载 */
export default function Cases() {
  const [params, setParams] = useSearchParams();
  const group = params.get('group') ?? '';
  const sel = params.get('id') ?? '';
  const [q, setQ] = useState('');
  const [md, setMd] = useState<string>();

  const groups = getCaseGroups();
  const list = useMemo(
    () => (q ? findCases(q, { group: group || undefined, limit: 200 }) : getCaseIndex(group || undefined)),
    [q, group],
  );

  useEffect(() => {
    if (!sel) { setMd(undefined); return; }
    setMd(undefined);
    getCaseMarkdown(sel).then((s) => setMd(s ?? '（未找到）'));
  }, [sel]);

  return (
    <div className="page cols">
      <aside className="side">
        <select value={group} onChange={(e) => setParams(e.target.value ? { group: e.target.value } : {})}>
          <option value="">全部分组（{getCaseIndex().length}）</option>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.title}（{g.count}）</option>)}
        </select>
        <input className="search-box" placeholder="病名 / 日期 / 提要…" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="entity-list">
          {list.slice(0, 400).map((c) => (
            <li key={c.id} className={sel === c.id ? 'active' : ''}
              onClick={() => setParams(group ? { group, id: c.id } : { id: c.id })}>
              <b>{c.title}</b>
              {c.date && <span className="muted"> {c.date}</span>}
              {c.summary && <div className="muted snippet">{c.summary.slice(0, 44)}</div>}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main">
        {!sel && (
          <>
            <h2>倪海厦医案</h2>
            <p className="muted">2005–2008 诊疗日志为倪师亲笔（网站日记体），神州医料库编档为诊所记录第三方整理。</p>
            <ul className="doc-list">
              {groups.map((g) => (
                <li key={g.id}>
                  <a onClick={() => setParams({ group: g.id })} style={{ cursor: 'pointer' }}>{g.title}</a>
                  <span className="muted"> {g.count} 篇 </span>
                  <FidelityBadge f={g.fidelity} />
                </li>
              ))}
            </ul>
          </>
        )}
        {sel && (md === undefined ? <p className="muted">加载中…</p> : <Md src={md} />)}
      </main>
    </div>
  );
}
