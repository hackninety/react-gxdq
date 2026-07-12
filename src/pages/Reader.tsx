import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookManifest, getDocMarkdown, getDocsManifest } from 'nhx-ts-lib';
import { wushuOfDoc } from '../gx/taxonomy';
import { FidelityBadge, WushuTag } from '../components/badges';
import { Md } from '../components/Md';

/** 阅读器：/read/<slug>/<group>/<file>，带保真度徽章与上一篇/下一篇 */
export default function Reader() {
  const { '*': path = '' } = useParams();
  const [md, setMd] = useState<string>();
  const meta = useMemo(() => getDocsManifest().find((m) => m.path === path), [path]);

  const [prev, next] = useMemo(() => {
    if (!meta) return [undefined, undefined];
    const list = getBookManifest(path.split('/')[0]);
    const i = list.findIndex((m) => m.path === path);
    return [list[i - 1], list[i + 1]];
  }, [meta, path]);

  useEffect(() => {
    setMd(undefined);
    getDocMarkdown(path).then((s) => setMd(s ?? '（未找到该篇目）'));
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="page reader">
      {meta && (
        <div className="crumbs">
          <Link to={`/library?book=${path.split('/')[0]}`}>{meta.series} · {meta.book}</Link>
          <span className="muted"> / {meta.group}</span>
          <FidelityBadge f={meta.fidelity} />
          {wushuOfDoc(meta).map((w) => <WushuTag key={w} w={w} />)}
          {meta.date && <span className="muted">{meta.date}</span>}
        </div>
      )}
      {md === undefined ? <p className="muted">加载中…</p> : <Md src={md} />}
      <div className="pager">
        {prev ? <Link to={`/read/${prev.path}`}>← {prev.title}</Link> : <span />}
        {next ? <Link to={`/read/${next.path}`}>{next.title} →</Link> : <span />}
      </div>
    </div>
  );
}
