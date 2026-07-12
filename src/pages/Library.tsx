import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks, getBookManifest, type BookInfo } from 'nhx-ts-lib';
import { WUSHU, wushuOfBook, wushuOfDoc, type WuShu } from '../gx/taxonomy';
import { FidelityBadge, WushuTag } from '../components/badges';

/** 文库：作者 → 系列 → 书 → 分组 → 篇目，五术维度过滤 */
export default function Library() {
  const [params, setParams] = useSearchParams();
  const wushu = (params.get('wushu') as WuShu | null) ?? undefined;
  const [slug, setSlug] = useState(params.get('book') ?? '');
  const [group, setGroup] = useState('');

  const books = useMemo(() => {
    const all = getBooks();
    if (!wushu) return all;
    return all.filter((b) => wushuOfBook(b.slug, b.groups.map((g) => g.id)).includes(wushu));
  }, [wushu]);

  const current: BookInfo | undefined = books.find((b) => b.slug === slug) ?? books[0];
  const docs = useMemo(() => {
    if (!current) return [];
    let list = getBookManifest(current.slug);
    if (group) list = list.filter((d) => d.group === group);
    if (wushu) list = list.filter((d) => wushuOfDoc(d).includes(wushu));
    return list;
  }, [current, group, wushu]);

  return (
    <div className="page cols">
      <aside className="side">
        <div className="filter-row">
          {WUSHU.map((w) => (
            <WushuTag key={w.key} w={w.key} active={wushu === w.key}
              onClick={() => { setParams(wushu === w.key ? {} : { wushu: w.key }); setGroup(''); }} />
          ))}
        </div>
        <div className="tree">
          {['人纪', '天纪', '地纪', '讲演', '文集'].map((series) => {
            const sb = books.filter((b) => b.series === series);
            if (!sb.length) return null;
            return (
              <div key={series}>
                <div className="tree-series">{series}</div>
                {sb.map((b) => (
                  <div key={b.slug}>
                    <div className={`tree-book${current?.slug === b.slug ? ' active' : ''}`}
                      onClick={() => { setSlug(b.slug); setGroup(''); }}>
                      {b.name} <span className="muted">{b.count}</span>
                    </div>
                    {current?.slug === b.slug && b.groups.length > 1 && (
                      <div className="tree-groups">
                        <div className={`tree-group${!group ? ' active' : ''}`} onClick={() => setGroup('')}>全部</div>
                        {b.groups.map((g) => (
                          <div key={g.id} className={`tree-group${group === g.id ? ' active' : ''}`}
                            onClick={() => setGroup(g.id)}>
                            {g.title} <span className="muted">{g.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="main">
        {current && (
          <>
            <div className="main-head">
              <h2>{current.name}</h2>
              <FidelityBadge f={current.fidelity} />
              {wushuOfBook(current.slug, current.groups.map((g) => g.id)).map((w) => <WushuTag key={w} w={w} />)}
              <span className="muted">底本 {current.sourceRepo}</span>
            </div>
            <ul className="doc-list">
              {docs.map((d) => (
                <li key={d.path}>
                  <Link to={`/read/${d.path}`}>{d.title}</Link>
                  {d.date && <span className="muted"> {d.date}</span>}
                  <span className="muted group-label">{current.groups.find((g) => g.id === d.group)?.title}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
