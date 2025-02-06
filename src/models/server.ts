import type ServerType from 'src/enums/server-type';
import type { LaunchOption } from 'src/enums/server-config';

// ------------------------------------------------------------

export type ServerResult = {
  id: string;
  name: string | null;
  type: string;
  state: string;
  directory: string | null;
  isLoaded: boolean;
  buildStatus: string | null;
  status: ServerStatusInfo | null;
};

export type CreateServerParams = {
  name: string | null;
  directory: string;
  type: ServerType;
  launchOption: LaunchOption;
  enableLaunchCommand?: boolean;
  launchCommand?: string;
  stopCommand?: string | null;
  shutdownTimeout?: number | null;
};

export type ServerStatusInfo = {
  id: string;
  process?: {
    cpuUsage: number;
    memUsed: number;
    memVirtualUsed: number;
  };
  jvm?: {
    cpuUsage?: number;
    memUsed?: number;
    memTotal?: number;
  };
  game?: {
    ticks?: number;
    maxPlayers?: number;
    onlinePlayers?: number;
    players?: {
      uuid: string;
      name: string;
    }[];
  };
};

/**
export type ServerOperationResult = {
  result: boolean;
  serverId: string;
};
 */
