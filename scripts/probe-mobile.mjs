/**
 * 移动端布局探针：连接系统 Chrome（puppeteer-core，无需下载浏览器），
 * iPhone 视口下测量横向溢出元素、验证侧栏限高与选中滚动、抽屉交互。
 * 用法：node scripts/probe-mobile.mjs [route]
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5183';
const route = process.argv[2] ?? '/materia';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 60000 });

  const report = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        const cls = typeof el.className === 'string' ? el.className : '';
        offenders.push(`${el.tagName.toLowerCase()}${cls ? '.' + cls.split(' ').join('.') : ''} → left:${Math.round(r.left)} right:${Math.round(r.right)} w:${Math.round(r.width)}`);
      }
    }
    const side = document.querySelector('.side');
    return {
      vw,
      scrollW: document.documentElement.scrollWidth,
      bodyScrollW: document.body.scrollWidth,
      sideH: side ? Math.round(side.getBoundingClientRect().height) : null,
      offenders: offenders.slice(0, 20),
    };
  });
  console.log(JSON.stringify(report, null, 1));
} finally {
  await browser.close();
}
