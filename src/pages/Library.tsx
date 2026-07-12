import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GROUP_LABEL, loadLib, type LoadedLib } from '../gx/libs';
import { LIBS, WUSHU, wushuOfBook, wushuOfDoc, type WuShu } from '../gx/taxonomy';
import { FidelityBadge, WushuTag } from '../components/badges';

/** 文库：文库切换 →（nhx：系列→书→分组树；古籍库：书目树）→ 篇目，五术过滤 */
export default function Library() {
  const [params, setParams] = useSearchParams();
  const libId = params.get('lib') ?? 'nhx';
  const wushu = (params.get('wushu') as WuShu | null) ?? undefined;
  const bookKey = params.get('book') ?? '';
  const [group, setGroup] = useState('');
  const [lib, setLib] = useState<LoadedLib>();

  useEffect(() => {
    let on = true;
    setLib(undefined);
    loadLib(libId).then((l) => { if (on) setLib(l); });
    return () => { on = false; };
  }, [libId]);

  const setP = (patch: Record<string, string>) => {
    const next: Record<string, string> = {};
    if (wushu) next.wushu = wushu;
    if (libId !== 'nhx') next.lib = libId;
    Object.assign(next, patch);
    for (const k of Object.keys(next)) if (!next[k]) delete next[k];
    setParams(next);
  };

  const libTabs = useMemo(
    () => LIBS.filter((l) => l.status === 'installed' && (!wushu || l.wushu.includes(wushu))),
    [wushu],
  );

  const isNhx = lib?.id === 'nhx';
  const current = useMemo(() => {
    if (!lib) return undefined;
    let books = lib.books;
    if (isNhx && wushu) {
      books = books.filter((b) => wushuOfBook(b.slug!, (b.groups ?? []).map((g) => g.id)).includes(wushu));
    }
    return books.find((b) => b.key === bookKey) ?? books[0];
  }, [lib, bookKey, isNhx, wushu]);

  const docs = useMemo(() => {
    if (!lib || !current) return [];
    let list = lib.manifest.filter((d) => (isNhx ? d.path.startsWith(current.slug! + '/') : d.book === current.name));
    if (isNhx && group) list = list.filter((d) => d.group === group);
    if (isNhx && wushu) list = list.filter((d) => wushuOfDoc({ path: d.path, group: d.group ?? '' } as never).includes(wushu));
    return list;
  }, [lib, current, group, wushu, isNhx]);

  return (
    <div className="page cols">
      <aside className="side">
        <div className="filter-row">
          {WUSHU.map((w) => (
            <WushuTag key={w.key} w={w.key} active={wushu === w.key}
              onClick={() => setParams(wushu === w.key ? (libId !== 'nhx' ? { lib: libId } : {}) : { wushu: w.key, ...(libId !== 'nhx' ? { lib: libId } : {}) })} />
          ))}
        </div>
        <div className="lib-tabs">
          {libTabs.map((l) => (
            <button key={l.id} className={l.id === libId ? 'active' : ''}
              onClick={() => setParams({ ...(wushu ? { wushu } : {}), ...(l.id !== 'nhx' ? { lib: l.id } : {}) })}>
              {l.title}
              <span className="muted">{l.authorName}</span>
            </button>
          ))}
        </div>

        {!lib && <p className="muted">加载文库索引…</p>}

        {lib && isNhx && (
          <div className="tree">
            {['人纪', '天纪', '地纪', '讲演', '文集'].map((series) => {
              const sb = lib.books.filter((b) => b.series === series
                && (!wushu || wushuOfBook(b.slug!, (b.groups ?? []).map((g) => g.id)).includes(wushu)));
              if (!sb.length) return null;
              return (
                <div key={series}>
                  <div className="tree-series">{series}</div>
                  {sb.map((b) => (
                    <div key={b.key}>
                      <div className={`tree-book${current?.key === b.key ? ' active' : ''}`}
                        onClick={() => { setP({ book: b.key }); setGroup(''); }}>
                        {b.name} <span className="muted">{b.count}</span>
                      </div>
                      {current?.key === b.key && (b.groups?.length ?? 0) > 1 && (
                        <div className="tree-groups">
                          <div className={`tree-group${!group ? ' active' : ''}`} onClick={() => setGroup('')}>全部</div>
                          {b.groups!.map((g) => (
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
        )}

        {lib && !isNhx && (
          <div className="tree">
            <div className="tree-series">{lib.title}</div>
            {lib.books.map((b) => (
              <div key={b.key} className={`tree-book${current?.key === b.key ? ' active' : ''}`}
                onClick={() => setP({ book: b.key })}>
                {b.name} <span className="muted">{b.count}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      <main className="main">
        {lib && current && (
          <>
            <div className="main-head">
              <h2>{current.name}</h2>
              {current.dynasty && <span className="badge">{current.dynasty}</span>}
              {docs[0]?.fidelity && <FidelityBadge f={docs[0].fidelity} />}
              {isNhx
                ? wushuOfBook(current.slug!, (current.groups ?? []).map((g) => g.id)).map((w) => <WushuTag key={w} w={w} />)
                : lib.wushu.map((w) => <WushuTag key={w} w={w} />)}
              <span className="muted">{LIBS.find((l) => l.id === lib.id)?.repo}</span>
            </div>
            <ul className="doc-list">
              {docs.map((d) => (
                <li key={d.path}>
                  <Link to={`/read/${lib.id}/${d.path}`}>{d.title}</Link>
                  {d.date && <span className="muted"> {d.date}</span>}
                  {d.author && !isNhx && <span className="muted"> {d.author}</span>}
                  <span className="muted group-label">
                    {isNhx
                      ? current.groups?.find((g) => g.id === d.group)?.title
                      : (d.group && (GROUP_LABEL[d.group] ?? d.group))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
