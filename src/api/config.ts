import axios from 'axios';

export class ServerGlobalConfig {
  public javaExecutable: string;

  public javaOptions: string;

  public serverOptions: string;

  public maxHeapMemory: number;

  public minHeapMemory: number;

  public enableFreeMemoryCheck: boolean;

  public enableReporterAgent: boolean;

  public shutdownTimeout: number;

  constructor(data: ServerGlobalConfigResult) {
    this.javaExecutable = data['launch_option.java_executable'];
    this.javaOptions = data['launch_option.java_options'];
    this.serverOptions = data['launch_option.server_options'];
    this.maxHeapMemory = data['launch_option.max_heap_memory'];
    this.minHeapMemory = data['launch_option.min_heap_memory'];
    this.enableFreeMemoryCheck = data['launch_option.enable_free_memory_check'];
    this.enableReporterAgent = data['launch_option.enable_reporter_agent'];
    this.shutdownTimeout = data.shutdown_timeout;
  }

  static async get(): Promise<ServerGlobalConfig> {
    const result = await axios.get('/config/server_global');
    return new ServerGlobalConfig(result.data);
  }
}

type ServerGlobalConfigResult = {
  'launch_option.java_executable': string;
  'launch_option.java_options': string;
  'launch_option.server_options': string;
  'launch_option.max_heap_memory': number;
  'launch_option.min_heap_memory': number;
  'launch_option.enable_free_memory_check': boolean;
  'launch_option.enable_reporter_agent': boolean;
  shutdown_timeout: number;
};
