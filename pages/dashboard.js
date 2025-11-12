import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ✅ URL DO BACKEND NO RENDER
const API_URL = 'https://smartcontrol-backend.onrender.com';

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [tvs, setTvs] = useState([])
  const [selectedTV, setSelectedTV] = useState(null)
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    loadTVs()
  }, [])

  const loadTVs = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`${API_URL}/api/user-tvs?user_id=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setTvs(data.tvs)
        if (data.tvs.length > 0) {
          setSelectedTV(data.tvs[0])
        }
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const discoverTV = async () => {
    if (!user) return
    
    setDiscovering(true)
    try {
      const response = await fetch(`${API_URL}/api/discover-tv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      const data = await response.json()
      alert(data.message)
      
      if (data.success) {
        loadTVs()
      }
    } catch (error) {
      alert('Erro na descoberta')
    } finally {
      setDiscovering(false)
    }
  }

  const sendCommand = async (command) => {
    if (!selectedTV || !selectedTV.tv_ip) {
      alert('TV não conectada! Clique em "Descobrir TV" primeiro.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/send-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tvIp: selectedTV.tv_ip, 
          command: command 
        })
      })
      
      const data = await response.json()
      alert(data.message)
    } catch (error) {
      alert('Erro ao enviar comando')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) return <div style={styles.loading}>Carregando...</div>

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📺</span>
            <h1 style={styles.title}>SmartControl+</h1>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div style={styles.main}>
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Minhas TVs</h2>
          
          <button 
            onClick={discoverTV}
            disabled={discovering}
            style={styles.discoverButton}
          >
            {discovering ? '🔍 Procurando...' : '🔍 Descobrir TV na Rede'}
          </button>

          <div style={styles.tvList}>
            {tvs.map(tv => (
              <div
                key={tv.id}
                onClick={() => setSelectedTV(tv)}
                style={{
                  ...styles.tvCard,
                  ...(selectedTV?.id === tv.id ? styles.tvCardSelected : {})
                }}
              >
                <h3 style={styles.tvName}>{tv.tv_name}</h3>
                <p style={styles.tvInfo}>{tv.tv_brand}</p>
                <p style={styles.tvIp}>
                  {tv.tv_ip ? `IP: ${tv.tv_ip}` : 'Não conectada'}
                </p>
                <div style={{
                  ...styles.status,
                  ...(tv.tv_ip ? styles.statusOnline : styles.statusOffline)
                }}></div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.remote}>
          <h2 style={styles.remoteTitle}>
            {selectedTV ? `Controle - ${selectedTV.tv_name}` : 'Selecione uma TV'}
          </h2>

          {selectedTV ? (
            <div style={styles.remoteContainer}>
              <div style={styles.tvStatus}>
                <p>TV: {selectedTV.tv_name}</p>
                <p>IP: {selectedTV.tv_ip || 'Não conectada'}</p>
                {!selectedTV.tv_ip && (
                  <p style={styles.warning}>⚠️ Clique em "Descobrir TV" para conectar</p>
                )}
              </div>

              <div style={styles.remoteGrid}>
                <button onClick={() => sendCommand('POWER')} style={styles.powerButton}>⏻</button>
                <button onClick={() => sendCommand('VOLUME_UP')} style={styles.volumeButton}>🔊</button>
                <button onClick={() => sendCommand('VOLUME_DOWN')} style={styles.volumeButton}>🔉</button>
                <button onClick={() => sendCommand('MUTE')} style={styles.muteButton}>🔇</button>

                <div style={styles.navSection}>
                  <div style={styles.navRow}>
                    <div style={styles.navSpace}></div>
                    <button onClick={() => sendCommand('UP')} style={styles.navButton}>↑</button>
                    <div style={styles.navSpace}></div>
                  </div>
                  <div style={styles.navRow}>
                    <button onClick={() => sendCommand('LEFT')} style={styles.navButton}>←</button>
                    <button onClick={() => sendCommand('ENTER')} style={styles.okButton}>OK</button>
                    <button onClick={() => sendCommand('RIGHT')} style={styles.navButton}>→</button>
                  </div>
                  <div style={styles.navRow}>
                    <div style={styles.navSpace}></div>
                    <button onClick={() => sendCommand('DOWN')} style={styles.navButton}>↓</button>
                    <div style={styles.navSpace}></div>
                  </div>
                </div>

                <button onClick={() => sendCommand('HOME')} style={styles.functionButton}>🏠</button>
                <button onClick={() => sendCommand('BACK')} style={styles.functionButton}>↩</button>
                <button onClick={() => sendCommand('MENU')} style={styles.functionButton}>☰</button>
                <button onClick={() => sendCommand('SOURCE')} style={styles.functionButton}>📺</button>
              </div>

              {loading && <p style={styles.loadingText}>Enviando comando...</p>}
            </div>
          ) : (
            <div style={styles.noTV}>
              <div style={styles.noTVIcon}>📺</div>
              <h3>Nenhuma TV selecionada</h3>
              <p>Selecione uma TV da lista ou descubra uma nova</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #12121a 0%, #1e1e2e 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: 'rgba(30, 30, 46, 0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '20px 0',
    backdropFilter: 'blur(10px)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '24px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userEmail: {
    color: '#a4b0be'
  },
  logoutButton: {
    background: '#e84393',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px'
  },
  sidebar: {
    background: 'rgba(30, 30, 46, 0.8)',
    borderRadius: '15px',
    padding: '20px',
    height: 'fit-content'
  },
  sidebarTitle: {
    margin: '0 0 15px 0',
    color: '#6c5ce7',
    fontSize: '18px'
  },
  discoverButton: {
    width: '100%',
    background: '#00cec9',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tvList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  tvCard: {
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative',
    border: '2px solid transparent'
  },
  tvCardSelected: {
    border: '2px solid #6c5ce7',
    background: 'rgba(108, 92, 231, 0.2)'
  },
  tvName: {
    margin: '0 0 5px 0',
    fontSize: '16px'
  },
  tvInfo: {
    margin: '0 0 5px 0',
    color: '#a4b0be',
    fontSize: '14px'
  },
  tvIp: {
    margin: 0,
    color: '#a4b0be',
    fontSize: '12px'
  },
  status: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  statusOnline: {
    background: '#00b894'
  },
  statusOffline: {
    background: '#a4b0be'
  },
  remote: {
    background: 'rgba(30, 30, 46, 0.8)',
    borderRadius: '15px',
    padding: '30px'
  },
  remoteTitle: {
    margin: '0 0 20px 0',
    fontSize: '24px'
  },
  remoteContainer: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  tvStatus: {
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  warning: {
    color: '#fdcb6e',
    margin: '10px 0 0 0'
  },
  remoteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  powerButton: {
    background: '#e84393',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    gridColumn: 'span 1'
  },
  volumeButton: {
    background: '#00cec9',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    gridColumn: 'span 1'
  },
  muteButton: {
    background: '#fdcb6e',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    gridColumn: 'span 1'
  },
  navSection: {
    gridColumn: 'span 4',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '10px 0'
  },
  navRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  navSpace: {
    width: '70px',
    height: '70px'
  },
  navButton: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    width: '70px',
    height: '70px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer'
  },
  okButton: {
    background: '#6c5ce7',
    color: 'white',
    border: 'none',
    width: '70px',
    height: '70px',
    borderRadius: '15px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  functionButton: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    gridColumn: 'span 1'
  },
  loadingText: {
    textAlign: 'center',
    color: '#a4b0be',
    margin: '20px 0 0 0'
  },
  noTV: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  noTVIcon: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#12121a',
    color: 'white',
    fontSize: '18px'
  }
}