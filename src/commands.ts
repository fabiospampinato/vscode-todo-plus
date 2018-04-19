
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Document from './todo/document';
import Utils from './utils';

/* CALL TODOS METHOD */

const callTodosMethodOptions = {
  textEditor: undefined,
  checkValidity: true,
  filterer: undefined,
  method: undefined,
  args: [],
  errors: {
    invalid: 'Only todos can perform this action',
    filtered: 'This todo cannot perform this action'
  }
};

function callTodosMethod ( options? ) {

  options = _.merge ( {}, callTodosMethodOptions, options );

  if ( !Utils.editor.isSupported ( options.textEditor ) ) return;

  const doc = new Document ( options.textEditor.document ),
        lines = _.uniq ( options.textEditor.selections.map ( selection => selection.active.line ) ) as number[],
        todos = _.filter ( lines.map ( line => doc.getTodoAt ( line, options.checkValidity ) ) );

  if ( todos.length !== lines.length ) vscode.window.showErrorMessage ( options.errors.invalid );

  if ( !todos.length ) return;

  const todosFiltered = options.filterer ? todos.filter ( options.filterer ) : todos;

  if ( todosFiltered.length !== todos.length ) vscode.window.showErrorMessage ( options.errors.filtered );

  if ( !todosFiltered.length ) return;

  const edits = _.filter ( todosFiltered.map ( todo => todo[options.method]( ...options.args ) ) );

  if ( !edits.length ) return;

  return Utils.editor.applyEdits ( options.textEditor, edits );

}

/* COMMANDS */

function archive ( textEditor: vscode.TextEditor ) { //FIXME: Hard to read implementation

  const doc = textEditor.document,
        text = doc.getText (),
        indentation = Config.getKey ( 'indentation' ),
        archiveName = Config.getKey ( 'archive.name' ),
        archiveLabelMatch = _.last ( Utils.getAllMatches ( textEditor.document.getText (), Consts.regexes.archive ) ),
        archiveLabel = archiveLabelMatch ? archiveLabelMatch[0] : `${archiveName}:`,
        archiveStartIndex = archiveLabelMatch ? archiveLabelMatch.index : -1,
        archiveEndIndex = archiveStartIndex === -1 ? -1 : archiveStartIndex + archiveLabel.length,
        archivableText = archiveStartIndex === -1 ? text : text.substr ( 0, archiveStartIndex ),
        archivableRegexes = [Consts.regexes.todoDone, Consts.regexes.todoCancel],
        archivableMatches = _.flatten ( archivableRegexes.map ( re => Utils.getAllMatches ( archivableText, re ) ) );

  if ( !archivableMatches.length ) return;

  const archivablePositions = archivableMatches.map ( match => doc.positionAt ( match.index ) ),
        archivableLines = archivablePositions.map ( pos => doc.lineAt ( pos.line ) ),
        archivablePostPositions = archivableMatches.map ( ( match, i ) => doc.positionAt ( Math.min ( text.length - 1, match.index + archivableLines[i].text.length + 1 ) ) ), // In order to completely remove the line, including the new line
        archivedLines = archivableLines.map ( line => `${indentation}${_.trimStart ( line.text )}` ),
        archivedText =  '\n' + archivedLines.join ( '\n' ),
        insertText = archiveStartIndex === -1 ? `\n\n${archiveLabel}${archivedText}` : archivedText,
        insertPos = archiveEndIndex === -1 ? doc.positionAt ( text.length - 1 ) : doc.positionAt ( archiveEndIndex ),
        editsRemoveLines = archivableLines.map ( ( line, i ) => vscode.TextEdit.delete ( new vscode.Range ( line.range.start, archivablePostPositions[i] ) ) ),
        editsInsertArchived = vscode.TextEdit.insert ( insertPos, insertText ),
        edits = editsRemoveLines.concat ( editsInsertArchived );

  return Utils.editor.applyEdits ( textEditor, edits );

}

function start ( textEditor: vscode.TextEditor ) {

  return callTodosMethod ({
    textEditor,
    filterer: todo => todo.isBox (),
    method: 'start',
    errors: {
      invalid: 'Only todos can be started',
      filtered: 'Only not already cancelled/done todos can be started'
    }
  });

}

function toggleBox ( textEditor: vscode.TextEditor ) {

  return callTodosMethod ({
    textEditor,
    checkValidity: false,
    method: 'toggleBox'
  });

}

function toggleCancel ( textEditor: vscode.TextEditor ) {

  return callTodosMethod ({
    textEditor,
    checkValidity: false,
    method: 'toggleCancel'
  });

}

function toggleDone ( textEditor: vscode.TextEditor ) {

  return callTodosMethod ({
    textEditor,
    checkValidity: false,
    method: 'toggleDone'
  });

}

async function open () {

  const config = Config.get (),
        {activeTextEditor} = vscode.window,
        editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath,
        rootPath = Utils.folder.getRootPath ( editorPath );

  if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to open its todo file' );

  const projectPath = ( ( await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, config.file ) ) || rootPath ) as string,
        todo = Utils.todo.get ( projectPath );

  if ( !_.isUndefined ( todo ) ) {

    return Utils.file.open ( todo.path );

  } else {

    const config = Config.get (),
          defaultPath = path.join ( projectPath, config.file );

    await Utils.file.make ( defaultPath, config.defaultContent );

    return Utils.file.open ( defaultPath );

  }

}

async function openEmbedded () {

  const rootPaths = Utils.folder.getAllRootPaths (),
        filePaths = await Utils.embedded.getFilePaths ( rootPaths );

  if ( !filePaths.length ) return vscode.window.showErrorMessage ( 'No text files found' );

  const regex = Utils.embedded.getRegex (),
        todos = await Utils.embedded.getFilesTodos ( filePaths, regex ),
        content = await Utils.embedded.renderTodos ( todos );

  if ( !content ) return vscode.window.showInformationMessage ( 'No embedded todos found' );

  Utils.editor.open ( content );

}

/* EXPORT */

export {archive, start, toggleBox, toggleCancel, toggleDone, open, openEmbedded};
