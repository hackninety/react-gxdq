import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GROUP_LABEL, loadLib, type GxDocMeta, type LoadedLib } from '../gx/libs';
import { LIBS, wushuOfDoc } from '../gx/taxonomy';
import { FidelityBadge, WushuTag } from '../components/badges';
import { Md } from '../components/Md';

const LIB_IDS = new Set(LIBS.map((l) => l.id));

/** 阅读器：/read/<lib>/<path>；旧链接 /read/<nhx-path> 自动按 nhx 解析 */
export default function Reader() {
  const { lib: libParam = 'nhx', '*': splat = '' } = useParams();
  // 兼容旧路由：首段不是文库 id 时视为 nhx 文档路径的一部分
  const [libId, path] = LIB_IDS.has(libParam) ? [libParam, splat] : ['nhx', `${libParam}/${splat}`];

  const [lib, setLib] = useState<LoadedLib>();
  const [md, setMd] = useState<string>();

  useEffect(() => {
    let on = true;
    loadLib(libId).then((l) => { if (on) setLib(l); });
    return () => { on = false; };
  }, [libId]);

  const meta: GxDocMeta | undefined = useMemo(
    () => lib?.manifest.find((m) => m.path === path),
    [lib, path],
  );

  const [prev, next] = useMemo(() => {
    if (!lib || !meta) return [undefined, undefined];
    const list = lib.manifest.filter((m) => m.book === meta.book);
    const i = list.findIndex((m) => m.path === path);
    return [list[i - 1], list[i + 1]];
  }, [lib, meta, path]);

  useEffect(() => {
    if (!lib) return;
    let on = true;
    setMd(undefined);
    lib.doc(path).then((s) => { if (on) setMd(s ?? '（未找到该篇目）'); });
    window.scrollTo(0, 0);
    return () => { on = false; };
  }, [lib, path]);

  const groupTitle = useMemo(() => {
    if (!lib || !meta?.group) return undefined;
    if (lib.id === 'nhx') {
      const book = lib.books.find((b) => meta.path.startsWith(b.slug! + '/'));
      return book?.groups?.find((g) => g.id === meta.group)?.title ?? meta.group;
    }
    return GROUP_LABEL[meta.group] ?? meta.group;
  }, [lib, meta]);

  return (
    <div className="page reader">
      {lib && meta && (
        <div className="crumbs">
          <Link to={`/library?${lib.id !== 'nhx' ? `lib=${lib.id}&` : ''}book=${encodeURIComponent(lib.id === 'nhx' ? meta.path.split('/')[0] : meta.book)}`}>
            {meta.series ? `${meta.series} · ` : ''}{meta.book}
          </Link>
          {groupTitle && <span className="muted"> / {groupTitle}</span>}
          {meta.dynasty && <span className="badge">{meta.dynasty}</span>}
          {meta.fidelity && <FidelityBadge f={meta.fidelity} />}
          {lib.id === 'nhx'
            ? wushuOfDoc({ path: meta.path, group: meta.group ?? '' } as never).map((w) => <WushuTag key={w} w={w} />)
            : lib.wushu.map((w) => <WushuTag key={w} w={w} />)}
          {meta.date && <span className="muted">{meta.date}</span>}
          {meta.author && lib.id !== 'nhx' && <span className="muted">{meta.author}</span>}
        </div>
      )}
      {md === undefined ? <p className="muted">加载中…</p> : <Md src={md} />}
      <div className="pager">
        {prev ? <Link to={`/read/${libId}/${prev.path}`}>← {prev.title}</Link> : <span />}
        {next ? <Link to={`/read/${libId}/${next.path}`}>{next.title} →</Link> : <span />}
      </div>
    </div>
  );
}
