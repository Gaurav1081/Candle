const express = require('express');
const router = express.Router();

/**
 * POST /api/chatbot/chat
 * Handle chatbot conversation
 * 
 * Request body:
 * {
 *   message: string,
 *   conversationHistory: array (optional)
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required',
        response: "I'm here to help! Please ask me a question about CANDLE platform."
      });
    }

    // Get AI response using built-in logic
    const response = getSmartResponse(message.toLowerCase());

    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: "I'm having trouble right now. Please try asking again!"
    });
  }
});

/**
 * Smart response generator with context-aware answers
 */
function getSmartResponse(message) {
  // Dashboard related
  if (message.includes('dashboard') || message.includes('home')) {
    return "📊 The Dashboard is your home base! It shows:\n\n• Current Streak - Consecutive correct predictions\n• Total Points - Your lifetime score\n• Global Rank - How you compare to others\n• Accuracy Rate - Your prediction success percentage\n\nYou can also view Recent Predictions and Upcoming Earnings here.";
  }

  // Predictions
  if (message.includes('prediction') || message.includes('predict')) {
    return "🎯 To make a prediction:\n\n1. Click 'New Prediction' button\n2. Search for a company (e.g., GOOGL, AMZN, TSLA)\n3. Set your price expectation\n4. Predict MEET (will reach) or MISS (won't reach)\n5. Wait for earnings and see results!\n\nYou earn points for correct predictions. Start with companies you know!";
  }

  // Points system
  if (message.includes('points') || message.includes('score') || message.includes('earn')) {
    return "⭐ Points System:\n\n• Correct prediction = +Points (varies by difficulty)\n• Wrong prediction = -Points\n• Longer streaks = Bonus multipliers\n• Total Points = Lifetime score\n\nCheck the Leaderboard to see top scorers!";
  }

  // Streak
  if (message.includes('streak')) {
    return "🔥 Current Streak tracks consecutive correct predictions:\n\n• Each correct prediction adds 1 to streak\n• One miss resets streak to 0\n• Longer streaks earn bonus points\n• Keep it going for maximum rewards!\n\nYour current streak is shown on the Dashboard.";
  }

  // Accuracy
  if (message.includes('accuracy') || message.includes('rate')) {
    return "📈 Accuracy Rate = (Correct Predictions / Total Predictions) × 100\n\nFor example:\n• 5 correct out of 9 total = 55.6% accuracy\n• Higher accuracy = Better market understanding\n• Track it in Analytics to improve!\n\nGreat accuracy (60%+) shows you're learning!";
  }

  // VS Mode
  if (message.includes('vs') || message.includes('versus') || message.includes('1v1') || message.includes('compete')) {
    return "⚔️ VS Mode - Head-to-Head Predictions!\n\nHow it works:\n• Create a match and choose a stock\n• Invite someone or make it open\n• Both predict price direction (UP/DOWN/FLAT)\n• Set confidence level (1-5)\n• Winner takes points based on accuracy!\n\nPerfect for competitive trading!";
  }

  // Learning Center
  if (message.includes('learning') || message.includes('learn') || message.includes('tutorial') || message.includes('guide')) {
    return "📚 Learning Center has everything you need:\n\n• Stock Market Basics\n• How to Analyze Earnings\n• Prediction Strategies\n• Technical Analysis Tips\n• Common Mistakes to Avoid\n\nPerfect for beginners! Check it out in the sidebar.";
  }

  // Stock Search
  if (message.includes('search') || message.includes('find stock') || message.includes('company')) {
    return "🔍 Stock Search helps you find companies:\n\n• Enter company name (e.g., 'Amazon')\n• Or ticker symbol (e.g., 'AMZN')\n• View stock details and charts\n• See upcoming earnings dates\n• Make predictions!\n\nTry searching for companies you use daily.";
  }

  // Leaderboard
  if (message.includes('leaderboard') || message.includes('rank') || message.includes('top')) {
    return "🏆 Leaderboard shows top performers:\n\n• Global rankings updated real-time\n• See top scorers and their stats\n• Compare your performance\n• Climb ranks with accurate predictions\n\nYour Global Rank is shown on Dashboard. Keep climbing!";
  }

  // Community
  if (message.includes('community') || message.includes('users') || message.includes('social')) {
    return "👥 Community connects you with other traders:\n\n• Share prediction strategies\n• Discuss market trends\n• Learn from experienced users\n• Get tips and advice\n• Make trading friends!\n\nJoin discussions in the Community section.";
  }

  // Analytics
  if (message.includes('analytics') || message.includes('performance') || message.includes('stats')) {
    return "📊 Analytics tracks your performance:\n\n• Prediction history and results\n• Accuracy trends over time\n• Best performing sectors\n• Win/loss patterns\n• Improvement suggestions\n\nUse this data to refine your strategy!";
  }

  // MEET vs MISS
  if (message.includes('meet') || message.includes('miss')) {
    return "✅ MEET vs ❌ MISS explained:\n\n• MEET = Stock will reach/exceed your expectation\n• MISS = Stock won't reach your expectation\n\nExample: You set expectation at $350\n• Stock hits $355 = MEET ✅\n• Stock stays at $340 = MISS ❌\n\nAnalyze trends before choosing!";
  }

  // Specific stocks
  if (message.includes('amzn') || message.includes('amazon')) {
    return "📦 AMZN (Amazon) - E-commerce giant:\n\nCheck Dashboard for upcoming earnings! Amazon is one of the most traded stocks. Look at:\n• Recent revenue trends\n• Market conditions\n• Analyst expectations\n\nMake your prediction when ready!";
  }

  if (message.includes('googl') || message.includes('google')) {
    return "🔍 GOOGL (Google/Alphabet):\n\nTech giant with multiple revenue streams. Before predicting:\n• Check ad revenue trends\n• Cloud service performance\n• Overall tech sector mood\n\nSearch for GOOGL to see current stats!";
  }

  if (message.includes('tsla') || message.includes('tesla')) {
    return "⚡ TSLA (Tesla) - Electric vehicles:\n\nHighly volatile stock! Consider:\n• Production numbers\n• Delivery targets\n• Elon's recent tweets 😄\n• EV market competition\n\nGreat for learning prediction skills!";
  }

  if (message.includes('meta') || message.includes('facebook')) {
    return "📱 META (Meta/Facebook) - Social Media:\n\nWatch for:\n• User growth numbers\n• Metaverse investments\n• Ad revenue trends\n• Regulatory news\n\nCheck Upcoming Earnings for META dates!";
  }

  if (message.includes('nflx') || message.includes('netflix')) {
    return "🎬 NFLX (Netflix) - Streaming:\n\nKey factors:\n• Subscriber growth/loss\n• New content releases\n• Competition (Disney+, Prime)\n• International expansion\n\nEarnings often surprise - be careful!";
  }

  if (message.includes('aapl') || message.includes('apple')) {
    return "🍎 AAPL (Apple) - Tech hardware:\n\nConsider:\n• iPhone sales numbers\n• Services revenue growth\n• New product launches\n• Market saturation concerns\n\nOne of the most predictable tech stocks!";
  }

  if (message.includes('msft') || message.includes('microsoft')) {
    return "💻 MSFT (Microsoft) - Software & Cloud:\n\nWatch for:\n• Azure cloud growth\n• Office/Teams adoption\n• Gaming division (Xbox)\n• AI integration news\n\nStable performer with steady growth!";
  }

  // Getting started
  if (message.includes('how') || message.includes('start') || message.includes('begin') || message.includes('new')) {
    return "🚀 Welcome to CANDLE! Here's how to start:\n\n1️⃣ Explore Dashboard - See your stats\n2️⃣ Visit Learning Center - Learn basics\n3️⃣ Try Stock Search - Find a company you know\n4️⃣ Make Your First Prediction - Start small!\n5️⃣ Check Results - Learn from outcomes\n6️⃣ Try VS Mode - Compete with friends!\n\nDon't worry about mistakes - they help you learn! 💪";
  }

  // Help/Features
  if (message.includes('help') || message.includes('features') || message.includes('can you') || message.includes('what')) {
    return "💡 I can help you with:\n\n• 📊 Dashboard features (streak, points, rank)\n• 🎯 Making predictions (MEET/MISS)\n• ⭐ Earning points and climbing ranks\n• 📈 Understanding accuracy rates\n• 🔍 Searching for stocks\n• 📚 Learning resources\n• 👥 Community features\n• ⚔️ VS Mode competitions\n• 📊 Analytics and performance\n\nJust ask me anything about the platform!";
  }

  // Settings
  if (message.includes('setting') || message.includes('profile') || message.includes('account')) {
    return "⚙️ Settings & Profile:\n\n• Edit your profile information\n• Change password and security\n• Notification preferences\n• Display settings\n• Privacy controls\n\nFind Settings in the sidebar menu!";
  }

  // Notifications
  if (message.includes('notification') || message.includes('alert') || message.includes('remind')) {
    return "🔔 Notifications keep you updated:\n\n• Upcoming earnings alerts\n• Prediction results\n• Streak milestones\n• Rank changes\n• Community mentions\n• VS match invites\n\nManage them in Settings > Notifications!";
  }

  // Troubleshooting
  if (message.includes('problem') || message.includes('error') || message.includes('not working') || message.includes('bug')) {
    return "🔧 Having issues? Try these:\n\n1. Refresh the page\n2. Clear browser cache\n3. Check your internet connection\n4. Try different browser\n5. Contact support if problem persists\n\nMost issues resolve with a quick refresh!";
  }

  // Thanks/Bye
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! 😊 Happy trading! Feel free to ask me anything else about CANDLE.";
  }

  if (message.includes('bye') || message.includes('goodbye')) {
    return "Goodbye! 👋 Good luck with your predictions! I'm always here if you need help.";
  }

  // Default fallback
  return "I'm your CANDLE assistant! 🕯️\n\nI can help you with:\n• How to make predictions\n• Understanding Dashboard stats\n• Learning about the platform\n• Stock market basics\n• VS Mode competitions\n• Any questions about CANDLE!\n\nWhat would you like to know?";
}

module.exports = router;