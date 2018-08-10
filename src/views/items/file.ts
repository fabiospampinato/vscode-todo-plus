
/* IMPORT */

import * as vscode from 'vscode';
import Group from './group';

/* FILE */

class File extends Group {
  contextValue = 'file';
  // iconPath = vscode.ThemeIcon.File; //FIXME: https://github.com/Microsoft/vscode/issues/56106
}

/* EXPORT */

export default File;
