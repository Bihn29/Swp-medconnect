
import Layout from "./core/Layout";

import { useQuery } from "@tanstack/react-query";
const App = () => {
  const {data} = useQuery({
    queryKey: ['test'],
    queryFn: () => fetch('http://localhost:3000/api/v1/users').then(res => res.json())
  })
console.log(data);

  return (
      <Layout />
  );
};

export default App;
