import React, { useState, useRef, useEffect } from 'react';
import styles from './AiChat.module.scss';
import clsx from 'clsx';
import { Send, Bot } from 'lucide-react';
import { useTaskStore } from '../../features/tasks/store/taskStore';
import { useTrackingStore } from '../../features/tracking/store/trackingStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm your productivity assistant. How can I help you today?", sender: 'ai', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { tasks } = useTaskStore();
  const { currentSession } = useTrackingStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateResponse(userMsg.text);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        text: aiResponse,
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Simple heuristic response generation (Mock AI)
  const generateResponse = (text: string): string => {
    const lower = text.toLowerCase();
    
    if (lower.includes('status') || lower.includes('progress')) {
      const pending = tasks.filter(t => !t.completed).length;
      return `You have ${pending} pending tasks. ${currentSession ? 'You are currently in a focus session.' : 'You are not tracking time currently.'}`;
    }
    
    if (lower.includes('suggest') || lower.includes('what should i do')) {
      const highPri = tasks.find(t => t.priority === 'high' && !t.completed);
      if (highPri) return `I recommend starting with your high priority task: "${highPri.title}".`;
      return "You're all caught up on high priority tasks! Maybe take a break or pick a medium priority task.";
    }

    if (lower.includes('hello') || lower.includes('hi')) {
      return "Hello! Ready to be productive?";
    }

    return "I'm a simple AI for now. I can help you check your status or suggest tasks. Try asking 'What should I do?' or 'Status'.";
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={clsx(styles.message, styles[msg.sender])}>
            {msg.sender === 'ai' && <Bot size={14} style={{marginRight: 4, display: 'inline'}} />}
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className={clsx(styles.message, styles.ai)}>
            <span style={{fontStyle: 'italic', fontSize: '0.8rem'}}>Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI..."
          disabled={isTyping}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
