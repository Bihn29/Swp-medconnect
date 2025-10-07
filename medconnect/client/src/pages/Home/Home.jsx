import "./Home.scss";
import { useEffect } from "react";
import { getTodos } from "../../services/todoService";

const Home = () => {
  useEffect(() => {
    getTodos().then(({ response, data }) => {
      console.log(response);
      console.log(data);
    });
  }, []);
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;
