
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../consts';
import Document from '../todo/document';

/* COMPLETION */

class Completion implements vscode.CompletionItemProvider {

  static triggerCharacters = [Consts.symbols.tag];

  provideCompletionItems ( textDocument: vscode.TextDocument, pos: vscode.Position ) {

    const character = textDocument.lineAt ( pos.line ).text[pos.character - 1];

    if ( !character || !_.trim ( character ).length || _.includes ( Completion.triggerCharacters, character ) ) {

      /* SPECIAL */

      const tagsSpecial = Consts.tags.names.map ( tag => {

        const text = `@${tag}`,
              item = new vscode.CompletionItem ( text );

        item.insertText = `${text} `;

        return item;

      });

      /* SMART */

      const doc = new Document ( textDocument  ),
            tags = _.uniq ( doc.getTags ().map ( tag => tag.text ) ),
            tagsFiltered = tags.filter ( tag => Consts.regexes.tagNormal.test ( tag ) );

      const tagsSmart = tagsFiltered.map ( text => {

        const item = new vscode.CompletionItem ( text );

        item.insertText = `${text} `;

        return item;

      });

      return tagsSpecial.concat ( tagsSmart );

    }

    return null; // Word-based suggestions

  }

}

/* EXPORT */

export default Completion;
