import { NavLink, Route, Routes } from 'react-router-dom';
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

const NAV = [
  { to: '/', label: '首页' },
  { to: '/library', label: '文库' },
  { to: '/search', label: '检索' },
  { to: '/materia', label: '方药穴' },
  { to: '/cases', label: '医案' },
  { to: '/transcripts', label: '逐字稿' },
  { to: '/gua', label: '六十四卦' },
];

export default function App() {
  const { theme, cycle } = useTheme();
  return (
    <>
      <nav className="topnav">
        <span className="brand"><Seal text="国学" size={30} />国学大全</span>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {n.label}
          </NavLink>
        ))}
        <span className="spacer" />
        <button className="theme-btn" onClick={cycle}
          title={`当前「${THEME_LABEL[theme]}」· 点击切换主题`} aria-label="切换主题">
          ◐ {THEME_LABEL[theme]}
        </button>
        <a className="muted navlib" href="https://github.com/hackninety?tab=repositories" target="_blank" rel="noreferrer">语料库 ×4</a>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/read/:lib/*" element={<Reader />} />
        <Route path="/search" element={<Search />} />
        <Route path="/materia" element={<Materia />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/gua" element={<Gua />} />
      </Routes>
    </>
  );
}
