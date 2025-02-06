// eslint-disable-next-line max-classes-per-file
export class APIErrorCode {
  // other
  public static readonly OUT_OF_MEMORY = new APIErrorCode(100, 'メモリが不足しています。');

  public static readonly OPERATION_CANCELLED = new APIErrorCode(
    101,
    '操作がキャンセルされました。'
  );

  public static readonly ALREADY_EXISTS_ID = new APIErrorCode(102, 'IDが既に存在します。');

  // server
  public static readonly SERVER_NOT_FOUND = new APIErrorCode(200, 'サーバーが見つかりません。');

  public static readonly SERVER_NOT_LOADED = new APIErrorCode(
    201,
    'サーバーがロードされていません。'
  );

  public static readonly SERVER_NOT_RUNNING = new APIErrorCode(202, 'サーバーが起動していません。');

  public static readonly SERVER_LAUNCH_ERROR = new APIErrorCode(
    203,
    'サーバーの起動に失敗しました。'
  );

  public static readonly SERVER_ALREADY_RUNNING = new APIErrorCode(
    204,
    'サーバーは既に起動しています。'
  );

  public static readonly SERVER_PROCESSING = new APIErrorCode(205, 'サーバーが処理中です。');

  // file
  public static readonly NOT_EXISTS_PATH = new APIErrorCode(300, 'パスが存在しません。');

  public static readonly ALREADY_EXISTS_PATH = new APIErrorCode(301, 'パスが既に存在します。');

  public static readonly NOT_EXISTS_DIRECTORY = new APIErrorCode(
    302,
    'ディレクトリが存在しません。'
  );

  public static readonly NOT_EXISTS_FILE = new APIErrorCode(303, 'ファイルが存在しません。');

  public static readonly NOT_EXISTS_CONFIG_FILE = new APIErrorCode(
    304,
    '設定ファイルが存在しません。'
  );

  public static readonly NOT_ALLOWED_PATH = new APIErrorCode(305, '許可されていないパスです。');

  public static readonly NOT_FILE = new APIErrorCode(306, 'ファイルではありません。');

  public static readonly NO_SUPPORTED_ARCHIVE_FORMAT = new APIErrorCode(
    307,
    'サポートされていないアーカイブ形式です。'
  );

  public static readonly NO_AVAILABLE_DOWNLOAD = new APIErrorCode(
    308,
    'ダウンロードが利用できません。'
  );

  public static readonly EXIST_FILE = new APIErrorCode(309, 'ファイルが既に存在します。');

  public static readonly EXIST_DIRECTORY = new APIErrorCode(310, 'ディレクトリが既に存在します。');

  // authentication
  public static readonly INVALID_AUTHENTICATION_CREDENTIALS = new APIErrorCode(
    400,
    '認証情報が無効です。'
  );

  public static readonly INCORRECT_USERNAME_OR_PASSWORD = new APIErrorCode(
    401,
    'ユーザー名またはパスワードが間違っています。'
  );

  // user
  public static readonly ALREADY_EXISTS_USER_NAME = new APIErrorCode(
    500,
    'ユーザー名が既に存在します。'
  );

  public static readonly NOT_EXISTS_USER = new APIErrorCode(501, 'ユーザーが存在しません。');

  // plugin
  public static readonly PLUGIN_NOT_FOUND = new APIErrorCode(600, 'プラグインが見つかりません。');

  public static readonly NOT_EXISTS_PLUGIN_FILE = new APIErrorCode(
    601,
    'プラグインファイルが存在しません。'
  );

  // jardl
  public static readonly NO_AVAILABLE_SERVER_TYPE = new APIErrorCode(
    700,
    '利用可能なサーバータイプがありません。'
  );

  public static readonly NOT_EXISTS_SERVER_VERSION = new APIErrorCode(
    701,
    'サーバーバージョンが存在しません。'
  );

  public static readonly NOT_EXISTS_SERVER_BUILD = new APIErrorCode(
    702,
    'サーバービルドが存在しません。'
  );

  // backup
  public static readonly BACKUP_ALREADY_RUNNING = new APIErrorCode(
    800,
    'バックアップが既に実行されています。'
  );

