
import { z } from "zod";
import axios from 'axios';
import dayjs from "dayjs";

import { APIError } from 'src/enums/api-error';

// ------------------------------------------------------------

export default class ServerInstaller {
  /**
   * 利用可能なサーバーのタイプ
   */
  static async getAvailableTypes(): Promise<string[]> {
    try {
      const result = await axios.get<string[]>('/jardl/types');
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 対応バージョンの一覧
   * @param type
   */
  static async getVersions(type: string): Promise<JarDLVersionInfo[]> {
    try {
      const result = await axios.get(`/jardl/${type}/versions`);
      return z.array(jarDLVersionInfoSchema).parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルドの一覧
   */
  static async getBuilds(type: string, version: string): Promise<JarDLBuildInfo[]> {
    try {
      const result = await axios.get(`/jardl/${type}/version/${version}/builds`);
      return z.array(JarDLBuildInfoSchema).parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルドの情報
   *
   * ビルドの追加情報を取得して返します。
   */
  static async getBuild(type: string, version: string, build: string): Promise<JarDLBuildInfo> {
    try {
      const result = await axios.get(`/jardl/${type}/version/${version}/build/${build}`);
      return JarDLBuildInfoSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

// --------------------------------------------------------------

const jarDLVersionInfoSchema = z.object({
  version: z.string(),
  buildCount: z.number().int().nullable(),
});
export type JarDLVersionInfo = z.infer<typeof jarDLVersionInfoSchema>;


const JarDLBuildInfoSchema = z.object({
  build: z.string(),
  downloadUrl: z.string().nullable(),
  javaMajorVersion: z.number().int().nullable(),
  requireJdk: z.boolean().nullable(),
  updatedDatetime: z.string().nullable(),
  recommended: z.boolean(),
  isRequireBuild: z.boolean(),
  isLoadedInfo: z.boolean(),
}).transform((data) => ({
  build: data.build,
  downloadUrl: data.downloadUrl,
  javaMajorVersion: data.javaMajorVersion,
  requireJdk: data.requireJdk,
  updatedAt: data.updatedDatetime ? dayjs.utc(data.updatedDatetime) : null,
  recommended: data.recommended,
  isRequireBuild: data.isRequireBuild,
  isLoadedInfo: data.isLoadedInfo,
}));
export type JarDLBuildInfo = z.infer<typeof JarDLBuildInfoSchema>;
