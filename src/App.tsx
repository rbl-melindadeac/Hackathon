import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MapPage from './pages/MapPage';
import UnlocatedPage from './pages/UnlocatedPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>🗺️ PinDrop</h1>
          <nav>
            <Link to="/">Map</Link>
            <Link to="/unlocated">Unlocated Photos</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/unlocated" element={<UnlocatedPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>PinDrop - Transform geotagged photos into a shared world map</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
