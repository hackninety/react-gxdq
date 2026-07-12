import { Link } from 'react-router-dom';
import { DISCLAIMER, getBooks, getCorpusStats } from 'nhx-ts-lib';
import { AUTHORS, LIBS, WUSHU } from '../gx/taxonomy';
import { WushuTag } from '../components/badges';

export default function Home() {
  const stats = getCorpusStats() as { docsTotal: number; casesTotal: number; structured: Record<string, number>; transcripts: Record<string, number>; gua: number };
  const paraTotal = Object.values(stats.transcripts).reduce((a, b) => a + b, 0);
  const books = getBooks();

  return (
    <div className="page">
      <section className="hero">
        <h1>国学大全</h1>
        <p className="sub">按 <b>作者</b> 与 <b>五术（山·医·命·卜·相）</b> 归类的国学语料检索与分析平台</p>
        <div className="stat-row">
          <Link className="stat" to="/library"><b>{stats.docsTotal}</b><span>讲稿篇目 · {books.length} 书</span></Link>
          <Link className="stat" to="/cases"><b>{stats.casesTotal}</b><span>医案</span></Link>
          <Link className="stat" to="/materia"><b>{stats.structured.herbs + stats.structured.acupoints + stats.structured.formulas}</b><span>药 · 穴 · 方</span></Link>
          <Link className="stat" to="/transcripts"><b>{paraTotal}</b><span>逐字稿段落</span></Link>
          <Link className="stat" to="/gua"><b>{stats.gua}</b><span>卦解</span></Link>
        </div>
      </section>

      <section>
        <h2>五术门类</h2>
        <div className="cards">
          {WUSHU.map((w) => (
            <Link key={w.key} className="card" to={`/library?wushu=${w.key}`}>
              <div className="card-head"><WushuTag w={w.key} /> <b>{w.label}</b></div>
              <p>{w.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>作者文库</h2>
        <div className="cards">
          {LIBS.map((lib) => (
            <div key={lib.id} className={`card ${lib.status}`}>
              <div className="card-head">
                <b>{lib.title}</b>
                <span className="muted">{lib.authorName}</span>
                {lib.status === 'planned' && <span className="badge planned">待接入</span>}
              </div>
              <p>{lib.note ?? lib.repo}</p>
              <div>{lib.wushu.map((w) => <WushuTag key={w} w={w} />)}</div>
              {lib.status === 'installed' && <Link className="btn" to="/library">进入文库 →</Link>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>作者</h2>
        {AUTHORS.map((a) => (
          <div key={a.id} className="card">
            <div className="card-head"><b>{a.name}</b><span className="muted">{a.era}</span></div>
            <p>{a.bio}</p>
          </div>
        ))}
      </section>

      <footer className="disclaimer">{DISCLAIMER}</footer>
    </div>
  );
}
