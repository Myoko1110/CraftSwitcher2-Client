import type { JarDLVersionInfoResult, JarDLBuildInfoAPIResult } from 'src/models/jardl';

import axios from 'axios';

import { APIError } from 'src/abc/api-error';
import { JarDLBuildInfoResult } from 'src/models/jardl';

// ------------------------------------------------------------

export default class ServerInstaller {
  /**
   * 利用可能なサーバーのタイプ
   */
  static async getAvailableTypes(): Promise<string[]> {
    try {
      const result = await axios.get('/jardl/types');
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 対応バージョンの一覧
   * @param type
   */
  static async getVersions(type: string): Promise<JarDLVersionInfoResult[]> {
    try {
      const result = await axios.get(`/jardl/${type}/versions`);
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルドの一覧
   */
  static async getBuilds(type: string, version: string): Promise<JarDLBuildInfoResult[]> {
    try {
      const result = await axios.get(`/jardl/${type}/version/${version}/builds`);
      return result.data.map((b: JarDLBuildInfoAPIResult) => new JarDLBuildInfoResult(b));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルドの情報
   *
   * ビルドの追加情報を取得して返します。
   */
  static async getBuild(
    type: string,
    version: string,
    build: string
  ): Promise<JarDLBuildInfoResult> {
    try {
      const result = await axios.get(`/jardl/${type}/version/${version}/build/${build}`);
      return result.data.map((b: JarDLBuildInfoAPIResult) => new JarDLBuildInfoResult(b));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}
