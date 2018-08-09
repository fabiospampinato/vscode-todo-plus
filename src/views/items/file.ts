
/* IMPORT */

import * as vscode from 'vscode';
import Group from './group';

/* FILE */

class File extends Group {
  contextValue = 'file';
  iconPath = vscode.ThemeIcon.File;
}

/* EXPORT */

export default File;
