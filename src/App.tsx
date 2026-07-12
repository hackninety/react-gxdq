import { NavLink, Route, Routes } from 'react-router-dom';
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
  return (
    <>
      <nav className="topnav">
        <span className="brand">国学大全</span>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {n.label}
          </NavLink>
        ))}
        <span className="spacer" />
        <a className="muted" href="https://github.com/hackninety/nhx-ts-lib" target="_blank" rel="noreferrer">nhx-ts-lib v0.1.0</a>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/read/*" element={<Reader />} />
        <Route path="/search" element={<Search />} />
        <Route path="/materia" element={<Materia />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/gua" element={<Gua />} />
      </Routes>
    </>
  );
}
