import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import API from '../lib/api'

export default function DoctorDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const { data } = useQuery({
    queryKey:['doctor',id],
    queryFn: async()=> (await API.get(`/doctors/${id}`)).data
  })

  const book = async ()=>{
    const start = new Date(Date.now()+60*60*1000).toISOString()
    const end = new Date(Date.now()+2*60*60*1000).toISOString()
    const { data: resp } = await API.post('/appointments',{
      doctorId: id, startAt: start, endAt: end, type: 'online', reason:'Khám từ xa'
    })
    // simulate webhook success
    await API.post('/appointments/mock-webhook',{ paymentId: resp.paymentId })
    alert('Đặt lịch thành công!')
    nav('/dashboard')
  }

  if(!data) return <div style={{padding:20}}>Đang tải...</div>
  return (
    <div style={{padding:20}}>
      <h2>{data.fullName}</h2>
      <p>Chuyên khoa: {data.doctor?.specialization}</p>
      <p>{data.doctor?.bio}</p>
      <button onClick={book}>Đặt lịch online (demo)</button>
    </div>
  )
}
