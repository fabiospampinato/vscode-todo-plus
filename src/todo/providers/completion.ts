
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../../consts';
import Document from '../document';

/* COMPLETION */

class Completion implements vscode.CompletionItemProvider {

  provideCompletionItems ( textDocument: vscode.TextDocument, pos: vscode.Position ) {

    return Consts.tags.names.map ( name => {

      const tag = Document.toTag ( name ),
            item = new vscode.CompletionItem ( tag );

      item.insertText = `${tag} `;

      return item;

    });

  }

}

/* EXPORT */

export default Completion;
