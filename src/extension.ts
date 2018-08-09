
/* IMPORT */

import * as vscode from 'vscode';
import Config from './config';
import Consts from './consts';
import CompletionProvider from './providers/completion';
import SymbolsProvider from './providers/symbols';
import DocumentDecorator from './todo/decorators/document';
import ChangesDecorator from './todo/decorators/changes';
import Utils from './utils';
import ViewEmbedded from './views/embedded';
import ViewFile from './views/file';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  const config = Config.get ();

  ViewEmbedded.expanded = config.embedded.view.expanded;

  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', ViewEmbedded.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', !!ViewEmbedded.filter );

  ViewFile.expanded = config.file.view.expanded;

  vscode.commands.executeCommand ( 'setContext', 'todo-file-expanded', ViewFile.expanded );

  Utils.context = context;
  Utils.folder.initRootsRe ();
  Utils.init.language ();
  Utils.init.views ();

  context.subscriptions.push (
    vscode.languages.registerCompletionItemProvider ( Consts.languageId, new CompletionProvider (), ...CompletionProvider.triggerCharacters ),
    vscode.languages.registerDocumentSymbolProvider ( Consts.languageId, new SymbolsProvider () ),
    vscode.window.onDidChangeActiveTextEditor ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeConfiguration ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeTextDocument ( ChangesDecorator.onChanges ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.embedded.unwatchFilePaths ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.folder.initRootsRe )
  );

  DocumentDecorator.update ();

  return Utils.init.commands ( context );

};

/* EXPORT */

export {activate};
