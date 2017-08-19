
/* IMPORT */

import * as vscode from 'vscode';

/* ITEM */

class Item {

  line: vscode.TextLine;
  text: string;

  constructor ( line: vscode.TextLine ) {

    this.line = line;
    this.text = this.line.text.trim ();

  }

  static is ( str: string, regex: RegExp ) {

    return !!str.match ( regex );

  }

}

/* EXPORT */

export default Item;
