/**
 * 国学大全 —— 分类模型：作者 × 五术（山医命卜相）
 *
 * 检索与分析的两条主轴：
 *   作者：语料库以作者/流派为单位接入（现有倪海厦文库；lrdq/zslj/qmdj 待接）
 *   五术：山（修养/练功）医（方药针灸）命（紫微/四柱/星座）卜（易卦/占断）相（手面相/堪舆）
 *
 * 分类落在「书/分组」粒度：wushuOfDoc(meta) 由 path 前缀（slug 与 slug/group）求值。
 */
import type { DocMeta } from 'nhx-ts-lib';

export type WuShu = '山' | '医' | '命' | '卜' | '相';

export const WUSHU: { key: WuShu; label: string; desc: string }[] = [
  { key: '山', label: '山 · 修养', desc: '导引练功、养生修行' },
  { key: '医', label: '医 · 方药', desc: '经方、针灸、本草、医案' },
  { key: '命', label: '命 · 禄命', desc: '紫微斗数、四柱、星座' },
  { key: '卜', label: '卜 · 占断', desc: '易经卦理、六神占断' },
  { key: '相', label: '相 · 形法', desc: '手相面相、地脉堪舆' },
];

export interface AuthorInfo {
  id: string;
  name: string;
  era: string;
  bio: string;
}

export const AUTHORS: AuthorInfo[] = [
  {
    id: 'nihaixia',
    name: '倪海厦',
    era: '1954–2012',
    bio: '美国执业中医师，生于台湾，创办佛罗里达汉唐中医诊所。以《人纪》（针灸/内经/本草/伤寒/金匮）与《天纪》（易经/紫微/风水）系列课程闻名，主张经方派中医与天人合一的五术体系。',
  },
];

/** 语料库注册表（多库并册：现装 nhx，其余为路线图占位） */
export interface CorpusLib {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  status: 'installed' | 'planned';
  wushu: WuShu[];
  repo: string;
  note?: string;
}

export const LIBS: CorpusLib[] = [
  {
    id: 'nhx', title: '倪海厦文库', authorId: 'nihaixia', authorName: '倪海厦',
    status: 'installed', wushu: ['医', '命', '卜', '相', '山'],
    repo: 'github:hackninety/nhx-ts-lib',
    note: '14 书 936 篇讲稿 · 959 医案 · 415 药 411 穴 113 方 · 逐字稿 6486 段 · 64 卦',
  },
  {
    id: 'lrdq', title: '大六壬典籍', authorId: 'guji', authorName: '古籍多家',
    status: 'planned', wushu: ['卜'], repo: 'github:hackninety/lrdq-ts-lib',
    note: '《六壬大全》《六壬心镜》《六壬指南》与毕法检测引擎',
  },
  {
    id: 'zslj', title: '占事略決', authorId: 'abeseimei', authorName: '安倍晴明',
    status: 'planned', wushu: ['卜'], repo: 'github:hackninety/zslj-ts-lib',
  },
  {
    id: 'qmdj', title: '奇门遁甲', authorId: 'guji', authorName: '古籍多家',
    status: 'planned', wushu: ['卜'], repo: 'github:hackninety/qmdj-ts-lib',
  },
];

/** nhx 书级五术归类（组级细分见 GROUP_WUSHU，优先命中） */
const BOOK_WUSHU: Record<string, WuShu[]> = {
  zhenjiu: ['医'], neijing: ['医'], bencao: ['医'], shanghan: ['医'], jingui: ['医'],
  bimen: ['医'], fulu: ['医'], jiangzuo: ['医'], zhuanti: ['医'], fangjie: ['医'],
  tianji: ['命', '卜', '相'], zimu: ['命', '卜', '相'],
  diji: ['命', '相'], // 地纪遗稿：历史地理与命理互证
  xiangxue: ['相'],
};

/** 组级细分（`slug/group` 键） */
const GROUP_WUSHU: Record<string, WuShu[]> = {
  'tianji/01-tianjidao': ['卜', '命'],
  'tianji/02-ziwei': ['命'],
  'tianji/02-ziwei-gong': ['命'],
  'tianji/02-ziwei-anli': ['命'],
  'tianji/03-dimai': ['相'],
  'tianji/04-renjian': ['卜'],
  'tianji/05-kanyu': ['相'],
  'tianji/06-liushen': ['卜'],
  'tianji/07-shouxiang': ['相'],
  'tianji/08-sizhu': ['命'],
  'tianji/09-guina': ['命', '卜'],
  'tianji/10-xingzuo': ['命'],
  'jingui/liangong': ['山', '医'], // 练功方法归「山」
};

/** 求某篇讲稿的五术标签 */
export function wushuOfDoc(meta: DocMeta): WuShu[] {
  const slug = meta.path.split('/')[0];
  return GROUP_WUSHU[`${slug}/${meta.group}`] ?? BOOK_WUSHU[slug] ?? [];
}

/** 求某书（slug）的五术标签（并集） */
export function wushuOfBook(slug: string, groupIds: string[]): WuShu[] {
  const set = new Set<WuShu>();
  for (const g of groupIds) for (const w of GROUP_WUSHU[`${slug}/${g}`] ?? []) set.add(w);
  for (const w of BOOK_WUSHU[slug] ?? []) set.add(w);
  return WUSHU.map((x) => x.key).filter((k) => set.has(k));
}

/** 结构化分支的五术归属（方药穴/医案/逐字稿=医，64卦=卜） */
export const BRANCH_WUSHU: Record<string, WuShu[]> = {
  herbs: ['医'], acupoints: ['医'], formulas: ['医'], cases: ['医'], transcripts: ['医'], gua: ['卜'],
};
