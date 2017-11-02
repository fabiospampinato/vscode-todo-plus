
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
        lines = _.uniq ( options.textEditor.selections.map ( selection => selection.active.line ) ),
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

  const config = await Config.get (),
        {activeTextEditor} = vscode.window,
        editorPath = activeTextEditor && activeTextEditor.document.fileName,
        rootPath = Utils.folder.getRootPath ( editorPath );

  if ( !rootPath ) return vscode.window.showErrorMessage ( 'You have to open a project before being able to open its todo file' );

  const projectPath = ( await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, config.file ) ) || rootPath,
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

/* EXPORT */

export {start, toggleBox, toggleCancel, toggleDone, open};
