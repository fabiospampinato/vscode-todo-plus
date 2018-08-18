
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from '../config';
import Consts from '../consts';
import Document from '../todo/document';

/* COMPLETION */

class Completion implements vscode.CompletionItemProvider {

  static triggerCharacters = [Consts.symbols.tag];

  provideCompletionItems ( textDocument: vscode.TextDocument, pos: vscode.Position ) {

    const config = Config.get ();

    /* SPECIAL */

    const tagsSpecial = Consts.tags.names.map ( tag => {

      const text = `@${tag}`,
            item = new vscode.CompletionItem ( text );

      item.insertText = `${text} `;

      return item;

    });

    if ( !config.tags.namesInference ) return tagsSpecial;

    /* SMART */

    const doc = new Document ( textDocument  ),
          tags = _.uniq ( doc.getTags ().map ( tag => tag.text ) ),
          tagsFiltered = tags.filter ( tag => Consts.regexes.tagNormal.test ( tag ) );

    const tagsSmart = tagsFiltered.map ( text => {

      const item = new vscode.CompletionItem ( text );

      item.insertText = `${text} `;

      return item;

    });

    /* RETURN */

    return tagsSpecial.concat ( tagsSmart );

  }

}

/* EXPORT */

export default Completion;
