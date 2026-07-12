/**
 * 移动端交互验证 + 截图（puppeteer-core 连接系统 Chrome，真机仿真）：
 *   1. /materia 列表态（侧栏限高、正文可见）
 *   2. 点击「艾叶」→ 详情加载并自动滚动到 .main
 *   3. 汉堡 → 抽屉展开截图 → 点「文库」导航
 *   4. 品牌名点击回首页
 * 用法：node scripts/verify-mobile.mjs <输出目录>
 */
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5183';
const OUT = process.argv[2] ?? '.';
const shot = (name) => path.join(OUT, name);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const fail = (msg) => { console.error('FAIL:', msg); process.exitCode = 1; };
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 1. 方药穴列表态
  await page.goto(`${BASE}/materia`, { waitUntil: 'networkidle0', timeout: 60000 });
  const listState = await page.evaluate(() => ({
    sideH: Math.round(document.querySelector('.side').getBoundingClientRect().height),
    mainTop: Math.round(document.querySelector('.main').getBoundingClientRect().top),
    vh: innerHeight,
  }));
  console.log('materia 列表态:', JSON.stringify(listState));
  if (listState.mainTop > listState.vh) fail('主内容不在首屏');
  await page.screenshot({ path: shot('pp-materia-list.png') });

  // 2. 点击「艾叶」→ 详情 + 自动滚动
  await page.evaluate(() => {
    const li = [...document.querySelectorAll('.entity-list li')].find((x) => x.textContent.includes('艾叶'));
    li.click();
  });
  await page.waitForFunction(() => document.querySelector('.main .md')?.textContent.length > 50, { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900)); // smooth scroll 结束
  const detailState = await page.evaluate(() => ({
    mainTop: Math.round(document.querySelector('.main').getBoundingClientRect().top),
    hasRefs: !!document.querySelector('.refs'),
    title: document.querySelector('.main h2')?.textContent ?? '',
  }));
  console.log('艾叶详情态:', JSON.stringify(detailState));
  if (detailState.mainTop < -50 || detailState.mainTop > 200) fail(`选中后未滚动到详情（mainTop=${detailState.mainTop}）`);
  if (!detailState.title.includes('艾叶')) fail('详情标题不是艾叶');
  await page.screenshot({ path: shot('pp-materia-detail.png') });

  // 3. 抽屉
  await page.click('.nav-burger');
  await new Promise((r) => setTimeout(r, 500));
  const drawer = await page.evaluate(() => {
    const d = document.querySelector('.nav-drawer');
    return { left: Math.round(d.getBoundingClientRect().left), links: d.querySelectorAll('a').length };
  });
  console.log('抽屉展开:', JSON.stringify(drawer));
  if (drawer.left !== 0) fail(`抽屉未展开（left=${drawer.left}）`);
  await page.screenshot({ path: shot('pp-drawer-open.png') });
  await page.evaluate(() => {
    [...document.querySelectorAll('.nav-drawer a')].find((a) => a.textContent === '文库').click();
  });
  await page.waitForFunction(() => location.pathname === '/library', { timeout: 10000 });
  console.log('抽屉导航 → /library OK');

  // 4. 品牌回首页
  await page.click('.topnav .brand');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 10000 });
  const navLabels = await page.evaluate(() => [...document.querySelectorAll('.nav-inline a')].map((a) => a.textContent));
  console.log('品牌回首页 OK; 导航项:', JSON.stringify(navLabels));
  if (navLabels.includes('首页')) fail('导航仍含「首页」');

  console.log(process.exitCode ? 'verify FAILED' : 'verify ok');
} finally {
  await browser.close();
}
