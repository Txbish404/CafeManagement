const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();

    this.wss.on('connection', (ws, req) => {
      const token = req.url.split('token=')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        this.clients.set(decoded.userId, ws);

        ws.on('close', () => {
          this.clients.delete(decoded.userId);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        });
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.close();
      }
    });
  }

  notifyUser(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  notifyStaff(data) {
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketService;
