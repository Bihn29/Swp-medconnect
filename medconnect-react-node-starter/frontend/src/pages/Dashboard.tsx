import { useQuery } from '@tanstack/react-query'
import API from '../lib/api'

export default function Dashboard(){
  const { data } = useQuery({
    queryKey:['my-appts'],
    queryFn: async()=> (await API.get('/appointments/me')).data
  })
  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      <ul>
        {(data||[]).map((a:any)=>(
          <li key={a.id}>
            <b>{a.type}</b> — {a.status} — {new Date(a.startAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
