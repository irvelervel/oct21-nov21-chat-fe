import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col, Form, ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// overriding transports in order to just use the websocket technology (and not trying to poll for new messages)
// socket is a reference to our open connection with the server

const Home = () => {
  return (
    <Container fluid className='px-4 mt-3'>
      <Row style={{ height: '95vh' }}>
        <Col md={10} className='d-flex flex-column justify-content-between'>
          {/* MAIN VIEW COL */}
          {/* TOP SECTION: USERNAME INPUT FIELD */}
          <Form onSubmit={() => console.log('username submitted')}>
            <Form.Control type='text' placeholder='Enter your username' />
          </Form>
          {/* MIDDLE SECTION: CHAT HISTORY */}
          <ListGroup>
            <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Morbi leo risus</ListGroup.Item>
            <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
            <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
          </ListGroup>
          {/* BOTTOM SECTION: NEW MESSAGE INPUT FIELD */}
          <Form onSubmit={() => console.log('message submitted')}>
            <Form.Control type='text' placeholder='Enter your message' />
          </Form>
        </Col>
        <Col md={2}>
          {/* ONLINE USERS COL */}
          <div className='mb-3'>Connected users:</div>
          <ListGroup>
            <ListGroup.Item>Carlos</ListGroup.Item>
            <ListGroup.Item>Giorgio</ListGroup.Item>
            <ListGroup.Item>Hilina</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
