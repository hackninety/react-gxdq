import { useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Seal } from './components/Seal';
import { THEME_LABEL, useTheme } from './theme';
import Home from './pages/Home';
import Library from './pages/Library';
import Reader from './pages/Reader';
import Search from './pages/Search';
import Materia from './pages/Materia';
import Cases from './pages/Cases';
import Transcripts from './pages/Transcripts';
import Gua from './pages/Gua';
import Videos from './pages/Videos';

const NAV = [
  { to: '/library', label: '文库' },
  { to: '/search', label: '检索' },
  { to: '/materia', label: '方药穴' },
  { to: '/cases', label: '医案' },
  { to: '/transcripts', label: '逐字稿' },
  { to: '/gua', label: '六十四卦' },
  { to: '/videos', label: '视频' },
];

export default function App() {
  const { theme, cycle } = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const links = NAV.map((n) => (
    <NavLink key={n.to} to={n.to}
      onClick={() => setNavOpen(false)}
      className={({ isActive }) => (isActive ? 'active' : '')}>
      {n.label}
    </NavLink>
  ));
  return (
    <>
      <nav className="topnav">
        <button className="nav-burger" onClick={() => setNavOpen(true)} aria-label="打开菜单">☰</button>
        <Link className="brand" to="/" title="回到首页"><Seal text="国学" size={30} />国学大全</Link>
        <div className="nav-inline">{links}</div>
        <span className="spacer" />
        <button className="theme-btn" onClick={cycle}
          title={`当前「${THEME_LABEL[theme]}」· 点击切换主题`} aria-label="切换主题">
          ◐ {THEME_LABEL[theme]}
        </button>
      </nav>
      {/* 移动端抽屉：置于 nav 之外——topnav 的 backdrop-filter 会劫持 fixed 定位包含块 */}
      <div className={`nav-drawer${navOpen ? ' open' : ''}`} aria-hidden={!navOpen}>
        <Link className="brand" to="/" onClick={() => setNavOpen(false)}><Seal text="国学" size={26} />国学大全</Link>
        {links}
      </div>
      {navOpen && <div className="nav-scrim" onClick={() => setNavOpen(false)} aria-hidden />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/read/:lib/*" element={<Reader />} />
        <Route path="/search" element={<Search />} />
        <Route path="/materia" element={<Materia />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/gua" element={<Gua />} />
        <Route path="/videos" element={<Videos />} />
      </Routes>
    </>
  );
}
