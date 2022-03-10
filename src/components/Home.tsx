import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col, Form, ListGroup, Button } from 'react-bootstrap'
import { io } from 'socket.io-client'
import { FormEvent, KeyboardEventHandler, useEffect, useState } from 'react'

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// overriding transports in order to just use the websocket technology (and not trying to poll for new messages)
// socket is a reference to our open connection with the server

// SOCKET.IO is an EVENT-BASED library
// we're going to start setting up some event listeners in order
// to be able to interact with what happens on the server side

// 1) EVERY TIME I REFRESH THE BROWSER, A CONNECTION ESTABLISHES WITH THE SERVER
// 2) IF THE SERVER WELCOMES US, IT WILL RESPOND US WITH A 'connect' EVENT
// 3) WE CAN SET UP AN EVENT LISTENER FOR IT, AND WE CAN EXECUTE OUR LOGIC WHEN THAT HAPPENS
// 4) WE CAN SUBMIT NOW OUR USERNAME TO THE SERVER, EMITTING A 'setUsername' EVENT
// 5) IF THE SERVER ACCEPTS OUR USERNAME, IT WILL EMIT US BACK ANOTHER EVENT, CALLED 'loggedin'
// 6) WE CAN SET UP ANOTHER EVENT LISTENER FOR THE 'loggedin' EVENT

const Home = () => {
  const [username, setUsername] = useState('')

  useEffect(() => {
    // we need to launch this event listener JUST ONCE!
    // not every time the component re-renders
    socket.on('connect', () => {
      console.log('connection established!')
    })
    // every time you use .on() you're LISTENING for an event emitted on the server

    socket.on('loggedin', () => {
      console.log("You're correctly logged in now")
    })
  }, [])

  const handleUsernameSubmit = (e: FormEvent) => {
    e.preventDefault()
    // we need to send the username to the server
    // the username is safely stored in a 'username' state variable
    // we'll EMIT AN EVENT to the server!
    socket.emit('setUsername', {
      // username: username
      username,
    })
  }

  return (
    <Container fluid className='px-4 mt-3'>
      <Row style={{ height: '95vh' }}>
        <Col md={10} className='d-flex flex-column justify-content-between'>
          {/* MAIN VIEW COL */}
          {/* TOP SECTION: USERNAME INPUT FIELD */}
          <Form onSubmit={handleUsernameSubmit}>
            <Form.Control
              type='text'
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
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
