
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import stringMatches from 'string-matches';
import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Document from './todo/document';
import Utils from './utils';

/* CALL TODOS METHOD */

const callTodosMethodOptions = {
  checkValidity: false,
  filter: _.identity,
  method: undefined,
  args: [],
  errors: {
    invalid: 'Only todos can perform this action',
    filtered: 'This todo cannot perform this action'
  }
};

async function callTodosMethod ( options? ) {

  options = _.isString ( options ) ? { method: options } : options;
  options = _.merge ( {}, callTodosMethodOptions, options );

  const textEditor = vscode.window.activeTextEditor,
        doc = new Document ( textEditor );

  if ( !doc.isSupported () ) return;

  const lines = _.uniq ( textEditor.selections.map ( selection => selection.active.line ) ),
        todos = _.filter ( lines.map ( line => doc.getTodoAt ( line, options.checkValidity ) ) );

  if ( todos.length !== lines.length ) vscode.window.showErrorMessage ( options.errors.invalid );

  if ( !todos.length ) return;

  const todosFiltered = todos.filter ( options.filter );

  if ( todosFiltered.length !== todos.length ) vscode.window.showErrorMessage ( options.errors.filtered );

  if ( !todosFiltered.length ) return;

  todosFiltered.map ( todo => todo[options.method]( ...options.args ) );

  const edits = _.filter ( _.flattenDeep ( todosFiltered.map ( todo => todo['makeEdit']() ) ) );

  if ( !edits.length ) return;

  const selectionsTagIndexes = textEditor.selections.map ( selection => {
    const line = textEditor.document.lineAt ( selection.start.line );
    return line.text.indexOf ( Consts.symbols.tag );
  });

  await Utils.editor.edits.apply ( textEditor, edits );

  textEditor.selections = textEditor.selections.map ( ( selection, index ) => { // Putting the cursors before first new tag
    if ( selectionsTagIndexes[index] >= 0 ) return selection;
    const line = textEditor.document.lineAt ( selection.start.line );
    if ( selection.start.character !== line.text.length ) return selection;
    const tagIndex = line.text.indexOf ( Consts.symbols.tag );
    if ( tagIndex < 0 ) return selection;
    const position = new vscode.Position ( selection.start.line, tagIndex );
    return new vscode.Selection ( position, position );
  });

}

/* COMMANDS */

async function open () {

  const config = Config.get (),
        {activeTextEditor} = vscode.window,
        editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath,
        rootPath = Utils.folder.getRootPath ( editorPath );

  if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to open its todo file' );

  const projectPath = ( ( await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, config.file ) ) || rootPath ) as string,
        todo = Utils.todo.get ( projectPath );

  if ( !_.isUndefined ( todo ) ) { // Open

    return Utils.file.open ( todo.path );

  } else { // Create

    const defaultPath = path.join ( projectPath, config.file );

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

function toggleBox () {

  return callTodosMethod ( 'toggleBox' );

}

function toggleDone () {

  return callTodosMethod ( 'toggleDone' );

}

function toggleCancelled () {

  return callTodosMethod ( 'toggleCancelled' );

}

function toggleStart () {

  return callTodosMethod ({
    checkValidity: true,
    filter: todo => todo.isBox (),
    method: 'toggleStart',
    errors: {
      invalid: 'Only todos can be started',
      filtered: 'Only not done/cancelled todos can be started'
    }
  });

}

function archive () {

  const textEditor = vscode.window.activeTextEditor,
        doc = new Document ( textEditor );

  if ( !doc.isSupported () ) return;

  Utils.archive.run ( doc );

}

/* EXPORT */

export {open, openEmbedded, toggleBox, toggleDone, toggleCancelled, toggleStart, archive};
