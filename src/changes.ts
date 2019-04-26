
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from './consts';
import { toggleBox } from './commands'
import Document from './todo/document'


const Editor = {

  textEditor: vscode.window.activeTextEditor

}

/* CHANGES */

const Changes = {

  textEditor: vscode.window.activeTextEditor,

  doc: new Document ( Editor.textEditor ),

  changes: [],

  onChanges ({ document, contentChanges }) {

    if ( document.languageId !== Consts.languageId ) return;

    if ( !contentChanges.length ) return; //URL: https://github.com/Microsoft/vscode/issues/50344

    Changes.changes.push ( ...contentChanges );

    Changes.symbolInsertion ( document );

  },

  symbolInsertion ( document: vscode.TextDocument ) {
    //get the text of the last change
    const lastChange = Changes.changes[ String( Changes.changes.length - 1 ) ],
          currentLine = lastChange.range._end.line,
          lastChangeText = lastChange.text;

    //an enter is inputed
    if ( lastChangeText.match(/[\s]*\n[\s]*/) ) {

        //still working on this
        const todo = Changes.doc.getTodoAt(currentLine),
              todoText = todo.text.replace(Consts.regexes.todoSymbol,'');

        //last line was an empty todo line
        if (todoText.match(/^[\s]*$/)){
          //remove the empty todo
          toggleBox();

        }
        //last line was a filled todo line
        else if(todoText && !todoText.match(/^[\s]*$/)){
          //here we add the toggleBox but in the next line

        }
    }
    
  }

};

/* EXPORT */

export default Changes;
