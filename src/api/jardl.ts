import axios from 'axios';

export default class ServerInstaller {
  static async getAvailableTypes(): Promise<string[]> {
    const result = await axios.get('/jardl/types');
    return result.data;
  }

  static async getVersions(
    type: string
  ): Promise<{ version: string; build_count: number | null }[]> {
    const result = await axios.get(`/jardl/${type}/versions`);
    return result.data;
  }

  static async getBuilds(
    type: string,
    version: string
  ): Promise<
    {
      build: string;
      download_url: string;
      java_major_version: number | null;
      updated_datetime: string;
      recommended: false;
      is_required_build: true;
      is_loaded_info: true;
    }[]
  > {
    const result = await axios.get(`/jardl/${type}/version/${version}/builds`);
    return result.data;
  }

  static async getBuild(
    type: string,
    version: string,
    build: string
  ): Promise<{
    build: string;
    download_url: string;
    java_major_version: number | null;
    updated_datetime: string;
    recommended: false;
    is_required_build: true;
    is_loaded_info: true;
  }> {
    const result = await axios.get(`/jardl/${type}/version/${version}/build/${build}`);
    return result.data;
  }
}
