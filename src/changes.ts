
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from './consts';
import { toggleBox, toggleBoxChain } from './commands'
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

    Changes.symbolInsertion ();

  },

  symbolInsertion () {
    //Get the text of the last change
    const lastChange = Changes.changes[ String( Changes.changes.length - 1 ) ],
          currentLine = lastChange.range._end.line,
          lastChangeText = lastChange.text;

    //An enter is inputed
    if ( lastChangeText.match(/[\s]*\n[\s]*/) ) {

        const todo = Changes.doc.getTodoAt(currentLine),
              todoText = todo.text.replace(Consts.regexes.todoSymbol,'');

        //Last line was an empty todo line
        if (todoText.match(/^[\s]*$/)){
          //Remove the empty todo
          toggleBox();

        }
        //Last line was a filled todo line
        else if(todoText && !todoText.match(/^[\s]*$/)){
          //Add an empty todo
          toggleBoxChain();

        }
    }
    
  }

};

/* EXPORT */

export default Changes;
