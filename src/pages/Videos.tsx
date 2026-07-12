import { Link, useSearchParams } from 'react-router-dom';
import { bilibiliUrl, getVideoSeries, getVideoSourceInfo } from 'nhx-ts-lib/videos';

/** 视频课程：B 站直链索引（人纪五部 + 天纪，6 系列 139 集）；?s=<系列id> 直达 */
export default function Videos() {
  const series = getVideoSeries();
  const info = getVideoSourceInfo();
  const [params, setParams] = useSearchParams();
  const active = params.get('s') ?? series[0]?.id ?? '';
  const setActive = (id: string) => setParams(id === series[0]?.id ? {} : { s: id });
  const cur = series.find((s) => s.id === active) ?? series[0];

  return (
    <div className="page">
      <h2>视频课程 <span className="muted">Bilibili 直链 · {series.reduce((a, s) => a + s.episodes.length, 0)} 集</span></h2>
      <div className="tabs video-tabs">
        {series.map((s) => (
          <button key={s.id} className={cur?.id === s.id ? 'active' : ''} onClick={() => setActive(s.id)}>
            {s.title} <span className="muted">{s.episodes.length}</span>
          </button>
        ))}
      </div>

      {cur && (
        <>
          <div className="main-head">
            <h3 style={{ margin: 0 }}>倪海厦《{cur.title}》</h3>
            {cur.book && <Link className="btn" to={`/library?book=${cur.book}`}>对应讲稿 →</Link>}
            <a className="muted" href={cur.page} target="_blank" rel="noreferrer">来源页</a>
          </div>
          <div className="video-grid">
            {cur.episodes.map((e) => (
              <a key={e.bv} className="video-cell" href={bilibiliUrl(e.bv)} target="_blank" rel="noreferrer"
                title={`${e.title} · ${e.bv}`}>
                <span className="video-n">{String(e.n).padStart(2, '0')}</span>
                <span className="video-title">{e.title.replace(/^倪海厦/, '')}</span>
              </a>
            ))}
          </div>
        </>
      )}

      <p className="disclaimer">
        索引采集自 {info.source}（{info.collectedAt}），仅收录链接与集名；视频内容归 B 站上传者与权利人所有，点击将跳转至 bilibili.com。
      </p>
    </div>
  );
}
