
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Document from './todo/document';
import Utils from './utils';

/* COMMANDS */

function toggleToken ( textEditor: vscode.TextEditor, token: string, removeToken: string, insertToken?: string ) {

  if ( !Utils.editor.isSupported ( textEditor ) ) return;

  textEditor.selections.forEach ( selection => {

    const pos = selection.active,
          line = textEditor.document.lineAt ( pos.line ),
          text = line.text;

    const tokenMatch = text.match ( new RegExp ( `^[^\S\n]*(${_.escapeRegExp ( token )})` ) ),
          otherMatch = text.match ( Consts.regexes.todoToken );

    if ( tokenMatch ) {

      const endIndex = tokenMatch.index + tokenMatch[0].length,
            startIndex = endIndex - tokenMatch[1].length,
            space = !removeToken && text.length >= startIndex + 1 && text[startIndex + 1].match ( /\s/ ) ? 1 : 0;

      Utils.editor.replaceRange ( textEditor, pos.line, removeToken, startIndex, endIndex + space );

    } else if ( otherMatch ) {

      const endIndex = otherMatch.index + otherMatch[0].length,
            startIndex = endIndex - otherMatch[1].length;

      Utils.editor.replaceRange ( textEditor, pos.line, token, startIndex, endIndex );

    } else if ( insertToken ) {

      let spaceIndex = text.search ( /\S/ );

      if ( spaceIndex === -1 ) spaceIndex = text.length;

      Utils.editor.replaceRange ( textEditor, pos.line, `${insertToken} `, spaceIndex );

    }

  });

}

function toggleBox ( textEditor: vscode.TextEditor ) {

  toggleToken ( textEditor, Consts.symbols.box, '', Consts.symbols.box );

}

function toggleCancel ( textEditor: vscode.TextEditor ) {

  toggleToken ( textEditor, Consts.symbols.cancel, Consts.symbols.box, Consts.symbols.cancel );

}

function toggleDone ( textEditor: vscode.TextEditor ) {

  toggleToken ( textEditor, Consts.symbols.done, Consts.symbols.box, Consts.symbols.done );

}

async function open () {

  const {rootPath} = vscode.workspace;

  if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to open its todo file' );

  const config = Config.get (),
        {extensions} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes.languages[0],
        files = _.uniq ([ config.file, ...extensions ]);

  for ( let file of files ) {

    const filepath = path.join ( rootPath, file ),
          hasFile = !_.isUndefined ( await Utils.file.read ( filepath ) );

    if ( hasFile ) return Utils.file.open ( filepath );

  }

  const defaultPath = path.join ( rootPath, config.file );

  await Utils.file.make ( defaultPath, config.defaultContent );

  return Utils.file.open ( defaultPath );

}

/* EXPORT */

export {toggleBox, toggleCancel, toggleDone, open};
