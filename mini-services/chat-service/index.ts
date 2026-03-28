import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'groomconnect-secret-key-change-in-production';
const PORT = 3003;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', '*'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    socket.data.user = payload;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`User connected: ${user.email} (${user.userId})`);

  // Store user connection
  connectedUsers.set(user.userId, socket.id);

  // Join user's personal room for notifications
  socket.join(`user:${user.userId}`);

  // Handle joining conversation room
  socket.on('join:conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${user.email} joined conversation ${conversationId}`);
  });

  // Handle leaving conversation room
  socket.on('leave:conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${user.email} left conversation ${conversationId}`);
  });

  // Handle sending message
  socket.on('message:send', (data: {
    conversationId: string;
    receiverId: string;
    content: string;
  }) => {
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      conversationId: data.conversationId,
      senderId: user.userId,
      receiverId: data.receiverId,
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    // Emit to conversation room
    io.to(`conversation:${data.conversationId}`).emit('message:received', messageData);

    // Emit to receiver's personal room for notification
    io.to(`user:${data.receiverId}`).emit('notification:message', {
      type: 'NEW_MESSAGE',
      message: messageData,
    });
  });

  // Handle typing indicator
  socket.on('typing:start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:started', {
      userId: user.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('typing:stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:stopped', {
      userId: user.userId,
      conversationId: data.conversationId,
    });
  });

  // Handle booking notifications
  socket.on('booking:new', (data: { businessOwnerId: string; bookingId: string }) => {
    io.to(`user:${data.businessOwnerId}`).emit('notification:booking', {
      type: 'BOOKING_CONFIRMED',
      bookingId: data.bookingId,
    });
  });

  // Handle booking status updates
  socket.on('booking:update', (data: { customerId: string; status: string; bookingId: string }) => {
    io.to(`user:${data.customerId}`).emit('notification:booking_update', {
      type: 'BOOKING_UPDATE',
      bookingId: data.bookingId,
      status: data.status,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${user.email}`);
    connectedUsers.delete(user.userId);
  });
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: connectedUsers.size }));
  }
});

httpServer.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
});
