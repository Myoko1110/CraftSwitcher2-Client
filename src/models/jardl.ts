import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

export type JarDLVersionInfo = {
  version: string;
  buildCount: number | null;
};

export class JarDLBuildInfo {
  build: string;

  downloadUrl: string | null;

  javaMajorVersion: number | null;

  requireJdk: boolean | null;

  updatedAt: Dayjs | null;

  recommended: false;

  isRequiredBuild: true;

  isLoadedInfo: true;

  constructor(data: JarDLBuildInfoAPIResult) {
    this.build = data.build;
    this.downloadUrl = data.downloadUrl;
    this.javaMajorVersion = data.javaMajorVersion;
    this.requireJdk = data.requireJdk;
    this.updatedAt = data.updatedDatetime ? dayjs.utc(data.updatedDatetime) : null;
    this.recommended = data.recommended;
    this.isRequiredBuild = data.isRequiredBuild;
    this.isLoadedInfo = data.isLoadedInfo;
  }
}

export type JarDLBuildInfoAPIResult = {
  build: string;
  downloadUrl: string | null;
  javaMajorVersion: number | null;
  requireJdk: boolean | null;
  updatedDatetime: string | null;
  recommended: false;
  isRequiredBuild: true;
  isLoadedInfo: true;
};
