
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import Document from './todo/document';
import ItemFile from './views/items/item';
import ItemTodo from './views/items/todo';
import StatusbarTimer from './statusbars/timer';
import Utils from './utils';
import ViewEmbedded from './views/embedded';
import ViewFiles from './views/files';

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

  const lines = _.uniq ( _.flatten ( textEditor.selections.map ( selection => _.range ( selection.start.line, selection.end.line + 1 ) ) ) ),
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

async function open ( filePath?: string, lineNumber?: number ) {

  filePath = _.isString ( filePath ) ? filePath : undefined;
  lineNumber = _.isNumber ( lineNumber ) ? lineNumber : undefined;

  if ( filePath ) {

    return Utils.file.open ( filePath, true, lineNumber );

  } else {

    const config = Config.get (),
          {activeTextEditor} = vscode.window,
          editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath,
          rootPath = Utils.folder.getRootPath ( editorPath );

    if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to open its todo file' );

    const projectPath = ( ( await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, config.file.name ) ) || rootPath ) as string,
          todo = Utils.todo.get ( projectPath );

    if ( !_.isUndefined ( todo ) ) { // Open

      return Utils.file.open ( todo.path, true, lineNumber );

    } else { // Create

      const defaultPath = path.join ( projectPath, config.file.name );

      await Utils.file.make ( defaultPath, config.file.defaultContent );

      return Utils.file.open ( defaultPath );

    }

  }

}

async function openEmbedded () {

  await Utils.embedded.initProvider ();

  const config = Config.get (),
        todos = await Utils.embedded.provider.get ( undefined, config.embedded.file.groupByRoot, config.embedded.file.groupByType, config.embedded.file.groupByFile ),
        content = Utils.embedded.provider.renderTodos ( todos );

  if ( !content ) return vscode.window.showInformationMessage ( 'No embedded todos found' );

  Utils.editor.open ( content );

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

function toggleTimer () {

  Consts.timer = !Consts.timer;

  StatusbarTimer.updateVisibility ();
  StatusbarTimer.updateTimer ();

  vscode.window.showInformationMessage ( `Timer ${Consts.timer ? 'enabled' : 'disabled'}` );

}

function archive () {

  const textEditor = vscode.window.activeTextEditor,
        doc = new Document ( textEditor );

  if ( !doc.isSupported () ) return;

  Utils.archive.run ( doc );

}

/* VIEW */

function viewOpenFile ( file: ItemFile ) {

  Utils.file.open ( file.resourceUri.fsPath, true, 0 );

}

function viewRevealTodo ( todo: ItemTodo ) {

  if ( todo.obj.todo ) {

    const startIndex = todo.obj.rawLine.indexOf ( todo.obj.todo ),
          endIndex = startIndex + todo.obj.todo.length;

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr, startIndex, endIndex );

  } else {

    Utils.file.open ( todo.obj.filePath, true, todo.obj.lineNr );

  }

}

/* VIEW FILE */

function viewFilesOpen () {
  open ();
}

function viewFilesCollapse () {
  ViewFiles.expanded = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-files-expanded', false );
  ViewFiles.refresh ( true );
}

function viewFilesExpand () {
  ViewFiles.expanded = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-files-expanded', true );
  ViewFiles.refresh ( true );
}

/* VIEW EMBEDDED */

function viewEmbeddedCollapse () {
  ViewEmbedded.expanded = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', false );
  ViewEmbedded.refresh ( true );
}

function viewEmbeddedExpand () {
  ViewEmbedded.expanded = true;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', true );
  ViewEmbedded.refresh ( true );
}

async function viewEmbeddedFilter () {

  const filter = await vscode.window.showInputBox ({ placeHolder: 'Filter string...' });

  if ( !filter || ViewEmbedded.filter === filter ) return;

  ViewEmbedded.filter = filter;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', true );
  ViewEmbedded.refresh ();

}

function viewEmbeddedClearFilter () {
  ViewEmbedded.filter = false;
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', false );
  ViewEmbedded.refresh ();
}

/* EXPORT */

export {open, openEmbedded, toggleBox, toggleDone, toggleCancelled, toggleStart, toggleTimer, archive, viewOpenFile, viewRevealTodo, viewFilesOpen, viewFilesCollapse, viewFilesExpand, viewEmbeddedCollapse, viewEmbeddedExpand, viewEmbeddedFilter, viewEmbeddedClearFilter};
export {toggleBox as editorToggleBox, toggleDone as editorToggleDone, toggleCancelled as editorToggleCancelled, toggleStart as editorToggleStart, archive as editorArchive}
