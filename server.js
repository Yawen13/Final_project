const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Import and use the user router
app.use('/api', require('./router/user_router'));

app.listen(PORT, () => {
  console.log(`Backend Server running at http://localhost:${PORT}`);
});