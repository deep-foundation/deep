import ws from 'ws';
import http from 'http';

export async function GET(request: Request) {
  return Response.json({ deep: true });
};

export async function POST(request: Request) {
  return Response.json({ deep: true });
};

export function SOCKET(
  client: ws.WebSocket,
  request: http.IncomingMessage,
  server: ws.WebSocketServer
) {
  console.log('A client connected');

  client.on('message', (message) => {
    console.log('Received message:', message);
    client.send(message);
  });

  client.on('close', () => {
    console.log('A client disconnected');
  });
};
