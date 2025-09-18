import { Container } from "react-bootstrap";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Grades from "./components/Grades";

function App() {
  return (
    <BrowserRouter>
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/:studentid" element={<Grades />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
