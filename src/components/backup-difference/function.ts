import type {DirectoryNode, DirectoryTree} from "./types";
import type {BackupFileDifference} from "../../models/backup";

export function buildDirectoryTree(items: BackupFileDifference[]): DirectoryTree {
  const root: DirectoryTree = [];
  const pathMap: Record<string, DirectoryNode> = {};

  items.forEach(({ path: _path, oldInfo, newInfo, status }) => {
    const parts = _path.split('/');
    let currentPath = '';
    let parent: DirectoryNode[] = root;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!pathMap[currentPath]) {
        const newNode: DirectoryNode = {
          path: currentPath,
          oldInfo: index === parts.length - 1 ? oldInfo : null,
          newInfo: index === parts.length - 1 ? newInfo : null,
          status: index === parts.length - 1 ? status : undefined,
          children: [],
          name: part,
        };
        pathMap[currentPath] = newNode;
        parent.push(newNode);
      }
      parent = pathMap[currentPath].children;
    });
  });

  return root;
}
