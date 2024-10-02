export default class FileType {
  public static readonly DIRECTORY = new FileType('folder', 'フォルダー', []);

  public static readonly ARCHIVE = new FileType('archive', '圧縮フォルダー', [
    '.zip',
    '.rar',
    '.tar',
    '.gz',
    '.bz2',
    '.7z',
    '.lzma',
    '.xz',
  ]);

  public static readonly IMAGE = new FileType('image', '画像ファイル', [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.ico',
    '.svg',
    '.tiff',
    '.tif',
    '.heif',
    '.heic',
  ]);

  public static readonly VIDEO = new FileType('video', '動画ファイル', [
    '.mp4',
    '.webm',
    '.mkv',
    '.flv',
    '.avi',
    '.mov',
    '.wmv',
    '.mpg',
    '.mpeg',
    '.3gp',
    '.3g2',
    '.m4v',
    '.f4v',
    '.ogv',
    '.ogm',
    '.ogx',
    '.ts',
    '.mts',
    '.m2ts',
    '.m2t',
    '.m4s',
    '.m4p',
    '.m4v',
    '.m4a',
    '.m4b',
    '.m4r',
    '.m4p',
    '.m4v',
    '.m4f',
  ]);

  public static readonly TEXT = new FileType('text', 'テキストファイル', [
    '.text',
    '.txt',
    '.ascii',
    '.utf-8',
    '.utf8',
    '.euc',
    '.sjis',
    '.jis',
    '.big5',
  ]);

  public static readonly FILE = new FileType('file', 'ファイル', []);

  public static readonly HTML = new FileType('html', 'HTMLファイル', [
    '.html',
    '.htm',
    '.mhtml',
    '.mht',
    '.shtml',
    '.xhtml',
    '.cshtml',
  ]);

  public static readonly CSS = new FileType('css', 'CSSファイル', ['.css']);

  public static readonly JAVASCRIPT = new FileType('javascript', 'JavaScriptファイル', [
    '.js',
    '.jsx',
  ]);

  public static readonly TYPESCRIPT = new FileType('typescript', 'TypeScriptファイル', [
    '.ts',
    '.tsx',
  ]);

  public static readonly PYTHON = new FileType('python', 'Pythonファイル', ['.py', '.pyc', '.pyd']);

  public static readonly JAVA = new FileType('java', 'Javaファイル', [
    '.java',
    '.jar',
    '.class',
    '.jsp',
  ]);

  public static readonly KOTLIN = new FileType('kotlin', 'Kotlinファイル', ['.kt', '.kts']);

  public static readonly PHP = new FileType('php', 'PHPファイル', ['.php']);

  public static readonly GO = new FileType('go', 'Goファイル', ['.go']);

  public static readonly JSON = new FileType('json', 'JSONファイル', ['.json']);

  public static readonly YAML = new FileType('yaml', 'YAMLファイル', ['.yaml', '.yml']);

  public static readonly MARKDOWN = new FileType('markdown', 'Markdownファイル', [
    '.md',
    '.markdown',
  ]);

  public static readonly SQL = new FileType('sql', 'SQLファイル', [
    '.sqlite3',
    '.sqlite',
    '.sql',
    '.db',
  ]);

  public static readonly UNKNOWN = new FileType('file', '', []);

  private static readonly ALL = [
    FileType.DIRECTORY,
    FileType.ARCHIVE,
    FileType.IMAGE,
    FileType.VIDEO,
    FileType.TEXT,
    FileType.FILE,
    FileType.HTML,
    FileType.CSS,
    FileType.JAVASCRIPT,
    FileType.TYPESCRIPT,
    FileType.PYTHON,
    FileType.JAVA,
    FileType.KOTLIN,
    FileType.PHP,
    FileType.GO,
    FileType.JSON,
    FileType.YAML,
    FileType.MARKDOWN,
    FileType.SQL,
  ];

  static get(ext: string): FileType {
    return FileType.ALL.find((type) => type.ext.includes(ext)) || FileType.UNKNOWN;
  }

  constructor(
    public name: string,
    public displayName: string,
    public ext: string[]
  ) {}
}
