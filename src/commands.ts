
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

async function callTodosMethod ( options? ) {

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

  todosFiltered.map ( todo => todo[options.method]( ...options.args ) );

  const edits = _.filter ( _.flattenDeep ( todosFiltered.map ( todo => todo['makeEdit']() ) ) );

  if ( !edits.length ) return;

  const textEditor = vscode.window.activeTextEditor;

  const selectionsTagIndexes = textEditor.selections.map ( selection => {
    const line = textEditor.document.lineAt ( selection.start.line );
    return line.text.indexOf ( Consts.symbols.tag );
  });

  await Utils.editor.applyEdits ( options.textEditor, edits );

  textEditor.selections = textEditor.selections.map ( ( selection, index ) => { // Putting the cursors before first new tag
    if ( selectionsTagIndexes[index] >= 0 ) return selection;
    const line = textEditor.document.lineAt ( selection.start.line );
    if ( selection.start.character !== line.text.length ) return selection;
    const tagIndex = line.text.indexOf ( Consts.symbols.tag );
    const position = new vscode.Position ( selection.start.line, tagIndex );
    return new vscode.Selection ( position, position );
  });

  const Statusbar = require ( './statusbar' ).default; // Avoiding a cyclic dependency

  Statusbar.update ();

}

/* COMMANDS */

function archive ( textEditor: vscode.TextEditor ) { //FIXME: Hard to read implementation

  const doc = textEditor.document,
        text = doc.getText (),
        indentation = Config.getKey ( 'indentation' ),
        archiveName = Config.getKey ( 'archive.name' ),
        archiveLabelMatch = _.last ( Utils.getAllMatches ( textEditor.document.getText (), Consts.regexes.archive ) ) as undefined | RegExpMatchArray,
        archiveLabel = archiveLabelMatch ? archiveLabelMatch[0] : `${archiveName}:`,
        archiveStartIndex = archiveLabelMatch ? archiveLabelMatch.index : -1,
        archiveEndIndex = archiveStartIndex === -1 ? -1 : archiveStartIndex + archiveLabel.length,
        archivableText = archiveStartIndex === -1 ? text : text.substr ( 0, archiveStartIndex ),
        archivableRegexes = [Consts.regexes.todoDone, Consts.regexes.todoCancel],
        archivableMatches = _.flatten ( archivableRegexes.map ( re => Utils.getAllMatches ( archivableText, re ) ) );

  if ( !archivableMatches.length ) return;

  const archivablePositions = archivableMatches.map ( match => doc.positionAt ( match.index ) );

  let archivableLines = archivablePositions.map ( pos => doc.lineAt ( pos.line ) );

  archivableLines.forEach ( archivableLine => { // Adding comments
    Utils.ast.walkDown ( doc, archivableLine.lineNumber, false, function ({ startLevel, line, level }) {
      if ( startLevel === level || !line.text.match ( Consts.regexes.comment ) ) return false;
      archivableLines.push ( line );
    });
  });

  archivableLines = _.sortBy ( archivableLines, line => line.lineNumber );

  const archivedLines = archivableLines.map ( line => `${line.text.match ( Consts.regexes.comment ) ? indentation + indentation : indentation}${_.trimStart ( line.text )}` ),
        archivedText =  '\n' + archivedLines.join ( '\n' ),
        insertText = archiveStartIndex === -1 ? `\n\n${archiveLabel}${archivedText}` : archivedText,
        insertPos = archiveEndIndex === -1 ? doc.positionAt ( text.length - 1 ) : doc.positionAt ( archiveEndIndex ),
        editsRemoveLines = archivableLines.map ( ( line, i ) => Utils.editor.makeDeleteLineEdit ( line.lineNumber, line.range.start.character, line.range.end.character ) ),
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
        embedded = await Utils.embedded.get ( rootPaths );

  if ( !embedded ) return vscode.window.showInformationMessage ( 'No embedded todos found' );

  Utils.editor.open ( embedded );

}

/* EXPORT */

export {archive, start, toggleBox, toggleCancel, toggleDone, open, openEmbedded};
