import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Box, CircularProgress, IconButton, Button, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes, faRocket } from "@fortawesome/free-solid-svg-icons"
import ChatMessage from "./ChatMessage"
import ChatInput from "./ChatInput"
import ChatSidebar from "./ChatSidebar"
import "../../css/chatbot.css"

const Chatbot = () => {
  const { sessionId } = useParams();
  console.log("Chatbot component loaded with id:", sessionId)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [hasSession, setHasSession] = useState(!!sessionId)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null)
  const [isGeneratingSession, setIsGeneratingSession] = useState(false)

  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Hi! I'm your AI tutor. What topic would you like to explore today?" },
  ])


  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const chatEndRef = useRef(null)

  const [user, setUser] = useState(null);
  const [recentChats, setRecentChats] = useState([])


  const checkLoginStatus = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
    const res = await fetch("http://localhost:8000/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    return data;
  }

  useEffect(() => {
    const getUser = async () => {
      const userData = await checkLoginStatus();
      console.log("User Data:", userData);
      if (userData.username) setUser(userData.username);
      if (userData.session_ids) {
        userData.session_ids.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecentChats(userData.session_ids);
      }
      console.log("Recent Chats:", recentChats);
    };
    getUser();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleStartChat = async () => {
    setIsGeneratingSession(true)
    try {
      const response = await fetch("http://localhost:8000/chat/new", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
      })
      const data = await response.json()
      if (data.session_id === undefined) {
        throw new Error("No sessionId returned from backend")
      }

      const newSessionId = data.session_id
      const timeStamp = data.timestamp || new Date().toLocaleString()

      const updatedRecentChats = [{ id: newSessionId, timestamp: timeStamp }, ...recentChats]
      setRecentChats(updatedRecentChats)
      setCurrentSessionId(newSessionId)
      setHasSession(true)
      setMessages([
        { sender: "ai", text: "👋 Hi! I'm your AI tutor. What topic would you like to explore today?" },
      ])
      navigate(`/chat/${newSessionId}`)
    } catch (error) {
      console.error("[v0] Error generating session:", error)
      setCurrentSessionId(null)
      setHasSession(false)
      navigate('/chat')
    } finally {
      setIsGeneratingSession(false)
    }
  }

  const handleSend = async (text) => {
    if (!text.trim()) return

    const newMessages = [...messages, { sender: "user", text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch(`http://localhost:8000/chat/${currentSessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()
      const aiReply = data.message || "Hmm, I didn't quite catch that."
      console.log("AI Reply:", aiReply)
      setMessages([...newMessages, { sender: "ai", text: aiReply }])
    } catch {
      setMessages([...newMessages, { sender: "ai", text: "⚠️ Error: Unable to reach backend." }])
    } finally {
      setLoading(false)
    }
  }

  const handleLoadChat = async (chatId) => {
    setMessages([])
    const initialMessage = { sender: "ai", text: "👋 Hi! I'm your AI tutor. What topic would you like to explore today?" }
    // setMessages([initialMessage])
    setLoading(true)
    setCurrentSessionId(chatId)
    const res = await fetch(`http://localhost:8000/chat/${chatId}/messages`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, },
    })
    const data = await res.json()
    console.log("Loaded chat data:", data)
    const loadedMessages = data.messages || []
    const totalMessages = [initialMessage, ...loadedMessages]
    setMessages(totalMessages)
    setHasSession(true)
    setLoading(false)
    navigate(`/chat/${chatId}`)
  }

  if (sessionId) {
    useEffect(() => {
      handleLoadChat(sessionId)
    }, [sessionId])
  }

  if (!hasSession) {
    return (
      <Box className="chatbot-wrapper">
        <ChatSidebar
          recentChats={recentChats}
          onNewChat={handleStartChat}
          currentChatId={currentSessionId}
          sidebarOpen={sidebarOpen}
        />

        <Box className="chatbot-main">
          <Box className="chatbot-header-top">
            <IconButton
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ display: "flex", color: "#b0b8ff" }}
            >
              <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} color="white" />
            </IconButton>
            <Box className="chatbot-header">HackTutor - Your Personalized AI Teaching Assistant</Box>
          </Box>

          <Box className="start-chat-container">
            <Box className="start-chat-content">
              <h1>Ready to Start Learning?</h1>
              <p>Begin your personalized tutoring session with HackTutor</p>
              <Button
                onClick={handleStartChat}
                disabled={isGeneratingSession}
                className="start-chat-button"
                startIcon={isGeneratingSession ? <CircularProgress size={20} /> : <FontAwesomeIcon icon={faRocket} />}
                sx={{
                  backgroundColor: "#6366f1",
                  color: "white",
                  padding: "12px 32px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#4f46e5",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(99, 102, 241, 0.5)",
                  },
                }}
              >
                {isGeneratingSession ? "Initializing..." : "Start Chat"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="chatbot-wrapper">
      <ChatSidebar
        recentChats={recentChats}
        onNewChat={handleStartChat}
        currentChatId={currentSessionId}
        sidebarOpen={sidebarOpen}
      />

      <Box className="chatbot-main">
        <Box className="chatbot-header-top">
          <IconButton
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ display: "flex", color: "#b0b8ff" }}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </IconButton>
          <Box className="chatbot-header">HackTutor - Your Personalized AI Teaching Assistant</Box>
        </Box>

        <Box className="chatbot-messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text || msg.content} />
          ))}
          {loading && (
            <Box className="message ai" display="flex" flexDirection="row" alignItems="center" gap={1}>
              <CircularProgress size={16} sx={{ color: "#b0b8ff" }} />
              <Typography variant="body2" color="#e6e8f3">
                Thinking...
              </Typography>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>
        <ChatInput onSend={handleSend} disabled={loading} />
      </Box>
    </Box>
  )
}

export default Chatbot
