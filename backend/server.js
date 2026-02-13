const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exchange', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log('✅ MongoDB已连接'); })
  .catch(err => { console.error('❌ MongoDB连接失败:', err); });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/market', require('./routes/market'));
app.use('/api/trade', require('./routes/trade'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('🔗 新用户连接:', socket.id);
  socket.on('subscribe-price', (pair) => {
    console.log(`📊 用户订阅 ${pair}`);
  });
  socket.on('disconnect', () => {
    console.log('🔌 用户断开连接');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});