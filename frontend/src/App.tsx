import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { PermissionsGate } from './components/PermissionsGate'
import { InstallPrompt } from './components/InstallPrompt'
import { Dashboard } from './components/Dashboard/Dashboard'
import { CameraScreen } from './components/Camera/CameraScreen'
import { HistoryScreen } from './components/History/HistoryScreen'
import { ResultScreen } from './components/ResultScreen'

function App() {
  return (
    <AuthGate>
      <PermissionsGate>
        <InstallPrompt />
        <BrowserRouter>
          <div className="app-container">
            {/* Top App Bar */}
            <header className="top-app-bar">
              <div className="top-app-bar-brand">
                <span className="material-symbols-outlined" style={{color: 'var(--c-blue)'}}>water_drop</span>
                HYDROTRACK
              </div>
              <button className="icon-button">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </header>

            <main className="app-main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/camera" element={<CameraScreen />} />
                <Route path="/result" element={<ResultScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
              </Routes>
            </main>

            {/* Bottom Nav */}
            <nav className="bottom-nav-bar">
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">home</span>
                HOME
              </NavLink>

              <NavLink to="/camera" className={({ isActive }) => `nav-item record ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">photo_camera</span>
                RECORD
              </NavLink>

              <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined">history</span>
                HISTORY
              </NavLink>
            </nav>
          </div>
        </BrowserRouter>
      </PermissionsGate>
    </AuthGate>
  )
}

export default App
