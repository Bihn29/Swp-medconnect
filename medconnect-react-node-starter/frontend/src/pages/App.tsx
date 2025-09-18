import { Link } from 'react-router-dom'

export default function App(){
  return (
    <div style={{padding:20}}>
      <h1>MedConnect</h1>
      <p>Chào mừng! Hãy <Link to="/login">Đăng nhập</Link> hoặc <Link to="/register">Đăng ký</Link>.</p>
      <p><Link to="/doctors">Tìm bác sĩ</Link></p>
    </div>
  )
}
