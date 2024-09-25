import axios from 'axios';

// ------------------------------------------------------------

export default class User {
  constructor(
    public id: number,
    public name: string,
    public lastLogin: Date | null,
    public lastAddress: string | null,
    public permission: number
  ) {}

  static async login(username: string, password: string): Promise<boolean> {
    let result;

    try {
      result = await axios.post('/login', { username, password });
      return result.status === 200;
    } catch (e) {
      if (e.code === 'ERR_BAD_REQUEST') {
        return false;
      }
      throw e;
    }
  }

  static async all(): Promise<User[]> {
    const result = await axios.get('/users');
    return result.data.map(
      (c: {
        id: number;
        name: string;
        last_login: Date | null;
        last_address: string | null;
        permission: number;
      }) => new User(c.id, c.name, c.last_login, c.last_address, c.permission)
    );
  }

  static async add(username: string, password: string): Promise<boolean> {
    const result = await axios.post('/user/add', { username, password });
    return result.data.result;
  }

  static async remove(userId: number): Promise<boolean> {
    const result = await axios.post('/user/remove', { userId });
    return result.data.result;
  }
}
