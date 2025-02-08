"use client";

import { useState } from "react";
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
      <div className={styles.chatArea}>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageWrapper}>
            <div className={`${styles.message} ${
              message.role === 'user' 
                ? styles.userMessage 
                : styles.assistantMessage
            }`}>
              <p>{message.content}</p>
              
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