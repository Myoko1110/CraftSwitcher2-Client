// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from 'dayjs';

import {z} from "zod";
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
    public readonly lastBackupAt: Dayjs | null,
    public readonly lastBackupId: string | null,
    public readonly sourceId: string | null,
    public readonly installer: Installer,
  ) {}

  static serialize(config: Partial<ServerConfig>) {
    return {
      name: config.name,
      type: config.type?.name,
      ...config.launchOption?.serializeToConfig(),
      enableLaunchCommand: config.enableLaunchCommand,
      launchCommand: config.launchCommand,
      stopCommand: config.stopCommand,
      shutdownTimeout: config.shutdownTimeout,
    };
  }

  static deserializeFromResult(data: ServerConfigAPIResult): ServerConfig {
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
      data.lastBackupAt ? dayjs.utc(data.lastBackupAt) : null,
      data.lastBackupId,
      data.sourceId,
      {
        type: data['installer.type'] ? ServerType.valueOf(data['installer.type']) : null,
        version: data['installer.version'],
        build: data['installer.build'],
        requireBuild: data['installer.requireBuild'],
      }
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

  serializeToConfig() {
    return {
      'launchOption.java_preset': this.javaPreset,
      'launchOption.java_executable': this.javaExecutable,
      'launchOption.java_options': this.javaOptions,
      'launchOption.jar_file': this.jarFile,
      'launchOption.server_options': this.serverOptions,
      'launchOption.max_heap_memory': this.maxHeapMemory,
      'launchOption.min_heap_memory': this.minHeapMemory,
      'launchOption.enable_free_memory_check': this.enableFreeMemoryCheck,
      'launchOption.enable_reporter_agent': this.enableReporterAgent,
      'launchOption.enable_screen': this.enableScreen,
    };
  }

  serializeToServer() {
    return {
      java_preset: this.javaPreset,
      java_executable: this.javaExecutable,
      java_options: this.javaOptions,
      jar_file: this.jarFile,
      server_options: this.serverOptions,
      max_heap_memory: this.maxHeapMemory,
      min_heap_memory: this.minHeapMemory,
      enable_free_memory_check: this.enableFreeMemoryCheck,
      enable_reporter_agent: this.enableReporterAgent,
      enable_screen: this.enableScreen,
    };
  }

  static deserializeFromConfig(config: ServerConfigAPIResult): LaunchOption {
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

const serverConfigSchemaRaw = z.object({
  name: z.string().nullable(),
  type: z.string(),
  'launchOption.javaPreset': z.string().nullable(),
  'launchOption.javaExecutable': z.string().nullable(),
  'launchOption.javaOptions': z.string().nullable(),
  'launchOption.jarFile': z.string(),
  'launchOption.serverOptions': z.string().nullable(),
  'launchOption.maxHeapMemory': z.number().nullable(),
  'launchOption.minHeapMemory': z.number().nullable(),
  'launchOption.enableFreeMemoryCheck': z.boolean().nullable(),
  'launchOption.enableReporterAgent': z.boolean().nullable(),
  'launchOption.enableScreen': z.boolean().nullable(),
  enableLaunchCommand: z.boolean().nullable(),
  launchCommand: z.string().nullable(),
  stopCommand: z.string().nullable(),
  shutdownTimeout: z.number().nullable(),
  createdAt: z.string().nullable(),
  lastLaunchAt: z.string().nullable(),
  lastBackupAt: z.string().nullable(),
  lastBackupId: z.string().nullable(),
  sourceId: z.string().nullable(),
  'installer.type': z.string().nullable(),
  'installer.version': z.string().nullable(),
  'installer.build': z.string().nullable(),
  'installer.requireBuild': z.boolean().nullable(),
});
export type ServerConfigAPIResult = z.infer<typeof serverConfigSchemaRaw>;
export const serverConfigSchema = serverConfigSchemaRaw.transform((data) => ServerConfig.deserializeFromResult(data));

export const launchOptionSchema = z.object({
  javaPreset: z.string().nullable(),
  javaExecutable: z.string().nullable(),
  javaOptions: z.string().nullable(),
  jarFile: z.string(),
  serverOptions: z.string().nullable(),
  maxHeapMemory: z.number().nullable(),
  minHeapMemory: z.number().nullable(),
  enableFreeMemoryCheck: z.boolean().nullable(),
  enableReporterAgent: z.boolean().nullable(),
  enableScreen: z.boolean().nullable()
});

type Installer = {
  type: ServerType | null,
  version: string | null,
  build: string | null,
  requireBuild: boolean | null,
}
