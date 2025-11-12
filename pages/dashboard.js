import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const API_URL = 'https://smartcontrol-backend.onrender.com';

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [tvs, setTvs] = useState([])
  const [selectedTV, setSelectedTV] = useState(null)
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [manualConnect, setManualConnect] = useState(false)
  const [manualIP, setManualIP] = useState('192.168.1.128')
  const [tvName, setTvName] = useState('Minha TV Roku')
  const [tvBrand, setTvBrand] = useState('roku')
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
      console.log('🔄 Carregando TVs para usuário:', user.id);
      
      const response = await fetch(`${API_URL}/api/user-tvs?user_id=${user.id}`)
      const data = await response.json()
      
      console.log('📺 Resposta da API:', data);
      
      if (data.success) {
        setTvs(data.tvs)
        console.log('✅ TVs carregadas:', data.tvs);
        
        // 🎯 SEMPRE SELECIONAR A PRIMEIRA TV (SE EXISTIR)
        if (data.tvs.length > 0) {
          setSelectedTV(data.tvs[0])
          console.log('🎯 TV selecionada:', data.tvs[0]);
        } else {
          // 🚨 SE NÃO HOUVER TV, CRIAR UMA FAKE PARA TESTE
          console.log('⚠️ Nenhuma TV encontrada, criando TV fake para teste');
          const fakeTV = {
            id: 'fake-tv-id',
            tv_name: 'TV de Teste',
            tv_brand: 'roku',
            tv_ip: '192.168.1.999',
            user_id: user.id
          };
          setSelectedTV(fakeTV);
          setTvs([fakeTV]);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar TVs:', error);
      // 🚨 EM CASO DE ERRO, CRIAR TV FAKE
      const fakeTV = {
        id: 'fake-tv-error',
        tv_name: 'TV de Teste (Erro)',
        tv_brand: 'roku', 
        tv_ip: '192.168.1.999',
        user_id: user.id
      };
      setSelectedTV(fakeTV);
      setTvs([fakeTV]);
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

  const connectTVManually = async () => {
    if (!user || !manualIP) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/connect-tv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          tvIp: manualIP,
          tvName: tvName,
          tvBrand: tvBrand
        })
      })
      
      const data = await response.json()
      alert(data.message)
      
      if (data.success) {
        loadTVs()
        setManualConnect(false)
        setMenuOpen(false)
      }
    } catch (error) {
      alert('Erro na conexão manual')
    } finally {
      setLoading(false)
    }
  }

  const sendCommand = async (command) => {
    if (!selectedTV || !selectedTV.tv_ip) {
      alert('TV não conectada! Use a busca automática ou conexão manual.')
      return
    }

    setLoading(true)
    try {
      console.log('🎮 ENVIANDO COMANDO:', command, '→', selectedTV.tv_ip);
      
      const response = await fetch(`${API_URL}/api/send-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tvIp: selectedTV.tv_ip, 
          command: command,
          tvBrand: selectedTV.tv_brand
        })
      })
      
      const data = await response.json()
      console.log('📡 RESPOSTA DO BACKEND:', data);
      alert(data.message)
    } catch (error) {
      console.error('❌ ERRO AO ENVIAR COMANDO:', error);
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
      {/* Header Mobile */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.menuButton}
          >
            ☰
          </button>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>📺</span>
            <h1 style={styles.title}>SmartControl+</h1>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </header>

      <div style={styles.main}>
        {/* Sidebar Mobile */}
        {menuOpen && (
          <div style={styles.mobileSidebar}>
            <div style={styles.sidebarContent}>
              <h2 style={styles.sidebarTitle}>Minhas TVs</h2>
              
              <button 
                onClick={discoverTV}
                disabled={discovering}
                style={styles.discoverButton}
              >
                {discovering ? '🔍 Procurando...' : '🔍 Busca Automática'}
              </button>

              <button 
                onClick={() => setManualConnect(!manualConnect)}
                style={styles.manualButton}
              >
                {manualConnect ? '✖️ Cancelar' : '🔧 Conexão Manual'}
              </button>

              {/* Formulário de Conexão Manual */}
              {manualConnect && (
                <div style={styles.manualForm}>
                  <h3 style={styles.manualTitle}>Conectar TV Manualmente</h3>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nome da TV</label>
                    <input
                      type="text"
                      value={tvName}
                      onChange={(e) => setTvName(e.target.value)}
                      style={styles.input}
                      placeholder="Ex: TV Sala, TV Quarto..."
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Marca da TV</label>
                    <select
                      value={tvBrand}
                      onChange={(e) => setTvBrand(e.target.value)}
                      style={styles.select}
                    >
                      <option value="roku">Roku</option>
                      <option value="tcl">TCL</option>
                      <option value="samsung">Samsung</option>
                      <option value="lg">LG</option>
                      <option value="generic">Outra</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>IP da TV</label>
                    <input
                      type="text"
                      value={manualIP}
                      onChange={(e) => setManualIP(e.target.value)}
                      style={styles.input}
                      placeholder="Ex: 192.168.1.100"
                    />
                  </div>

                  <button 
                    onClick={connectTVManually}
                    disabled={loading || !manualIP}
                    style={styles.connectButton}
                  >
                    {loading ? 'Conectando...' : '🔗 Conectar TV'}
                  </button>

                  <div style={styles.ipTips}>
                    <p><strong>💡 Modo Teste:</strong> Use qualquer IP para testar!</p>
                    <p>Ex: 192.168.1.999, 10.0.0.1, etc</p>
                  </div>
                </div>
              )}

              <div style={styles.tvList}>
                {tvs.map(tv => (
                  <div
                    key={tv.id}
                    onClick={() => {
                      setSelectedTV(tv)
                      setMenuOpen(false)
                    }}
                    style={{
                      ...styles.tvCard,
                      ...(selectedTV?.id === tv.id ? styles.tvCardSelected : {})
                    }}
                  >
                    <h3 style={styles.tvName}>{tv.tv_name}</h3>
                    <p style={styles.tvInfo}>{tv.tv_brand} {tv.id.includes('fake') ? '(Teste)' : ''}</p>
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
            <div 
              style={styles.overlay}
              onClick={() => setMenuOpen(false)}
            ></div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div style={styles.content}>
          <div style={styles.remoteSection}>
            <h2 style={styles.remoteTitle}>
              {selectedTV ? `Controle - ${selectedTV.tv_name}` : 'Selecione uma TV'}
            </h2>

            {/* 🎯 SEMPRE MOSTRAR BOTÕES (MESMO SEM TV CONECTADA) */}
            <div style={styles.remoteContainer}>
              {/* Status da TV */}
              <div style={styles.tvStatus}>
                <p style={styles.tvStatusText}>
                  📺 {selectedTV ? selectedTV.tv_name : 'TV de Teste'}
                  {selectedTV?.id.includes('fake') && ' 🧪 (Modo Teste)'}
                </p>
                <p style={styles.tvStatusIp}>
                  {selectedTV?.tv_ip ? `IP: ${selectedTV.tv_ip}` : 'IP: 192.168.1.999 (Teste)'}
                </p>
                <p style={styles.tvStatusBrand}>
                  Marca: {selectedTV?.tv_brand || 'roku'}
                </p>
                <p style={styles.testWarning}>
                  ⚠️ MODO TESTE - Comandos serão enviados mas TV não responderá
                </p>
              </div>

              {/* Controle Remoto */}
              <div style={styles.remote}>
                {/* Linha 1 - Power e Volume */}
                <div style={styles.buttonRow}>
                  <button onClick={() => sendCommand('POWER')} style={styles.powerButton}>
                    ⏻<br/><span style={styles.buttonLabel}>Power</span>
                  </button>
                  <button onClick={() => sendCommand('VOLUME_UP')} style={styles.volumeButton}>
                    🔊<br/><span style={styles.buttonLabel}>Vol +</span>
                  </button>
                  <button onClick={() => sendCommand('VOLUME_DOWN')} style={styles.volumeButton}>
                    🔉<br/><span style={styles.buttonLabel}>Vol -</span>
                  </button>
                  <button onClick={() => sendCommand('MUTE')} style={styles.muteButton}>
                    🔇<br/><span style={styles.buttonLabel}>Mute</span>
                  </button>
                </div>

                {/* Navegação */}
                <div style={styles.navSection}>
                  <div style={styles.navRow}>
                    <div style={styles.navSpace}></div>
                    <button onClick={() => sendCommand('UP')} style={styles.navButton}>
                      ↑<br/><span style={styles.buttonLabel}>Up</span>
                    </button>
                    <div style={styles.navSpace}></div>
                  </div>
                  <div style={styles.navRow}>
                    <button onClick={() => sendCommand('LEFT')} style={styles.navButton}>
                      ←<br/><span style={styles.buttonLabel}>Left</span>
                    </button>
                    <button onClick={() => sendCommand('ENTER')} style={styles.okButton}>
                      OK<br/><span style={styles.buttonLabel}>Select</span>
                    </button>
                    <button onClick={() => sendCommand('RIGHT')} style={styles.navButton}>
                      →<br/><span style={styles.buttonLabel}>Right</span>
                    </button>
                  </div>
                  <div style={styles.navRow}>
                    <div style={styles.navSpace}></div>
                    <button onClick={() => sendCommand('DOWN')} style={styles.navButton}>
                      ↓<br/><span style={styles.buttonLabel}>Down</span>
                    </button>
                    <div style={styles.navSpace}></div>
                  </div>
                </div>

                {/* Botões de Função */}
                <div style={styles.functionRow}>
                  <button onClick={() => sendCommand('HOME')} style={styles.functionButton}>
                    🏠<br/><span style={styles.buttonLabel}>Home</span>
                  </button>
                  <button onClick={() => sendCommand('BACK')} style={styles.functionButton}>
                    ↩<br/><span style={styles.buttonLabel}>Back</span>
                  </button>
                  <button onClick={() => sendCommand('MENU')} style={styles.functionButton}>
                    ☰<br/><span style={styles.buttonLabel}>Menu</span>
                  </button>
                  <button onClick={() => sendCommand('SOURCE')} style={styles.functionButton}>
                    📺<br/><span style={styles.buttonLabel}>Source</span>
                  </button>
                </div>
              </div>

              {loading && <p style={styles.loadingText}>Enviando comando...</p>}
              
              <div style={styles.testInfo}>
                <p><strong>🎯 MODO TESTE ATIVADO</strong></p>
                <p>• Clique nos botões para testar</p>
                <p>• Comandos aparecerão nos logs do Render</p>
                <p>• Quando tiver uma TV real, use "Conexão Manual"</p>
              </div>
            </div>
          </div>
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
    padding: '15px 0',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  menuButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '10px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '20px'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  logoutButton: {
    background: '#e84393',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  main: {
    position: 'relative'
  },
  mobileSidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    display: 'flex'
  },
  sidebarContent: {
    background: 'rgba(30, 30, 46, 0.95)',
    width: '280px',
    height: '100%',
    padding: '20px',
    overflowY: 'auto',
    backdropFilter: 'blur(10px)'
  },
  overlay: {
    flex: 1,
    background: 'rgba(0,0,0,0.5)'
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
    marginBottom: '15px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  manualButton: {
    width: '100%',
    background: '#fdcb6e',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  manualForm: {
    background: 'rgba(255,255,255,0.05)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  manualTitle: {
    color: '#fdcb6e',
    fontSize: '16px',
    margin: '0 0 15px 0',
    textAlign: 'center'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '15px'
  },
  label: {
    color: 'white',
    fontSize: '12px',
    fontWeight: '500'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  },
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #444',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  },
  connectButton: {
    width: '100%',
    background: '#00b894',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '15px'
  },
  ipTips: {
    background: 'rgba(0, 184, 148, 0.1)',
    border: '1px solid #00b894',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '11px',
    color: '#a4b0be'
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
  content: {
    padding: '20px'
  },
  remoteSection: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  remoteTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    textAlign: 'center'
  },
  remoteContainer: {
    width: '100%'
  },
  tvStatus: {
    background: 'rgba(255,255,255,0.1)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  tvStatusText: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  tvStatusIp: {
    margin: '0 0 5px 0',
    color: '#a4b0be',
    fontSize: '14px'
  },
  tvStatusBrand: {
    margin: '0 0 10px 0',
    color: '#6c5ce7',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  testWarning: {
    color: '#fdcb6e',
    margin: '10px 0 0 0',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  remote: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px'
  },
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  powerButton: {
    background: '#e84393',
    color: 'white',
    border: 'none',
    padding: '15px 10px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  volumeButton: {
    background: '#00cec9',
    color: 'white',
    border: 'none',
    padding: '15px 10px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  muteButton: {
    background: '#fdcb6e',
    color: 'white',
    border: 'none',
    padding: '15px 10px',
    borderRadius: '15px',
    fontSize: '20px',
    cursor: 'pointer',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navSection: {
    marginBottom: '20px'
  },
  navRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px'
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
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
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
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  functionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  functionButton: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    padding: '15px 10px',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    minHeight: '70px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabel: {
    fontSize: '10px',
    marginTop: '5px',
    opacity: '0.8'
  },
  loadingText: {
    textAlign: 'center',
    color: '#a4b0be',
    margin: '20px 0 0 0'
  },
  testInfo: {
    background: 'rgba(108, 92, 231, 0.1)',
    border: '1px solid #6c5ce7',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '12px'
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