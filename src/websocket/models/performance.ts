import type { ServerStatusInfo } from 'src/models/server';
import type { SystemCpuInfo, SystemMemoryInfo } from 'src/models/system';

// --------------------------------------------------

export class Performance {
  public time: Date;

  public system: {
    cpu: SystemCpuInfo;
    memory: SystemMemoryInfo;
  };

  public servers: ServerStatusInfo[];

  constructor({ time, system, servers }: PerformanceInput) {
    this.time = new Date(time * 1000);
    this.system = {
      cpu: system.cpu,
      memory: system.memory,
    };
    this.servers = servers;
  }
}

export type PerformanceInput = {
  time: number;
  system: {
    cpu: SystemCpuInfo;
    memory: SystemMemoryInfo;
  };
  servers: ServerStatusInfo[];
};
