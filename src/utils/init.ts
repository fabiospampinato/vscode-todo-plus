
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import * as Commands from '../commands';

/* INIT */

const Init = {

  commands ( context: vscode.ExtensionContext ) {

    const {commands, keybindings} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      if ( !_.includes ( ['todo.open', 'todo.openEmbedded'], command ) ) return;

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    keybindings.forEach ( ({ command }) => {

      if ( _.includes ( ['todo.open', 'todo.openEmbedded'], command ) ) return;

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerTextEditorCommand ( command, () => handler () );

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

  }

};

/* EXPORT */

export default Init;
