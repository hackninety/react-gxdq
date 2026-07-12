import { useCallback, useEffect, useState } from 'react';

/** 三档主题：瓷（护眼青瓷，默认）→ 雪（明亮）→ 玄（墨夜） */
export type ThemeName = 'ci' | 'xue' | 'xuan';
export const THEME_ORDER: ThemeName[] = ['ci', 'xue', 'xuan'];
export const THEME_LABEL: Record<ThemeName, string> = { ci: '瓷', xue: '雪', xuan: '玄' };

const KEY = 'gxdq.theme';

function readStored(): ThemeName {
  if (typeof window === 'undefined') return 'ci';
  const t = localStorage.getItem(KEY);
  return t === 'xue' || t === 'xuan' ? t : 'ci';
}

/** 主题状态：写入 <html data-theme> 并持久化（index.html 有防闪烁预置脚本） */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(readStored);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((t) => THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length]);
  }, []);

  return { theme, cycle };
}
