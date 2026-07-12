/**
 * 无头冒烟：renderToString 渲染主要路由，验证 React 组件与 nhx-ts-lib 集成
 * 用法：npx --yes vite-node@3 scripts/smoke-ssr.tsx
 * （effect 不执行，Md/DOMPurify 等浏览器侧逻辑不在此覆盖范围）
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createElement } from 'react';
import App from '../src/App';

/** 路由 → 渲染后必须包含的关键字（交互/懒加载页面只验证骨架） */
const routes: [string, string][] = [
  ['/', '五术门类'],
  // 文库索引经 useEffect 异步加载，SSR 仅验证文库切换骨架
  ['/library', '倪海厦文库'],
  ['/library?lib=lrdq', '大六壬典籍'],
  ['/library?lib=zslj', '占事略決'],
  ['/library?wushu=医', '倪海厦文库'],
  ['/search', '检索'],
  ['/materia', '中药'],
  ['/cases', '倪海厦医案'],
  ['/transcripts', '人纪视频逐字稿'],
  ['/gua', '六十四卦'],
];
let fail = 0;
for (const [path, expect] of routes) {
  try {
    const html = renderToString(
      createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)),
    );
    const ok = html.includes('国学大全') && html.includes(expect);
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${path} → ${html.length} chars（含「${expect}」：${html.includes(expect)}）`);
    if (!ok) fail++;
  } catch (e) {
    console.error(`FAIL ${path}:`, (e as Error).message);
    fail++;
  }
}
if (fail) process.exit(1);
console.log('smoke ok: all routes rendered');
