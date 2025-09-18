import React, { useEffect, useState } from "react";
import { Container, Row, Form, Col, Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

function HomePage() {
  const [student, setStudent] = useState([]);
  const [studentDetail, setStudentDetail] = useState([]);
  const [evaluation, setEvaluation] = useState([]);
  const [subject, setSubject] = useState([]);
  const [studentSubject, setStudentSubject] = useState([]);
  const [allstudent, setAllStudent] = useState([]);
  const [key, setKey] = useState("");
  const [getId, setGetId] = useState("");
  const [getName, setGetName] = useState("");

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

  const handleSubjectClick = (subjectId) => {
    const relatedStudentIds = studentSubject
      .filter((ss) => ss.subjectId === subjectId)
      .map((ss) => ss.studentId);

    const filtered = allstudent.filter((s) =>
      relatedStudentIds.includes(s.studentId)
    );

    setStudent(filtered);
  };

  const handleSave = () => {
    if (!getId || !getName) {
      alert("Nhập đầy đủ thông tin!");
      return;
    }
    const newData = {
      id: subject.length + 1, // số, không cần ép chuỗi
      subjectId: getId,
      name: getName,
    };

    axios
      .post("http://localhost:9999/subjects", newData)
      .then((res) => {
        alert("Thêm thành công");
        window.location.reload();
      })
      .catch((err) => console.error(err));
  };

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
                <button
                  className="btn btn-link p-0"
                  onClick={() => handleSubjectClick(s.subjectId)}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
          <Form.Group>
            <Form.Control
              style={{ marginTop: "10px" }}
              type="text"
              placeholder="Enter SubjectId"
              onChange={(e) => setGetId(e.target.value)}
            />
            <Form.Control
              style={{ marginTop: "10px" }}
              type="text"
              placeholder="Enter SubjectName"
              onChange={(e) => setGetName(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="light"
            style={{ marginTop: "10px", border: "1px solid gray" }}
            onClick={handleSave}
          >
            Add
          </Button>
        </Col>
        <Col md={9}>
          <h2>List of Students</h2>
          <Table hover striped bordered>
            <thead>
              <tr>
                <th>StudentId</th>
                <th>Name</th>
                <th>Age</th>
                <th>Street</th>
                <th>City</th>
                <th>IsRegularStudent</th>
                <th>View grades</th>
              </tr>
            </thead>
            <tbody>
              {filterStudent?.map((s) => (
                <tr>
                  <td>{s.studentId}</td>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  <td>
                    {
                      studentDetail?.find((sd) => sd.id === s.id)?.address
                        .street
                    }
                  </td>
                  <td>
                    {studentDetail?.find((sd) => sd.id === s.id)?.address.city}
                  </td>
                  <td>{s.isRegularStudent ? "Fulltime" : "Applicant"}</td>
                  <td>
                    <Link to={`/student/${s.studentId}`}>Grades</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
