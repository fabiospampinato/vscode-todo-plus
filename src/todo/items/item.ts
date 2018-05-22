
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from '../../utils';

/* ITEM */

class Item {

  textEditor: vscode.TextEditor;
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

  constructor ( textEditor: vscode.TextEditor, startPos: vscode.Position, endPos: vscode.Position, startLine: vscode.TextLine, endLine: vscode.TextLine, text: string ) {

    this.textEditor = textEditor;
    this.textDocument = textEditor.document;
    this.startPos = startPos;
    this.startOffset = this.textDocument.offsetAt ( this.startPos );
    this.endPos = endPos;
    this.endOffset = this.textDocument.offsetAt ( this.endPos );
    this.range = new vscode.Range ( this.startPos, this.endPos );
    this.startLine = startLine;
    this.endLine = endLine;
    this.text = text;
    this.isMultiline = this.startLine.lineNumber !== this.endLine.lineNumber;

  }

  static is ( str: string, regex: RegExp ) {

    return Utils.testRe ( regex, str );

  }

}

/* EXPORT */

export default Item;
