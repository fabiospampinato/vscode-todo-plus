
/* IMPORT */

import * as vscode from 'vscode';
import Consts from './consts';
import CompletionProvider from './todo/providers/completion';
import SymbolsProvider from './todo/providers/symbols';
import DocumentDecorator from './todo/decorators/document';
import Utils from './utils';
import './statusbar';

/* ACTIVATE */

const activate = function ( context: vscode.ExtensionContext ) {

  Utils.initLanguage ();

  context.subscriptions.push ( vscode.languages.registerCompletionItemProvider ( Consts.languageId, new CompletionProvider (), Consts.symbols.tag ) );
  context.subscriptions.push ( vscode.languages.registerDocumentSymbolProvider ( Consts.languageId, new SymbolsProvider () ) );
  context.subscriptions.push ( vscode.workspace.onDidChangeTextDocument ( () => DocumentDecorator.decorate () ) );
  context.subscriptions.push ( vscode.window.onDidChangeActiveTextEditor ( () => DocumentDecorator.decorate () ) );

  DocumentDecorator.decorate ();

  return Utils.initCommands ( context );

};

/* EXPORT */

export {activate};
