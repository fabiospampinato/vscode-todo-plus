
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';

/* ITEM */

class Item {

  textDocument: vscode.TextDocument;
  startPos: vscode.Position;
  startOffset: number;
  endPos: vscode.Position;
  endOffset: number;
  range: vscode.Range;
  startLine: vscode.TextLine;
  endLine: vscode.TextLine;
  text: string;
  isMultiline: boolean;

  constructor ( textDocument: vscode.TextDocument, startPos: vscode.Position, endPos: vscode.Position, startLine: vscode.TextLine, endLine: vscode.TextLine, text: string ) {

    this.textDocument = textDocument;
    this.startPos = startPos;
    this.startOffset = textDocument.offsetAt ( this.startPos );
    this.endPos = endPos;
    this.endOffset = textDocument.offsetAt ( this.endPos );
    this.range = new vscode.Range ( this.startPos, this.endPos );
    this.startLine = startLine;
    this.endLine = endLine;
    this.text = text;
    this.isMultiline = this.startLine.lineNumber !== this.endLine.lineNumber;

  }

  static is ( str: string, regex: RegExp ) {

    return !!str.match ( regex );

  }

}

/* EXPORT */

export default Item;
