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
          <div className="flex-1 flex flex-col h-screen">
            {/* Top App Bar */}
            <header className="fixed top-0 w-full z-50 bg-[#FFFBE6] border-b-[3px] border-black flex justify-between items-center px-5 h-16">
              <div className="flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0448FF">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                </svg>
                <h1 className="text-xl font-black uppercase tracking-widest text-black">HYDROTRACK</h1>
              </div>
              <button className="w-9 h-9 flex items-center justify-center border-[3px] border-black hover:bg-[#FDD400] active:translate-x-[2px] active:translate-y-[2px] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </header>

            <main className="flex-1 overflow-y-auto pt-16 pb-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/camera" element={<CameraScreen />} />
                <Route path="/result" element={<ResultScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
              </Routes>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full z-50 bg-[#FFFBE6] border-t-[3px] border-black flex items-stretch h-20">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:translate-y-[2px] ${isActive ? 'bg-[#FDD400]' : 'hover:bg-[#FFFBE6]'}`
                }
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                HOME
              </NavLink>

              <NavLink
                to="/camera"
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:translate-y-[2px] ${isActive ? 'bg-[#0448FF] text-white' : 'bg-[#0448FF] text-white hover:bg-[#003ee3]'}`
                }
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M12 7A5 5 0 0 0 7 12a5 5 0 0 0 5 5 5 5 0 0 0 5-5A5 5 0 0 0 12 7M2 4.27L3.28 3 20 19.72 18.73 21l-3.08-3.08C14.53 18.28 13.3 18.5 12 18.5c-5 0-9.27-3.11-11-7.5.69-1.76 1.79-3.31 3.19-4.54L2 4.27m9.27.23C11.5 4.5 11.75 4.5 12 4.5c5 0 9.27 3.11 11 7.5a11.79 11.79 0 0 1-4 5.19l-1.42-1.43A9.862 9.862 0 0 0 20.82 12c-1.73-4.39-6-7.5-11-7.5-.7 0-1.37.08-2 .2L6.38 3.26A11.36 11.36 0 0 1 11.27 4.5z"/>
                </svg>
                RECORD
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-1 font-black text-[10px] uppercase tracking-wider transition-all active:translate-y-[2px] ${isActive ? 'bg-[#FDD400]' : 'hover:bg-[#FFFBE6]'}`
                }
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>
                </svg>
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
