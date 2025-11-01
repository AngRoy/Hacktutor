import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Box, CircularProgress, IconButton, Button, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes, faRocket } from "@fortawesome/free-solid-svg-icons"
import ChatMessage from "./ChatMessage"
import ChatInput from "./ChatInput"
import ChatSidebar from "./ChatSidebar"
import "../../css/chatbot.css"

const Chatbot = ({ sessionId }) => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const [hasSession, setHasSession] = useState(!!sessionId)
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null)
  const [isGeneratingSession, setIsGeneratingSession] = useState(false)

  const [messages, setMessages] = useState([
    { sender: "ai", text: "👋 Hi! I'm your AI tutor. What topic would you like to explore today?" },
  ])
  const [loading, setLoading] = useState(false)
  const [recentChats, setRecentChats] = useState([
    { id: 1, title: "JavaScript Basics", timestamp: "Today" },
    { id: 2, title: "React Hooks", timestamp: "Yesterday" },
    { id: 3, title: "CSS Grid Layouts", timestamp: "2 days ago" },
    { id: 4, title: "Python Data Structures", timestamp: "3 days ago" },
    { id: 5, title: "Web Design Principles", timestamp: "1 week ago" },
  ])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChatId, setCurrentChatId] = useState(null)
  const chatEndRef = useRef(null)

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
      setCurrentSessionId(newSessionId)
      setHasSession(true)
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
      const res = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, sessionId: currentSessionId }),
      })
      const data = await res.json()
      const aiReply = data.message || "Hmm, I didn't quite catch that."
      setMessages([...newMessages, { sender: "ai", text: aiReply }])
    } catch {
      setMessages([...newMessages, { sender: "ai", text: "⚠️ Error: Unable to reach backend." }])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      timestamp: "now",
    }
    setRecentChats([newChat, ...recentChats])
    setMessages([{ sender: "ai", text: "👋 Hi! I'm your AI tutor. What topic would you like to explore today?" }])
    setCurrentChatId(newChat.id)
  }

  const handleLoadChat = (chatId) => {
    setCurrentChatId(chatId)
    setMessages([{ sender: "ai", text: "Loading chat..." }])
  }

  if (!hasSession) {
    return (
      <Box className="chatbot-wrapper">
        <ChatSidebar
          recentChats={recentChats}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
          currentChatId={currentChatId}
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
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        currentChatId={currentChatId}
        sidebarOpen={sidebarOpen}
      />

      <Box className="chatbot-main">
        <Box className="chatbot-header-top">
          <IconButton
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ display: { xs: "flex", md: "none" }, color: "#b0b8ff" }}
          >
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
          </IconButton>
          <Box className="chatbot-header">HackTutor - Your Personalized AI Teaching Assistant</Box>
        </Box>

        <Box className="chatbot-messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}
          {loading && (
            <Box className="message ai">
              <CircularProgress size={16} sx={{ color: "#b0b8ff", mr: 1 }} /> Thinking...
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
