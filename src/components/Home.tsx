import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Row, Col, Form, ListGroup, Button } from 'react-bootstrap'
import { io } from 'socket.io-client'
import { FormEvent, KeyboardEventHandler, useEffect, useState } from 'react'
import User from '../types/IUser'
import Message from '../types/IMessage'

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
// 7) LISTENING TO THIS 'loggedin' EVENT ALLOWS US TO DISABLE THE USERNAME FIELD AND ENABLE THE MESSAGE FIELD
// 8) AFTER LOGGIN IN WE CAN FETCH THE LIST OF ONLINE USERS WITH fetchOnlineUsers()
// 9) THE SERVER DOESN'T JUST SEND A 'loggedin' EVENT WHENEVER A NEW CLIENT CONNECTS, IT'S ALSO SENDING AN EVENT OF TYPE
// 'newConnection' TO ALL THE OTHER CLIENTS CURRENTLY CONNECTED
// 10) WE CAN SET UP AN EVENT LISTENER FOR 'newConnection' IN ORDER TO BEING AWARE WHEN SOMEONE ELSE ENTERS THE CHAT
// 11) WHEN WE SEND A MESSAGE WE CAN EMIT A 'sendmessage' EVENT FOR DISPATCHING MESSAGES TO THE SERVER
// 12) AFTER SENDING A MESSAGE WE ALSO NEED TO TAKE CARE OF OUR CHAT HISTORY, APPENDING OUR MESSAGE AT THE END OF IT
// 13) FINALLY, WE NEED TO SET AN EVENT LISTENER FOR RECEIVING MESSAGES FROM THE SERVER (COMING FROM OTHER CLIENTS):
// WE NEED TO SET UP A LISTENER FOR THE 'message' EVENT AND APPEND EVERY MESSAGE WE RECEIVE TO OUR CHAT HISTORY,
// TAKING CARE OF RE-EVALUATING THE VALUE OF chatHistory BEFORE APPENDING THE MESSAGE (OTHERWISE chatHistory WILL BE STUCK
// WITH ITS INITIAL VALUE, WHICH IS AN EMPTY ARRAY)

const Home = () => {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  useEffect(() => {
    // we need to launch this event listener JUST ONCE!
    // not every time the component re-renders
    socket.on('connect', () => {
      console.log('connection established!')
    })
    // every time you use .on() you're LISTENING for an event emitted on the server

    socket.on('loggedin', () => {
      console.log("You're correctly logged in now")
      setIsLoggedIn(true)
      fetchOnlineUsers()

      socket.on('newConnection', () => {
        // this is for the already connected clients!
        // will never be sent to a user that just logged in
        console.log('Look! another client connected!')
        fetchOnlineUsers()
      })

      socket.on('message', (newMessage: Message) => {
        // setChatHistory([...chatHistory, newMessage])
        // bug?
        setChatHistory((currentChatHistory) => [
          ...currentChatHistory,
          newMessage,
        ])
      })
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

  const fetchOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + '/online-users')
      if (response.ok) {
        let data = await response.json()
        console.log('online users: ', data)
        let users = data.onlineUsers
        setOnlineUsers(users)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault()

    // a valid message for our platform is made by these properties
    // text
    // sender
    // timestamp
    // id

    const messageToSend: Message = {
      text: message,
      sender: username,
      id: socket.id,
      timestamp: Date.now(),
    }

    socket.emit('sendmessage', messageToSend)
    setChatHistory([...chatHistory, messageToSend])
    // [...chatHistory] <-- creates an exact copy of chatHistory
    setMessage('')
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
              disabled={isLoggedIn}
            />
          </Form>
          {/* MIDDLE SECTION: CHAT HISTORY */}
          <ListGroup>
            {chatHistory.map((message) => (
              <ListGroup.Item key={message.timestamp}>
                {message.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {/* BOTTOM SECTION: NEW MESSAGE INPUT FIELD */}
          <Form onSubmit={handleMessageSubmit}>
            <Form.Control
              type='text'
              placeholder='Enter your message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isLoggedIn}
            />
          </Form>
        </Col>
        <Col md={2}>
          {/* ONLINE USERS COL */}
          <div className='mb-3'>Connected users:</div>
          <ListGroup>
            {onlineUsers.map((user) => (
              <ListGroup.Item key={user.id}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
