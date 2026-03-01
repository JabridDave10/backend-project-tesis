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
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { GpsTrackingService } from './gps-tracking.service';

interface ActiveDriver {
  socketId: string;
  driverId: number;
  userId: number;
  firstName: string;
  lastName: string;
  position: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
    status: string;
  } | null;
}

@WebSocketGateway({
  namespace: '/gps',
  cors: {
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  },
})
export class GpsTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private activeDrivers = new Map<number, ActiveDriver>();
  private socketToDriver = new Map<string, number>();

  constructor(
    private jwtService: JwtService,
    private gpsTrackingService: GpsTrackingService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('WebSocket: No token provided, disconnecting', client.id);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      (client as any).user = payload;
      console.log(`WebSocket: User ${payload.username} connected (${client.id})`);
    } catch (error) {
      console.log('WebSocket: Invalid token, disconnecting', client.id, error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const driverId = this.socketToDriver.get(client.id);
    if (driverId) {
      this.activeDrivers.delete(driverId);
      this.socketToDriver.delete(client.id);

      try {
        await this.gpsTrackingService.updateDriverStatus(driverId, 'disponible');
      } catch (error) {
        console.error('Error updating driver status on disconnect:', error);
      }

      this.server.to('admins').emit('driver_offline', { id_driver: driverId });
      console.log(`WebSocket: Driver ${driverId} disconnected`);
    }
  }

  @SubscribeMessage('register_driver')
  async handleRegisterDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id_driver: number },
  ) {
    const user = (client as any).user;
    if (!user) return;

    const driverId = data.id_driver;
    this.activeDrivers.set(driverId, {
      socketId: client.id,
      driverId,
      userId: user.sub,
      firstName: user.first_name || user.username,
      lastName: user.last_name || '',
      position: null,
    });
    this.socketToDriver.set(client.id, driverId);

    await this.gpsTrackingService.updateDriverStatus(driverId, 'en_ruta');
    console.log(`WebSocket: Driver ${driverId} registered for tracking`);

    client.emit('registered', { success: true, id_driver: driverId });
  }

  @SubscribeMessage('gps_update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      id_driver: number;
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
      status?: string;
      id_vehicle?: number;
      id_route?: number;
    },
  ) {
    const user = (client as any).user;
    if (!user) return;

    const positionData = {
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading || 0,
      accuracy: data.accuracy || 0,
      status: data.status || 'en_ruta',
    };

    const activeDriver = this.activeDrivers.get(data.id_driver);
    if (activeDriver) {
      activeDriver.position = positionData;
    }

    // Save to DB asynchronously
    this.gpsTrackingService
      .saveLocation({
        id_driver: data.id_driver,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        accuracy: data.accuracy,
        status: data.status,
        id_vehicle: data.id_vehicle,
        id_route: data.id_route,
      })
      .catch((err) => console.error('Error saving GPS location:', err));

    // Broadcast to admin dashboard
    this.server.to('admins').emit('vehicle_position', {
      id_driver: data.id_driver,
      first_name: activeDriver?.firstName || user.username,
      last_name: activeDriver?.lastName || '',
      ...positionData,
      id_vehicle: data.id_vehicle,
      id_route: data.id_route,
      recorded_at: new Date().toISOString(),
    });
  }

  @SubscribeMessage('subscribe_dashboard')
  async handleSubscribeDashboard(@ConnectedSocket() client: Socket) {
    const user = (client as any).user;
    if (!user) return;

    client.join('admins');
    console.log(`WebSocket: User ${user.username} subscribed to dashboard`);

    // Send current active drivers
    const activeDriversList = Array.from(this.activeDrivers.values())
      .filter((d) => d.position !== null)
      .map((d) => ({
        id_driver: d.driverId,
        first_name: d.firstName,
        last_name: d.lastName,
        ...d.position,
        recorded_at: new Date().toISOString(),
      }));

    client.emit('active_drivers', activeDriversList);
  }

  @SubscribeMessage('stop_tracking')
  async handleStopTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id_driver: number },
  ) {
    const driverId = data.id_driver;
    this.activeDrivers.delete(driverId);
    this.socketToDriver.delete(client.id);

    try {
      await this.gpsTrackingService.updateDriverStatus(driverId, 'disponible');
    } catch (error) {
      console.error('Error updating driver status:', error);
    }

    this.server.to('admins').emit('driver_offline', { id_driver: driverId });
    client.emit('tracking_stopped', { success: true });
    console.log(`WebSocket: Driver ${driverId} stopped tracking`);
  }
}
