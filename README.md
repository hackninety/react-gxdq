# react-gxdq · 国学大全

按 **作者** 与 **五术（山·医·命·卜·相）** 两条主轴归类国学语料，做检索与分析的前端平台。
Vite + React + TypeScript，语料以 `*-ts-lib` 语料库形式接入（manifest 同步索引 +
载荷分包懒加载，36 个 chunk 按需拉取，首屏仅 ~200KB gzip）。

## 已接入语料库（均为 GitHub tag 固定引入，无本地路径依赖）

| 库 | 作者 | 内容 | 五术 |
|---|---|---|---|
| [nhx-ts-lib](https://github.com/hackninety/nhx-ts-lib) `#v0.1.0` | 倪海厦 | 14 书 936 篇讲稿 · 959 医案 · 415 药 411 穴 113 方 · 人纪逐字稿 6486 段 · 64 卦 | 医 命 卜 相 山 |
| [lrdq-ts-lib](https://github.com/hackninety/lrdq-ts-lib) `#v0.11.0` | 古籍多家 | 《六壬大全》（明·四库本）《六壬心镜》（唐）《六壬指南注解》 28 篇 | 卜 |
| [zslj-ts-lib](https://github.com/hackninety/zslj-ts-lib) `#v0.2.1` | 安倍晴明 | 《占事略決》原典合订本（983 年顷）+ 算法说明 | 卜 |
| [qmdj-ts-lib](https://github.com/hackninety/qmdj-ts-lib) `#v0.1.1` | 古籍多家 | 《奇门遁甲秘笈大全》三十卷 + 金函玉镜残卷，33 篇 | 卜 |

多库适配层见 `src/gx/libs.ts`（统一 GxDocMeta 形状、按库动态分包）；
新库接入 = taxonomy 注册表加一行 + libs.ts 加一个 loader。

## 页面

- **首页** 语料规模总览、五术门类导航、作者文库卡片
- **文库** 作者→系列→书→分组树，五术维度过滤，篇目直达阅读器
- **阅读器** `/read/<path>` markdown 渲染，保真度徽章（倪师亲笔/整理稿/逐字稿/存疑），书内上下篇
- **检索** 跨分支：篇目/方/药/穴/医案 同步即时命中 + 逐字稿 6486 段按需深检（支持繁体输入，繁简折叠）
- **方药穴** 三库过滤（分类/经络/出处），详情带人纪原文引用（页码可溯源）
- **医案** 11 组过滤 + 病名/日期/提要检索，正文分组懒加载
- **逐字稿** 书→章→段浏览
- **六十四卦** 8×8 卦阵 + 倪师逐卦详解

## 开发

```bash
npm install        # 会从 GitHub 拉取并构建 nhx-ts-lib（一次性，稍慢）
npm run dev        # http://localhost:5173
npm run build
npx vite-node@3 scripts/smoke-ssr.tsx   # 无头路由冒烟
```

## 分类模型

`src/gx/taxonomy.ts`：五术标签落在「书/分组」粒度（如 天纪/紫微斗数→命、
天纪/堪舆学→相、金匮/练功方法→山），`wushuOfDoc(meta)` 对任意篇目求标签；
作者与语料库注册表为多库并册预留。

内容许可与免责声明随语料库（CC BY-NC 4.0，非医疗建议），见 nhx-ts-lib LICENSE。
