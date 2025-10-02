import "./Home.scss";
import Carousel from "./Carousel";
import BestSeller from "./BestSeller";
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
      <Carousel />
      <BestSeller />
    </div>
  );
};

export default Home;