  public static readonly BACKUP_NOT_FOUND = new APIErrorCode(801, 'バックアップが見つかりません。');

  public static readonly INVALID_BACKUP = new APIErrorCode(802, '無効なバックアップです');

  public static readonly UNAVAILABLE_SNAPSHOT = new APIErrorCode(
    803,
    'スナップショットが利用できません'
  );

  public static readonly DISABLED_SNAPSHOT = new APIErrorCode(804, 'スナップショットが無効です');

  // java
  public static readonly UNKNOWN_JAVA_PRESET = new APIErrorCode(900, '不明なJavaプリセットです。');

  private static readonly values = [
    APIErrorCode.OUT_OF_MEMORY,
    APIErrorCode.OPERATION_CANCELLED,
    APIErrorCode.ALREADY_EXISTS_ID,
    APIErrorCode.SERVER_NOT_FOUND,
    APIErrorCode.SERVER_NOT_LOADED,
    APIErrorCode.SERVER_NOT_RUNNING,
    APIErrorCode.SERVER_LAUNCH_ERROR,
    APIErrorCode.SERVER_ALREADY_RUNNING,
    APIErrorCode.SERVER_PROCESSING,
    APIErrorCode.NOT_EXISTS_PATH,
    APIErrorCode.ALREADY_EXISTS_PATH,
    APIErrorCode.NOT_EXISTS_DIRECTORY,
    APIErrorCode.NOT_EXISTS_FILE,
    APIErrorCode.NOT_EXISTS_CONFIG_FILE,
    APIErrorCode.NOT_ALLOWED_PATH,
    APIErrorCode.NOT_FILE,
    APIErrorCode.NO_SUPPORTED_ARCHIVE_FORMAT,
    APIErrorCode.NO_AVAILABLE_DOWNLOAD,
    APIErrorCode.EXIST_FILE,
    APIErrorCode.EXIST_DIRECTORY,
    APIErrorCode.INVALID_AUTHENTICATION_CREDENTIALS,
    APIErrorCode.INCORRECT_USERNAME_OR_PASSWORD,
    APIErrorCode.ALREADY_EXISTS_USER_NAME,
    APIErrorCode.NOT_EXISTS_USER,
    APIErrorCode.PLUGIN_NOT_FOUND,
    APIErrorCode.NOT_EXISTS_PLUGIN_FILE,
    APIErrorCode.NO_AVAILABLE_SERVER_TYPE,
    APIErrorCode.NOT_EXISTS_SERVER_VERSION,
    APIErrorCode.NOT_EXISTS_SERVER_BUILD,
    APIErrorCode.BACKUP_ALREADY_RUNNING,
    APIErrorCode.BACKUP_NOT_FOUND,
    APIErrorCode.INVALID_BACKUP,
    APIErrorCode.UNAVAILABLE_SNAPSHOT,
    APIErrorCode.DISABLED_SNAPSHOT,
    APIErrorCode.UNKNOWN_JAVA_PRESET,
  ];

  static valueOf(code: number): APIErrorCode | null {
    return APIErrorCode.values.find((value) => value.code === code) || null;
  }

  constructor(
    public code: number,
    public description: string
  ) {}
}

export class APIError extends Error {
  public code: APIErrorCode;

  constructor(
    code: APIErrorCode | number,
    public detail?: string
  ) {
    let _code: APIErrorCode | number | null = code;
    if (typeof code === 'number') {
      _code = APIErrorCode.valueOf(code);
      if (_code === null) {
        throw new Error('Invalid APIErrorCode');
      }
    }
    if (_code instanceof APIErrorCode) {
      super(_code.description);
    } else {
      throw new Error('Invalid APIErrorCode');
    }

    this.code = _code;
  }

  static fromError(e: any) {
    if (e.response?.data.error_code) {
      return new APIError(e.response.data.error_code);
    }
    return e;
  }

  static createToastMessage(e: any) {
    if (e instanceof APIError) {
      return e.code.description;
    }
    if (e.code === 'ERR_NETWORK') return 'サーバに接続できませんでした';
    return '不明なエラーが発生しました';
  }
}
