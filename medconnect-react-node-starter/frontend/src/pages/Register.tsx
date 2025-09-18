import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [fullName,setFullName]=useState('')
  const [role,setRole]=useState<'PATIENT'|'DOCTOR'>('PATIENT')
  const nav = useNavigate()

  const submit= async (e:any)=>{
    e.preventDefault()
    await API.post('/auth/register',{email,password,fullName, role})
    nav('/login')
  }

  return (
    <form onSubmit={submit} style={{display:'grid',gap:12, padding:20}}>
      <h2>Đăng ký</h2>
      <input placeholder="Họ tên" value={fullName} onChange={e=>setFullName(e.target.value)}/>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input placeholder="Mật khẩu" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <label>Vai trò:
        <select value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="PATIENT">Bệnh nhân</option>
          <option value="DOCTOR">Bác sĩ</option>
        </select>
      </label>
      <button>Tạo tài khoản</button>
    </form>
  )
}
