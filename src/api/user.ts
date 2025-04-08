import type { Dayjs } from 'dayjs';

import { z } from "zod";
import axios from 'axios';
import dayjs from 'dayjs';

import { APIError } from 'src/enums/api-error';

import { resultSchema } from "./index";

// ------------------------------------------------------------

export default class User {
  constructor(
    public id: number,
    public name: string,
    public lastLogin: Dayjs | null,
    public lastAddress: string | null,
    public permission: number
  ) {}

  /**
   * セッションの生成と設定
   */
  static async login(username: string, password: string): Promise<z.infer<typeof resultSchema>> {
    try {
      const result = await axios.post('/login', { username, password });
      return resultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * セッションが有効かどうかを返す
   */
  static async isValidSession(): Promise<z.infer<typeof resultSchema>> {
    try {
      const result = await axios.get('/login');
      return resultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 登録されたユーザーの一覧
   */
  static async all(): Promise<z.infer<typeof userSchema>[]> {
    try {
      const result = await axios.get('/users');
      return z.array(userSchema).parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ユーザーを作成
   */
  static async add(
    username: string,
    password: string
  ): Promise<z.infer<typeof userOperationResultSchema>> {
    try {
      const result = await axios.post('/user/add', { username, password });
      return userOperationResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ユーザーを削除
   */
  async remove(): Promise<z.infer<typeof userOperationResultSchema>> {
    try {
      const result = await axios.delete(`/user/remove?user_id=${this.id}`);
      return userOperationResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

// --------------------------------------------------------------

const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  lastLogin: z.string().nullable(),
  lastAddress: z.string().nullable(),
  permission: z.number().int(),
}).transform((u) =>
  new User(
    u.id,
    u.name,
    u.lastLogin ? dayjs.utc(u.lastLogin) : null,
    u.lastAddress,
    u.permission
  )
);

const userOperationResultSchema = z.object({
  result: z.boolean(),
  userId: z.number().int(),
}).transform((u) => ({
  result: u.result,
  userId: u.userId,
}));
