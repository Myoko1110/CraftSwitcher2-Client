import type { ServerStatusInfo } from 'src/models/server';
import type { SystemCpuInfo, SystemMemoryInfo } from 'src/models/system';
import dayjs, { Dayjs } from 'dayjs';

// --------------------------------------------------

export class Performance {
  public time: Dayjs;

  public system: {
    cpu: SystemCpuInfo;
    memory: SystemMemoryInfo;
  };

  public servers: ServerStatusInfo[];

  constructor({ time, system, servers }: PerformanceInput) {
    this.time = dayjs.utc(time * 1000);
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
