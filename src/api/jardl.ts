import type { JarDLVersionInfo, JarDLBuildInfoAPIResult } from 'src/models/jardl';

import axios from 'axios';

import { APIError } from 'src/enums/api-error';
import { JarDLBuildInfo } from 'src/models/jardl';

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
      const result = await axios.get<JarDLVersionInfo[]>(`/jardl/${type}/versions`);
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルドの一覧
   */
  static async getBuilds(type: string, version: string): Promise<JarDLBuildInfo[]> {
    try {
      const result = await axios.get<JarDLBuildInfoAPIResult[]>(`/jardl/${type}/version/${version}/builds`);
      return result.data.map((b: JarDLBuildInfoAPIResult) => new JarDLBuildInfo(b));
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
      const result = await axios.get<JarDLBuildInfoAPIResult>(`/jardl/${type}/version/${version}/build/${build}`);
      return new JarDLBuildInfo(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}
