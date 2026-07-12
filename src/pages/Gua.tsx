import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGua64, type GuaEntry } from 'nhx-ts-lib/gua';
import { Md } from '../components/Md';

/** 天纪 64 卦：8×8 卦阵 + 详解 */
export default function Gua() {
  const [params, setParams] = useSearchParams();
  const no = Number(params.get('no') ?? 0);
  const [gua, setGua] = useState<GuaEntry[]>();

  useEffect(() => { getGua64().then(setGua); }, []);
  const sel = gua?.find((g) => g.no === no);

  return (
    <div className="page">
      <h2>天纪 · 六十四卦详解 <span className="muted">《人间道》倪师逐卦讲解</span></h2>
      {!gua && <p className="muted">加载中…</p>}
      {gua && (
        <div className="gua-grid">
          {gua.map((g) => (
            <div key={g.no} className={`gua-cell${no === g.no ? ' active' : ''}`}
              onClick={() => setParams({ no: String(g.no) })}>
              <span className="gua-symbol">{g.symbol}</span>
              <span className="gua-name">{g.no} {g.name}</span>
            </div>
          ))}
        </div>
      )}
      {sel && (
        <div className="gua-detail">
          <h3>{sel.symbol} {sel.name}（第 {sel.no} 卦）</h3>
          <Md src={sel.md} />
        </div>
      )}
    </div>
  );
}
