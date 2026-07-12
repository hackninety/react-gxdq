import { FIDELITY_LABELS, type Fidelity } from 'nhx-ts-lib';
import type { WuShu } from '../gx/taxonomy';

/** 保真度徽章（first-party 绿、transcript 蓝、attributed/third-party 橙灰） */
export function FidelityBadge({ f }: { f: Fidelity }) {
  return <span className={`badge fid-${f}`}>{FIDELITY_LABELS[f]}</span>;
}

export function WushuTag({ w, active, onClick }: { w: WuShu; active?: boolean; onClick?: () => void }) {
  return (
    <span className={`wushu wushu-${w}${active ? ' active' : ''}${onClick ? ' clickable' : ''}`} onClick={onClick}>
      {w}
    </span>
  );
}
