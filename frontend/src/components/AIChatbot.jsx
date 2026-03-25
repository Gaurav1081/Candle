import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Sparkles } from 'lucide-react';
import apiService from './utils/api';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your CANDLE guide. I'm here to help you navigate the platform and learn about stock predictions. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    try {
      const response = await apiService.request('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        }),
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response 
      }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      
      // Fallback to local responses
      const fallbackResponse = getFallbackResponse(userMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackResponse 
      }]);
    }
    
    setIsTyping(false);
  };

  const getFallbackResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('home')) {
      return "📊 The Dashboard is your home base! It shows your Current Streak (consecutive correct predictions), Total Points, Global Rank, and Accuracy Rate. You can also see your Recent Predictions and Upcoming Earnings here.";
    }
    
    if (lowerMessage.includes('prediction') || lowerMessage.includes('predict')) {
      return "🎯 To make a prediction: Click 'New Prediction' button, search for a company, set your expectation, and predict if the stock will MEET or MISS it. You'll earn points for correct predictions! Try starting with companies you know.";
    }
    
    if (lowerMessage.includes('points') || lowerMessage.includes('score')) {
      return "⭐ You earn points for correct predictions! Your Total Points show your lifetime score. Keep your streak going for bonus points. Check the Leaderboard to see how you rank against other users.";
    }
    
    if (lowerMessage.includes('streak')) {
      return "🔥 Your Current Streak counts consecutive correct predictions. Make accurate predictions to build your streak! If you miss a prediction, your streak resets to 0. Longer streaks can earn you bonus points!";
    }
    
    if (lowerMessage.includes('vs') || lowerMessage.includes('versus') || lowerMessage.includes('1v1')) {
      return "⚔️ VS Mode lets you compete head-to-head with other users! Create a match, invite someone or make it open, predict stock movements, and see who's more accurate. Winner takes points!";
    }
    
    if (lowerMessage.includes('learning') || lowerMessage.includes('learn') || lowerMessage.includes('tutorial')) {
      return "📚 Check out the Learning Center in the sidebar! It has tutorials on stock market basics, how to analyze earnings, and tips for better predictions. Perfect for beginners!";
    }
    
    return "I'm here to help you navigate CANDLE! Ask me about Dashboard features, how to make predictions, earning points, building streaks, VS Mode, or stock market basics. What would you like to know?";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    
    getAIResponse(userMessage);
  };

  const quickActions = [
    "How do I make a prediction?",
    "What is Current Streak?",
    "How do points work?",
    "Explain VS Mode"
  ];

  const handleQuickAction = (action) => {
    setMessages(prev => [...prev, { role: 'user', content: action }]);
    getAIResponse(action);
  };

  return (
    <>
      {/* Floating Chat Button - CANDLE gradient */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-12 right-8 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-candle-accent-blue focus:ring-offset-2 focus:ring-offset-candle-bg ${
          isOpen 
            ? 'bg-gradient-to-br from-red-500 to-orange-600' 
            : 'candle-gradient'
        }`}
        aria-label="Toggle chatbot"
      >
        <div className="flex items-center justify-center">
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </div>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-pulse ring-2 ring-candle-bg" />
        )}
      </button>

      {/* Chat Window - CANDLE themed */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col premium-card border-candle-electric-blue/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header - CANDLE gradient */}
          <div className="flex items-center justify-between px-5 py-4 candle-gradient text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">CANDLE Assistant</h3>
                <p className="text-xs text-white/80">Your trading guide</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container - CANDLE dark theme */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-candle-bg">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full candle-gradient flex items-center justify-center flex-shrink-0 ring-2 ring-candle-electric-blue/30">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-candle-electric-blue text-white rounded-tr-sm'
                      : 'glass-card border-candle-electric-blue/20 text-white rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full candle-gradient flex items-center justify-center flex-shrink-0 ring-2 ring-candle-electric-blue/30">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="glass-card border-candle-electric-blue/20 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-candle-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-candle-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-candle-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions - CANDLE themed */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-candle-bg/95 border-t border-candle-electric-blue/20">
              <p className="text-xs font-medium text-candle-muted-blue mb-2">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-2 rounded-lg glass-card hover:glass-card-light border border-candle-electric-blue/20 hover:border-candle-accent-blue/50 text-candle-muted-blue hover:text-white transition-all text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form - CANDLE themed */}
          <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 bg-candle-bg/95 border-t border-candle-electric-blue/20"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 rounded-xl glass-card border border-candle-electric-blue/20 text-white placeholder:text-candle-muted-blue focus:outline-none focus:ring-2 focus:ring-candle-accent-blue focus:border-candle-accent-blue disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 rounded-xl candle-gradient hover:shadow-glow text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-candle-accent-blue focus:ring-offset-2 focus:ring-offset-candle-bg"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;