
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
import ViewFiles from './views/files';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  const config = Config.get ();

  Config.check ( config );

  ViewEmbedded.expanded = config.embedded.view.expanded;

  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-expanded', ViewEmbedded.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-embedded-filtered', !!ViewEmbedded.filter );

  ViewFiles.expanded = config.file.view.expanded;

  vscode.commands.executeCommand ( 'setContext', 'todo-files-expanded', ViewFiles.expanded );
  vscode.commands.executeCommand ( 'setContext', 'todo-files-open-button', true );

  Utils.context = context;
  Utils.folder.initRootsRe ();
  Utils.init.language ();
  Utils.init.views ();
  Utils.statistics.tokens.updateDisabledAll ();

  context.subscriptions.push (
    vscode.languages.registerCompletionItemProvider ( Consts.languageId, new CompletionProvider (), ...CompletionProvider.triggerCharacters ),
    vscode.languages.registerDocumentSymbolProvider ( Consts.languageId, new SymbolsProvider () ),
    vscode.window.onDidChangeActiveTextEditor ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeConfiguration ( Consts.update ),
    vscode.workspace.onDidChangeConfiguration ( () => delete Utils.files.filesData && Utils.embedded.provider && delete Utils.embedded.provider.filesData ),
    vscode.workspace.onDidChangeConfiguration ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeConfiguration ( Utils.statistics.tokens.updateDisabledAll ),
    vscode.workspace.onDidChangeTextDocument ( ChangesDecorator.onChanges ),
    vscode.workspace.onDidChangeWorkspaceFolders ( () => Utils.embedded.provider && Utils.embedded.provider.unwatchPaths () ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.files.unwatchPaths ),
    vscode.workspace.onDidChangeWorkspaceFolders ( Utils.folder.initRootsRe )
  );

  DocumentDecorator.update ();

  return Utils.init.commands ( context );

};

/* EXPORT */

export {activate};
