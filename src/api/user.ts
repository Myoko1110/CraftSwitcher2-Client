import type { UserResult, UserOperationResult } from 'src/models/user';

import axios from 'axios';

import { APIError } from 'src/abc/api-error';

// ------------------------------------------------------------

export default class User {
  constructor(
    public id: number,
    public name: string,
    public lastLogin: Date | null,
    public lastAddress: string | null,
    public permission: number
  ) {}

  /**
   * セッションの生成と設定
   */
  static async login(username: string, password: string): Promise<boolean> {
    try {
      const result = await axios.post('/login', { username, password });
      return result.status === 200;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * セッションが有効かどうかを返す
   */
  static async isValidSession(): Promise<boolean> {
    try {
      const result = await axios.get('/login');
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 登録されたユーザーの一覧
   */
  static async all(): Promise<User[]> {
    try {
      const result = await axios.get('/users');
      return result.data.map(
        (u: UserResult) =>
          new User(
            u.id,
            u.name,
            u.lastLogin ? new Date(u.lastLogin) : null,
            u.lastAddress,
            u.permission
          )
      );
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ユーザーを作成
   */
  static async add(username: string, password: string): Promise<UserOperationResult> {
    try {
      const result = await axios.post('/user/add', { username, password });
      return result.data as UserOperationResult;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ユーザーを削除
   */
  async remove(): Promise<UserOperationResult> {
    try {
      const result = await axios.delete(`/user/remove?user_id=${this.id}`);
      return result.data as UserOperationResult;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}
