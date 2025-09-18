import React, { useEffect, useState } from "react";
import { Container, Row, Form, Col, Table, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function Grades() {
  const [student, setStudent] = useState([]);
  const [studentDetail, setStudentDetail] = useState([]);
  const [evaluation, setEvaluation] = useState([]);
  const [subject, setSubject] = useState([]);
  const [studentSubject, setStudentSubject] = useState([]);
  const [allstudent, setAllStudent] = useState([]);
  const [key, setKey] = useState("");
  const { studentid } = useParams()

  useEffect(() => {
    axios
      .get("http://localhost:9999/students")
      .then((res) => {
        setStudent(res.data);
        setAllStudent(res.data);
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:9999/student_details")
      .then((res) => {
        setStudentDetail(res.data);
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:9999/evaluations")
      .then((res) => {
        setEvaluation(res.data);
      })
      .catch((err) => console.error(err));

    axios
      .get(" http://localhost:9999/subjects")
      .then((res) => {
        setSubject(res.data);
      })
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:9999/students_subjetcs")
      .then((res) => {
        setStudentSubject(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filterStudent = student.filter((s) =>
    s.name?.toLowerCase().startsWith(key.toLowerCase())
  );

  return (
    <Container fluid>
      <Row>
        <h1 style={{ textAlign: "center" }}>Students Management</h1>
      </Row>
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Form.Control
            type="text"
            placeholder="Enter student name to search ..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </Col>
      </Row>
      <Row xs={12} style={{ marginTop: "20px" }}>
        <Col md={3}>
          <h2 style={{ textAlign: "start" }}>Subjects</h2>
          <ul style={{ listStyleType: "none" }}>
            {subject.map((s) => (
              <li key={s.id}>
                <button className="btn btn-link p-0">{s.name}</button>
              </li>
            ))}
          </ul>
          <Form.Group>
            <Form.Control
              style={{ marginTop: "10px" }}
              type="text"
              placeholder="Enter SubjectId"
            />
            <Form.Control
              style={{ marginTop: "10px" }}
              type="text"
              placeholder="Enter SubjectName"
            />
          </Form.Group>
          <Button
            variant="light"
            style={{ marginTop: "10px", border: "1px solid gray" }}
          >
            Add
          </Button>
        </Col>
        <Col md={9}>
          <Button variant="success">
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Back to home
            </Link>
          </Button>
          <h3 style={{textAlign:'center', marginTop:'30px'}}>
            {
                student.find((s) => studentid === s.studentId)?.name
            }
            's Grade Details: 
          </h3>
          <Table hover striped bordered>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
             {
                evaluation
                .filter((e) => e.studentId === studentid)
                .map((ev) => (
                    <tr key={ev.id}>
                        <td>{ev.grade}</td>
                        <td>{ev.additionalExplanation}</td>
                    </tr>
                ))
             }
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default Grades;
