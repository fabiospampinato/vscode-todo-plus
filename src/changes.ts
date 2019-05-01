
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Consts from './consts';
import { toggleBox, boxNextLine } from './commands'
import Document from './todo/document'
import Utils from './utils';


const Editor = {

  textEditor: vscode.window.activeTextEditor

}

/* CHANGES */

const Changes = {

  textEditor: vscode.window.activeTextEditor,

  doc: new Document ( Editor.textEditor ),

  changes: [],
  
  lastNumberOfChanges: 0,

  onChanges ({ document, contentChanges }) {

    if ( document.languageId !== Consts.languageId ) return;

    if ( !contentChanges.length ) return; //URL: https://github.com/Microsoft/vscode/issues/50344

    Changes.changes.push ( ...contentChanges );

    Changes.symbolInsertion ();

  },

  symbolInsertion () {
    //Get the text of the last change
    const changesLength = this.changes.length;
    let lastChange = this.changes[ String( changesLength - 1 ) ],
        currentLine = lastChange.range._end.line,
        lastChangeText = lastChange.text;
    
    /*
      Sometimes when you press an enter it makes 2 changes at the same time:
        one is a '\n' to make a new line
        the other one is a '' 
      The order of these can change and if the last change becomes '' the
      enter press is going to pass unnoticed.
      So if 2 changes at the same time happen, and the last change is '',
      then take the before last value as last.
    */
    if( changesLength - this.lastNumberOfChanges == 2 ){
      
      if ( lastChangeText.match( /^[ ]*$/ ) ){

        lastChange = this.changes[ String( changesLength - 2 ) ];
        currentLine = lastChange.range._end.line;
        lastChangeText = lastChange.text;

      }
    }

    this.lastNumberOfChanges = changesLength;

    if( Utils.isShiftEnter( 'get' ) ){
      //Do nothing
      Utils.isShiftEnter( 'set' );

    }
    else{
      //An enter is inputed
      if ( lastChangeText.match( /[\s]*\n[\s]*/ ) ) {

        const todo = Changes.doc.getTodoAt(currentLine),
              todoText = todo.text.replace(Consts.regexes.todoSymbol,'');

        //Last line was an empty todo line
        if (todoText.match( /^[\s]*$/ )){
          //Remove the empty todo
          toggleBox();

        }
        //Last line was a filled todo line
        else if( todoText ){
          //Add an empty todo
          boxNextLine();

        }
      }
    }    
  }

};

/* EXPORT */

export default Changes;
