
/* IMPORT */

import * as vscode from 'vscode';
import Consts from './consts';
import CompletionProvider from './providers/completion';
import SymbolsProvider from './providers/symbols';
import DocumentDecorator from './todo/decorators/document';
import ChangesDecorator from './todo/decorators/changes';
import Utils from './utils';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  Utils.init.language ();

  context.subscriptions.push (
    vscode.languages.registerCompletionItemProvider ( Consts.languageId, new CompletionProvider (), ...CompletionProvider.triggerCharacters ),
    vscode.languages.registerDocumentSymbolProvider ( Consts.languageId, new SymbolsProvider () ),
    vscode.window.onDidChangeActiveTextEditor ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeConfiguration ( () => DocumentDecorator.update () ),
    vscode.workspace.onDidChangeTextDocument ( ChangesDecorator.onChanges )
  );

  DocumentDecorator.update ();

  return Utils.init.commands ( context );

};

/* EXPORT */

export {activate};
