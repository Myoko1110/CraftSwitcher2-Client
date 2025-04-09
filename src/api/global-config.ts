import { z } from "zod";
import axios from 'axios';

import { APIError } from 'src/enums/api-error';

// ------------------------------------------------------------

export class ServerGlobalConfig {
  public launchOption: GlobalConfigLaunchOption;

  public shutdownTimeout: number;

  constructor(private readonly config: ServerGlobalConfigAPIResult) {
    this.launchOption = config.launchOption;
    this.shutdownTimeout = config.shutdownTimeout;
  }

  static async get(): Promise<ServerGlobalConfig> {
    try {
      const result = await axios.get('/config/server_global');
      return new ServerGlobalConfig(ServerGlobalConfigSchema.parse(result.data));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async save(): Promise<void> {
    try {
      await axios.put('/config/server_global', {
        'launchOption.javaPreset': this.launchOption.javaPreset,
        'launchOption.javaExecutable': this.launchOption.javaExecutable,
        'launchOption.javaOptions': this.launchOption.javaOptions,
        'launchOption.serverOptions': this.launchOption.serverOptions,
        'launchOption.maxHeapMemory': this.launchOption.maxHeapMemory,
        'launchOption.minHeapMemory': this.launchOption.minHeapMemory,
        'launchOption.enableFreeMemoryCheck': this.launchOption.enableFreeMemoryCheck,
        'launchOption.enableReporterAgent': this.launchOption.enableReporterAgent,
        'launchOption.enableScreen': this.launchOption.enableScreen,
        shutdownTimeout: this.shutdownTimeout,
      });
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

// -------------------------------------------------------------

const LaunchOptionSchema = z.object({
  'launchOption.javaPreset': z.string(),
  'launchOption.javaExecutable': z.string().nullable(),
  'launchOption.javaOptions': z.string(),
  'launchOption.serverOptions': z.string(),
  'launchOption.maxHeapMemory': z.number().int(),
  'launchOption.minHeapMemory': z.number().int(),
  'launchOption.enableFreeMemoryCheck': z.boolean(),
  'launchOption.enableReporterAgent': z.boolean(),
  'launchOption.enableScreen': z.boolean(),
})

const ServerGlobalConfigSchema = LaunchOptionSchema.extend({
  shutdownTimeout: z.number(),
}).transform((data) => ({
  launchOption: {
    javaPreset: data['launchOption.javaPreset'],
    javaExecutable: data['launchOption.javaExecutable'],
    javaOptions: data['launchOption.javaOptions'],
    serverOptions: data['launchOption.serverOptions'],
    maxHeapMemory: data['launchOption.maxHeapMemory'],
    minHeapMemory: data['launchOption.minHeapMemory'],
    enableFreeMemoryCheck: data['launchOption.enableFreeMemoryCheck'],
    enableReporterAgent: data['launchOption.enableReporterAgent'],
    enableScreen: data['launchOption.enableScreen'],
  },
  shutdownTimeout: data.shutdownTimeout,
}));

type ServerGlobalConfigAPIResult = z.infer<typeof ServerGlobalConfigSchema>;
export type GlobalConfigLaunchOption = ServerGlobalConfigAPIResult["launchOption"];
