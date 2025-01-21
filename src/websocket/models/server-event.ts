import Server from 'src/api/server';

// ----------------------------------------------------------------------

export default class ServerEvent {
  constructor(public serverId: string) {}

  async getServer(): Promise<Server> {
    return Server.get(this.serverId);
  }
}
