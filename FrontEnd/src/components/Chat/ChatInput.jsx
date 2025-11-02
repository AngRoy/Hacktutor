// src/components/Chat/ChatInput.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash, FaPaperPlane } from "react-icons/fa";
import "../../css/chatbot.css";

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const baseTranscriptRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      const base = baseTranscriptRef.current;
      const text = `${base}${transcript}`;
      setInput(text.replace(/^\s+/, ""));
    };

    recognitionRef.current = recognition;
    setIsSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!disabled || !isListening) return;
    recognitionRef.current?.stop();
  }, [disabled, isListening]);

  const handleSend = (type) => {
    if (!input.trim()) return;
    onSend(input, type);
    setInput("");
  };

  const toggleListening = () => {
    if (!isSpeechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    const needsSpace = input && !/\s$/.test(input);
    baseTranscriptRef.current = needsSpace ? `${input} ` : input;

    try {
      recognitionRef.current.start();
    } catch (error) {
      // Some browsers throw if start is called while recognition is starting.
      // Swallowing the error keeps the UI responsive for the user.
      console.error("Speech recognition failed to start", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDownload = () => {};

  return (
    <footer className="chatbot-input">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question..."
        disabled={disabled}
      />
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !isSpeechSupported}
        aria-pressed={isListening}
        className={isListening ? "chatbot-mic active" : "chatbot-mic"}
        title={
          isSpeechSupported
            ? isListening
              ? "Stop voice input"
              : "Start voice input"
            : "Speech recognition is not supported in this browser"
        }
      >
        {isListening ? (
          <FaMicrophoneSlash style={{ marginRight: "6px" }} />
        ) : (
          <FaMicrophone style={{ marginRight: "6px" }} />
        )}
        {isListening ? "Listening" : "Voice"}
      </button>
      <button onClick={() => handleSend("img")} disabled={disabled}>
        <FaPaperPlane style={{ marginRight: "6px" }} /> Send
      </button>
      <button onClick={handleDownload} disabled={disabled}>
        <FaPaperPlane style={{ marginRight: "6px" }} /> Generate Video
      </button>
    </footer>
  );
};

export default ChatInput;
