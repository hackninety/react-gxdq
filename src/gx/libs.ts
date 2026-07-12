/**
 * 多语料库适配层 —— 把 *-ts-lib 家族统一为 GxDocMeta / LoadedLib 形状。
 *
 * 各库均动态 import（Vite 自动分包）：进入某文库才拉取该库索引；
 * 正文再按各库自身的分包机制二级懒加载。zslj 取文为同步 API，包一层 Promise 统一。
 */
import type { Fidelity } from 'nhx-ts-lib';
import { LIBS, type WuShu } from './taxonomy';

export interface GxDocMeta {
  lib: string;
  path: string;
  title: string;
  book: string;
  group?: string;
  dynasty?: string;
  author?: string;
  date?: string;
  series?: string;
  fidelity?: Fidelity;
}

export interface GxBookNode {
  key: string;
  name: string;
  count: number;
  dynasty?: string;
  /** nhx 专用：系列与分组（宿主树形侧栏） */
  series?: string;
  slug?: string;
  groups?: { id: string; title: string; count: number }[];
}

export interface LoadedLib {
  id: string;
  title: string;
  authorName: string;
  wushu: WuShu[];
  manifest: GxDocMeta[];
  books: GxBookNode[];
  doc: (path: string) => Promise<string | undefined>;
}

function booksFromManifest(manifest: GxDocMeta[]): GxBookNode[] {
  const order: string[] = [];
  const map = new Map<string, GxBookNode>();
  for (const m of manifest) {
    let b = map.get(m.book);
    if (!b) {
      b = { key: m.book, name: m.book, count: 0, dynasty: m.dynasty };
      map.set(m.book, b);
      order.push(m.book);
    }
    b.count++;
  }
  return order.map((k) => map.get(k)!);
}

const LOADERS: Record<string, () => Promise<LoadedLib>> = {
  nhx: async () => {
    const [docs, root] = await Promise.all([import('nhx-ts-lib/docs'), import('nhx-ts-lib')]);
    const manifest: GxDocMeta[] = docs.getDocsManifest().map((m) => ({
      lib: 'nhx', path: m.path, title: m.title, book: m.book,
      group: m.group, series: m.series, fidelity: m.fidelity, date: m.date, author: '倪海厦',
    }));
    const books: GxBookNode[] = root.getBooks().map((b) => ({
      key: b.slug, slug: b.slug, name: b.name, count: b.count, series: b.series,
      groups: b.groups.map((g) => ({ id: g.id, title: g.title, count: g.count })),
    }));
    return { ...info('nhx'), manifest, books, doc: (p) => docs.getDocMarkdown(p) };
  },
  lrdq: async () => {
    const docs = await import('lrdq-ts-lib/docs');
    const manifest: GxDocMeta[] = docs.getDocsManifest().map((m) => ({
      lib: 'lrdq', path: m.path, title: m.title, book: m.book,
      group: m.group, dynasty: m.dynasty, author: m.author,
    }));
    return { ...info('lrdq'), manifest, books: booksFromManifest(manifest), doc: (p) => docs.getDocMarkdown(p) };
  },
  qmdj: async () => {
    const docs = await import('qmdj-ts-lib/docs');
    const manifest: GxDocMeta[] = docs.getDocsManifest().map((m) => ({
      lib: 'qmdj', path: m.path, title: m.title, book: m.book,
      group: m.group, dynasty: m.dynasty, author: m.author,
    }));
    return { ...info('qmdj'), manifest, books: booksFromManifest(manifest), doc: (p) => docs.getDocMarkdown(p) };
  },
  zslj: async () => {
    const z = await import('zslj-ts-lib');
    const manifest: GxDocMeta[] = z.getDocsManifest().map((m) => ({
      lib: 'zslj', path: m.path, title: m.title, book: '占事略決',
      group: m.group, dynasty: '平安', author: '安倍晴明',
    }));
    return { ...info('zslj'), manifest, books: booksFromManifest(manifest), doc: async (p) => z.getDocMarkdown(p) };
  },
};

function info(id: string) {
  const l = LIBS.find((x) => x.id === id)!;
  return { id, title: l.title, authorName: l.authorName, wushu: l.wushu };
}

const cache = new Map<string, Promise<LoadedLib>>();

/** 加载某文库（索引级；重复调用走缓存） */
export function loadLib(id: string): Promise<LoadedLib> {
  let p = cache.get(id);
  if (!p) {
    const loader = LOADERS[id];
    if (!loader) return Promise.reject(new Error(`unknown lib: ${id}`));
    p = loader();
    cache.set(id, p);
  }
  return p;
}

/** 全部已装文库 */
export function loadInstalledLibs(): Promise<LoadedLib[]> {
  return Promise.all(LIBS.filter((l) => l.status === 'installed').map((l) => loadLib(l.id)));
}

/** 文档五术标签：nhx 走组级细分（taxonomy），其余承库级 */
export { wushuOfDoc as nhxWushuOfDoc } from './taxonomy';

/** lrdq/zslj 等库的 group 展示名 */
export const GROUP_LABEL: Record<string, string> = {
  book: '原文',
  algorithm: '算法说明',
};
