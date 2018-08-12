
/* IMPORT */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as pify from 'pify';
import * as vscode from 'vscode';

/* FILE */

const File = {

  open ( filepath, isTextDocument = true, lineNumber?: number, startIndex: number = 0, endIndex: number = startIndex ) {

    filepath = path.normalize ( filepath );

    const fileuri = vscode.Uri.file ( filepath );

    if ( isTextDocument ) {

      return vscode.workspace.openTextDocument ( fileuri )
                   .then ( doc => vscode.window.showTextDocument ( doc, { preview: false } ) )
                   .then ( () => {
                     if ( _.isUndefined ( lineNumber ) ) return;
                     const textEditor = vscode.window.activeTextEditor;
                     if ( !textEditor ) return;
                     const startPos = new vscode.Position ( lineNumber, startIndex );
                     const endPos = new vscode.Position ( lineNumber, endIndex );
                     const selection = new vscode.Selection ( startPos, endPos );
                     textEditor.selection = selection;
                     textEditor.revealRange ( selection, vscode.TextEditorRevealType.Default );
                   });

    } else {

      return vscode.commands.executeCommand ( 'vscode.open', fileuri );

    }

  },

  async read ( filepath ) {

    try {
      return ( await pify ( fs.readFile )( filepath, { encoding: 'utf8' } ) ).toString ();
    } catch ( e ) {
      return;
    }

  },

  readSync ( filepath ) {

    try {
      return ( fs.readFileSync ( filepath, { encoding: 'utf8' } ) ).toString ();
    } catch ( e ) {
      return;
    }

  },

  async make ( filepath, content ) {

    await pify ( mkdirp )( path.dirname ( filepath ) );

    return File.write ( filepath, content );

  },

  async write ( filepath, content ) {

    return pify ( fs.writeFile )( filepath, content, {} );

  }

};

/* EXPORT */

export default File;
