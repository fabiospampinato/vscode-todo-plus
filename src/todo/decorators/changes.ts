
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from '../../consts';
import Document from './document';

/* CHANGES */

const Changes = {

  changes: [],

  onChanges ({ document, contentChanges }) {

    if ( document.languageId !== Consts.languageId ) return;

    if ( !contentChanges.length ) return; //URL: https://github.com/Microsoft/vscode/issues/50344

    Changes.changes.push ( ...contentChanges );

    Changes.decorate ( document );

  },

  decorate ( document: vscode.TextDocument ) {

    const areSingleLines = Changes.changes.every ( ({ range }) => range.isSingleLine );

    if ( areSingleLines ) {

      const lineNrs = Changes.changes.map ( ({ range }) => range.start.line );

      Document.updateLines ( document, lineNrs );

    } else {

      Document.update ( document );

    }

    Changes.changes = [];

  }

};

/* EXPORT */

export default Changes;
