import { useNavigate } from 'react-router-dom'
import Landing from './Landing'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <Landing
      onEnter={() => navigate('/home')}
      onWorkspace={() => navigate('/home')}
    />
  )
}
