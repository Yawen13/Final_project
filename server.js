const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import and use the user router
app.use('/api', require('./router/user_router'));
// Posts, comments, likes, reposts, and bookmarks
app.use('/api', require('./router/post_router'));
// Direct messages
app.use('/api', require('./router/conversation_router'));
// Image and video uploads backed by Firebase Storage
app.use('/api', require('./router/upload_router'));

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});