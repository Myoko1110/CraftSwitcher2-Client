export interface SystemMemoryInfo {
  totalBytes: number;
  availableBytes: number;
  swapTotalBytes: number;
  swapAvailableBytes: number;
}

export interface SystemCpuInfo {
  usage: number;
  count: number;
}

export interface DiskUsageInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
}

export interface ProcessInfo {
  cpuUsage: number;
  memoryUsedSize: number;
  memoryVirtualUsedSize: number;
}

export interface FileWatchInfo {
  path: string;
  owner: any;
}

export interface JavaExecutableInfo {
  path: string;
  runtimeVersion: string;
  javaHomePath: string | null;
  javaMajorVersion: number;
  specificationVersion: string | null;
  classVersion: string | null;
  vendor: string | null;
  vendorVersion: string | null;
  isJdk: boolean;
}
