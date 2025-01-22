// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from 'dayjs';
import type { AxiosResponse } from 'axios';

import dayjs from 'dayjs';

import ServerType from './server-type';

export class ServerConfig {
  constructor(
    public name: string | null,
    public type: ServerType,
    public launchOption: LaunchOption,
    public enableLaunchCommand: boolean | null,
    public launchCommand: string | null,
    public stopCommand: string | null,
    public shutdownTimeout: number | null,
    public readonly createdAt: Dayjs | null,
    public readonly lastLaunchAt: Dayjs | null,
    public readonly lastBackupAt: Dayjs | null
  ) {}

  static serialize(config: Partial<ServerConfig>) {
    return {
      name: config.name,
      type: config.type?.name,
      ...config.launchOption?.toConfig(),
      enableLaunchCommand: config.enableLaunchCommand,
      launchCommand: config.launchCommand,
      stopCommand: config.stopCommand,
      shutdownTimeout: config.shutdownTimeout,
    };
  }

  static deserializeFromResult(result: AxiosResponse): ServerConfig {
    const data = result.data as ServerConfigResult;

    return new ServerConfig(
      data.name,
      ServerType.valueOf(data.type),
      LaunchOption.deserializeFromConfig(data),
      data.enableLaunchCommand,
      data.launchCommand,
      data.stopCommand,
      data.shutdownTimeout,
      data.createdAt ? dayjs.utc(data.createdAt) : null,
      data.lastLaunchAt ? dayjs.utc(data.lastLaunchAt) : null,
      data.lastBackupAt ? dayjs.utc(data.lastBackupAt) : null
    );
  }
}

export class LaunchOption {
  constructor(
    public javaPreset: string | null,
    public javaExecutable: string | null,
    public javaOptions: string | null,
    public jarFile: string,
    public serverOptions: string | null,
    public maxHeapMemory: number | null,
    public minHeapMemory: number | null,
    public enableFreeMemoryCheck: boolean | null,
    public enableReporterAgent: boolean | null,
    public enableScreen: boolean | null
  ) {}

  toConfig() {
    return {
      'launchOption.java_preset': this.javaPreset,
      'launchOption.java_executable': this.javaExecutable,
      'launchOption.java_options': this.javaOptions,
      'launchOption.jar_file': this.jarFile,
      'launchOption.server_options': this.serverOptions,
      'launchOption.max_heap_memory': this.maxHeapMemory,
      'launchOption.min_heap_memory': this.minHeapMemory,
      'launchOption.enable_free_memory_check': this.enableFreeMemoryCheck,
      'launchOption.enable_report': this.enableReporterAgent,
      'launchOption.enable_screen': this.enableScreen,
    };
  }

  toCreateSchema() {
    return {
      java_preset: this.javaPreset,
      java_executable: this.javaExecutable,
      java_options: this.javaOptions,
      jar_file: this.jarFile,
      server_options: this.serverOptions,
      max_heap_memory: this.maxHeapMemory,
      min_heap_memory: this.minHeapMemory,
      enable_free_memory_check: this.enableFreeMemoryCheck,
      enable_report: this.enableReporterAgent,
      enable_screen: this.enableScreen,
    };
  }

  static deserializeFromConfig(config: ServerConfigResult): LaunchOption {
    return new LaunchOption(
      config['launchOption.javaPreset'],
      config['launchOption.javaExecutable'],
      config['launchOption.javaOptions'],
      config['launchOption.jarFile'],
      config['launchOption.serverOptions'],
      config['launchOption.maxHeapMemory'],
      config['launchOption.minHeapMemory'],
      config['launchOption.enableFreeMemoryCheck'],
      config['launchOption.enableReporterAgent'],
      config['launchOption.enableScreen']
    );
  }
}

export type ServerConfigResult = {
  name: string | null;
  type: string;
  'launchOption.javaPreset': string | null;
  'launchOption.javaExecutable': string | null;
  'launchOption.javaOptions': string | null;
  'launchOption.jarFile': string;
  'launchOption.serverOptions': string | null;
  'launchOption.maxHeapMemory': number | null;
  'launchOption.minHeapMemory': number | null;
  'launchOption.enableFreeMemoryCheck': boolean | null;
  'launchOption.enableReporterAgent': boolean | null;
  'launchOption.enableScreen': boolean | null;
  enableLaunchCommand: boolean | null;
  launchCommand: string;
  stopCommand: string | null;
  shutdownTimeout: number | null;
  createdAt: string | null;
  lastLaunchAt: string | null;
  lastBackupAt: string | null;
  // TODO: 追加
};
