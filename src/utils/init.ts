
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import * as Commands from '../commands';
import Views from '../views';

/* INIT */

const Init = {

  commands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, handler );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  language () {

    vscode.languages.setLanguageConfiguration ( Consts.languageId, {
      wordPattern: /(-?\d*\.\d\w*)|([^\-\`\~\!\#\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      indentationRules: {
        increaseIndentPattern: Consts.regexes.project,
        decreaseIndentPattern: Consts.regexes.impossible
      }
    });

  },

  views () {

    Views.forEach ( View => {
      vscode.window.registerTreeDataProvider ( View.id, View );
    });

    vscode.workspace.onDidChangeConfiguration ( () => {
      Views.forEach ( View => View.refresh () );
    });

  }

};

/* EXPORT */

export default Init;
