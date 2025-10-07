import { use } from "react";
import Layout from "./core/Layout";
import { BrowserRouter } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
const App = () => {
  const {data, isLoading, isError} = useQuery({
    queryKey: ['test'],
    queryFn: () => fetch('http://localhost:3000/api/v1/users').then(res => res.json())
  })
console.log(data);

  return (
      <Layout />
  );
};

export default App;
