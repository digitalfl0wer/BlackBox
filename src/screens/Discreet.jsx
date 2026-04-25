import DiscreetOverlay from '../components/DiscreetOverlay'
import { useSession } from '../context/SessionContext'

export default function Discreet() {
  const { exitDiscreet } = useSession()

  return <DiscreetOverlay onExit={exitDiscreet} />
}
