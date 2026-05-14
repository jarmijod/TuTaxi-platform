import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../redis/redis.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/rides',
})
export class RidesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redis: RedisService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await this.redis.set(`socket:${userId}`, client.id, 3600);
      client.join(`user:${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await this.redis.del(`socket:${userId}`);
    }
  }

  @SubscribeMessage('join:ride')
  handleJoinRide(@ConnectedSocket() client: Socket, @MessageBody() rideId: string) {
    client.join(`ride:${rideId}`);
  }

  @SubscribeMessage('leave:ride')
  handleLeaveRide(@ConnectedSocket() client: Socket, @MessageBody() rideId: string) {
    client.leave(`ride:${rideId}`);
  }

  @SubscribeMessage('driver:location')
  handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; lat: number; lng: number; heading?: number },
  ) {
    this.server.to(`ride:${data.rideId}`).emit('ride:driver_location', data);
  }

  // Server-side emit methods
  emitRideRequested(driverIds: string[], rideData: any) {
    driverIds.forEach((id) => {
      this.server.to(`user:${id}`).emit('ride:requested', rideData);
    });
  }

  emitRideAccepted(rideId: string, data: any) {
    this.server.to(`ride:${rideId}`).emit('ride:accepted', data);
  }

  emitRideStatusUpdate(rideId: string, status: string, data?: any) {
    this.server.to(`ride:${rideId}`).emit(`ride:${status}`, data);
  }

  emitRideCancelled(rideId: string, data: any) {
    this.server.to(`ride:${rideId}`).emit('ride:cancelled', data);
  }
}
