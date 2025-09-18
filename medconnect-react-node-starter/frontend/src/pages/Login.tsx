import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'

export default function Login(){
  const [email,setEmail]=useState('patient@medconnect.local')
  const [password,setPassword]=useState('admin123')
  const nav = useNavigate()

  const submit= async (e:any)=>{
    e.preventDefault()
    const { data } = await API.post('/auth/login',{email,password})
    localStorage.setItem('token', data.token)
    nav('/dashboard')
  }

  return (
    <form onSubmit={submit} style={{display:'grid',gap:12, padding:20}}>
      <h2>Đăng nhập</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input placeholder="Mật khẩu" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button>Đăng nhập</button>
    </form>
  )
}
