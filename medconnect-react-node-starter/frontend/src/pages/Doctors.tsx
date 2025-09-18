import { useQuery } from '@tanstack/react-query'
import API from '../lib/api'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Doctors(){
  const [q,setQ]=useState('')
  const { data } = useQuery({
    queryKey:['doctors',q],
    queryFn: async()=> (await API.get('/doctors',{ params: { q }})).data
  })
  return (
    <div style={{padding:20}}>
      <h2>Tìm bác sĩ</h2>
      <input placeholder="Từ khóa chuyên khoa..." value={q} onChange={e=>setQ(e.target.value)}/>
      <div>
        {(data||[]).map((d:any)=>(
          <div key={d.id} style={{border:'1px solid #ddd', margin:'12px 0', padding:12}}>
            <b>{d.fullName}</b> — {d.doctor?.specialization}
            <div><Link to={`/doctors/${d.id}`}>Xem chi tiết</Link></div>
          </div>
        ))}
      </div>
    </div>
  )
}
