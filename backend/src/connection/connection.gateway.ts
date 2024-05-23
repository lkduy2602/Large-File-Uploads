import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ConnectionGateway {
  @WebSocketServer()
  private readonly server: Server;

  emitSuccessUpload(bucket: string, link: string) {
    const mediaPath = '/' + bucket + '/' + link;
    this.server.emit(`success_upload_${link}`, mediaPath);
  }
}
