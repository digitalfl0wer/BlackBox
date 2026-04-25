import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { getScreenComponent } from './routing/getScreenComponent'

const Welcome = getScreenComponent('Welcome')
const KinfolkSetup = getScreenComponent('KinfolkSetup')
const Kinfolk = getScreenComponent('Kinfolk')
const Home = getScreenComponent('Home')
const ActiveSession = getScreenComponent('ActiveSession')
const EndSession = getScreenComponent('EndSession')
const ReflectionLoading = getScreenComponent('ReflectionLoading')
const ReflectionView = getScreenComponent('ReflectionView')
const Timeline = getScreenComponent('Timeline')
const SupportOptions = getScreenComponent('SupportOptions')

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/setup" element={<KinfolkSetup />} />
      <Route path="/kinfolk" element={<Kinfolk />} />

      <Route path="/home" element={<Home />} />
      <Route path="/session" element={<ActiveSession />} />
      <Route path="/end" element={<EndSession />} />
      <Route path="/reflecting" element={<ReflectionLoading />} />
      <Route path="/reflection" element={<ReflectionView />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/support" element={<SupportOptions />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SessionProvider>
  )
}
