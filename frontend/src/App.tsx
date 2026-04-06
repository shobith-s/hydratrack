import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { PermissionsGate } from './components/PermissionsGate'
import { InstallPrompt } from './components/InstallPrompt'
import { Dashboard } from './components/Dashboard/Dashboard'
import { CameraScreen } from './components/Camera/CameraScreen'
import { HistoryScreen } from './components/History/HistoryScreen'

function App() {
  return (
    <AuthGate>
      <PermissionsGate>
        <InstallPrompt />
        <BrowserRouter>
          <div className="flex-1 flex flex-col h-screen">
            <main className="flex-1 overflow-y-auto pb-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/camera" element={<CameraScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
              </Routes>
            </main>
            
            <nav className="fixed bottom-0 w-full bg-white border-t-[3px] border-black p-4 flex justify-around">
              <Link to="/" className="font-bold border-[3px] border-transparent hover:border-black px-4 py-2 hover:bg-[#F6FA70]">Home</Link>
              <Link to="/camera" className="font-bold border-[3px] border-transparent hover:border-black px-4 py-2 hover:bg-[#F6FA70]">Drink</Link>
              <Link to="/history" className="font-bold border-[3px] border-transparent hover:border-black px-4 py-2 hover:bg-[#F6FA70]">History</Link>
            </nav>
          </div>
        </BrowserRouter>
      </PermissionsGate>
    </AuthGate>
  )
}

export default App
