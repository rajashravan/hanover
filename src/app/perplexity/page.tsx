"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./perplexity.module.css";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    link: string;
    snippet: string;
    thumbnail?: string;
  }>;
  images?: Array<{
    url: string;
    alt: string;
  }>;
}

export default function Perplexity() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      console.log('response', response);
      const data = await response.json();
      console.log('data', data);

      if (!response.ok) throw new Error(data.error);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
      }]);
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <img 
              src="https://pbs.twimg.com/profile_images/1884999016267595776/TEHQlcwt_400x400.png"
              alt="Hanover Logo"
              width="32"
              height="32"
            />
          </div>
          <div className={styles.headerText}>
            <h1>Hanover AI Chat</h1>
            <p>Ask anything and get AI-powered answers with reliable sources</p>
          </div>
        </div>
      </div>
      <div className={styles.chatArea} ref={chatAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageWrapper}>
            <div className={`${styles.message} ${
              message.role === 'user' 
                ? styles.userMessage 
                : styles.assistantMessage
            }`}>
              <div className={styles.messageHeader}>
                <h2>{message.role === 'user' ? 'You' : 'Perplexity'}</h2>
              </div>
              <div className={styles.messageContent}>
                {message.content}
              </div>
              
              {/* Display images if present */}
              {message.images && message.images.length > 0 && (
                <div className={styles.imageGrid}>
                  {message.images.map((image, idx) => (
                    <div key={idx} className={styles.imageWrapper}>
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        className={styles.image}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Existing sources display */}
              {message.sources && (
                <div className={styles.sources}>
                  <h4>Sources:</h4>
                  {message.sources.map((source, idx) => (
                    <div key={idx} className={styles.source}>
                      {source.thumbnail && (
                        <img 
                          src={source.thumbnail} 
                          alt={source.title}
                          className={styles.sourceThumbnail}
                        />
                      )}
                      <a href={source.link} target="_blank" rel="noopener noreferrer">
                        [{idx + 1}] {source.title}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything..."
              className={styles.input}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 