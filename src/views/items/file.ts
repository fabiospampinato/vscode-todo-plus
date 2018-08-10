
/* IMPORT */

import * as vscode from 'vscode';
import Group from './group';

/* FILE */

class File extends Group {

  contextValue = 'file';
  iconPath = vscode.ThemeIcon.File;

  constructor ( obj, uri ) {

    super ( obj, uri.label );

    this.resourceUri = uri;

  }

}

/* EXPORT */

export default File;
