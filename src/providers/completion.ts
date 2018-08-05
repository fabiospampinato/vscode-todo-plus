
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../consts';

/* COMPLETION */

class Completion implements vscode.CompletionItemProvider {

  static triggerCharacters = [Consts.symbols.tag];

  provideCompletionItems ( textDocument: vscode.TextDocument, pos: vscode.Position ) {

    return Consts.tags.names.map ( name => {

      const tag = `@${name}`,
            item = new vscode.CompletionItem ( tag );

      item.insertText = `${tag} `;

      return item;

    });

  }

}

/* EXPORT */

export default Completion;
