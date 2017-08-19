
/* IMPORT */

import * as vscode from 'vscode';
import Tags from './tags'

/* COMPLETION */

class Completion implements vscode.CompletionItemProvider {

  provideCompletionItems ( textDocument: vscode.TextDocument, pos: vscode.Position ) {

    const range = textDocument.getWordRangeAtPosition ( pos ),
          prefix = range ? textDocument.getText ( range ) : '';

    return Tags.get ( prefix );

  }

}

/* EXPORT */

export default Completion;
