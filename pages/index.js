import { useState } from 'react'
import { useRouter } from 'next/router'

// ✅ URL DO BACKEND NO RENDER
const API_URL = 'https://smartcontrol-backend.onrender.com';

export default function Login() {
  const [email, setEmail] = useState('teste@teste.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/dashboard')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📺</div>
          <h1 style={styles.title}>SmartControl+</h1>
        </div>
        
        <p style={styles.subtitle}>Controle sua TV pelo celular</p>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.info}>
          <p>Use: teste@teste.com / 123456</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #12121a 0%, #1e1e2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: 'rgba(30, 30, 46, 0.9)',
    padding: '40px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '100%',
    maxWidth: '400px',
    backdropFilter: 'blur(10px)'
  },
  logo: {
    textAlign: 'center',
    marginBottom: '10px'
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  title: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0
  },
  subtitle: {
    color: '#a4b0be',
    textAlign: 'center',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #444',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '16px'
  },
  button: {
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    background: '#6c5ce7',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    background: 'rgba(232, 67, 147, 0.2)',
    border: '1px solid #e84393',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  info: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#a4b0be',
    fontSize: '12px'
  }
}