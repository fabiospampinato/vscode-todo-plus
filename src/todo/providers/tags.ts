
/* IMPORT */

import * as vscode from 'vscode';
import Document from '../document';
import Consts from '../../consts';

/* TAGS */

const Tags = {

  get ( prefix = '' ) {

    if ( prefix === Consts.symbols.tag ) prefix = '';

    const tags = Consts.tags.names.filter ( tag => !prefix || tag.toLocaleLowerCase ().indexOf ( prefix.toLocaleLowerCase () ) !== -1 );

    return tags.map ( Tags.tag2item );

  },

  tag2item ( tagName: string ) {

    const tag = Document.toTag ( tagName ),
          item = new vscode.CompletionItem ( tag );

    item.insertText = `${tag} `;

    return item;

  }

}

/* EXPORT */

export default Tags;
