"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Button } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faComment, faClock } from "@fortawesome/free-solid-svg-icons"
import "../../css/chatbot.css"

const ChatSidebar = ({recentChats, onNewChat, currentChatId, sidebarOpen }) => {
  const navigate = useNavigate();
  recentChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Box className={`sidebar-container ${sidebarOpen ? "open" : "closed"}`}>
      {/* Sidebar Header */}
      <Box className="sidebar-header">
        <h2>
          <FontAwesomeIcon icon={faComment} style={{ marginRight: "0.5rem" }} />
          Chats
        </h2>
      </Box>

      {/* New Chat Button */}
      <Button fullWidth className="new-chat-button" onClick={onNewChat} startIcon={<FontAwesomeIcon icon={faPlus} />}>
        New Chat
      </Button>

      {/* Recent Chats List */}
      <Box className="sidebar-list">
        {recentChats.length > 0 ? (
          recentChats.map((chat, i) => (
            <Box
              key={chat.id}
              className={`sidebar-item ${currentChatId === chat.id ? "active" : ""}`}
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <Box className="sidebar-item-content">
                <div className="sidebar-item-title">Chat {i+1}</div>
                <div className="sidebar-item-time">
                  <FontAwesomeIcon icon={faClock} style={{ marginRight: "0.3rem", fontSize: "0.75rem" }} />
                  {chat.timestamp}
                </div>
              </Box>
            </Box>
          ))
        ) : (
          <Box className="sidebar-empty">
            <FontAwesomeIcon icon={faComment} />
            <p>No chats yet. Start a new one!</p>
          </Box>
        )}
      </Box>
      <Button fullWidth className="new-chat-button" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  )
}

export default ChatSidebar
