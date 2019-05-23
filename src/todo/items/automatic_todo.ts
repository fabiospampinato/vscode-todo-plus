
/* IMPORT */

import * as _ from 'lodash';
import * as moment from 'moment';
import * as vscode from 'vscode';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';
import Todo from '../../todo/items/todo';

const AutomaticTodo = {
  textEditor : vscode.window.activeTextEditor,

  boxNextLine () {
    // Forces the new line to be an empty TODO
    const lineNumber = this.textEditor.selection.active.line;
    

    let previousLine = this.textEditor.document.lineAt( lineNumber - 1 ).text;

    // Last line was an todo Line
    if ( previousLine.match( Consts.regexes.todo ) ){
        // only remove the box and the space after // is there a better way to check this without hardcodding the regex?
        let nextText = previousLine;
        //Last line was an empty todo*/
        if( Todo.is( nextText ) &&  /* Todo.isEmpty( nextText ) // later implement this method */ this.isEmpty( nextText ) ){
          // remove the todo from the previous line
          nextText = nextText.replace(/([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/, '')
          const changes =  Utils.editor.edits.makeDiff ( previousLine, nextText, lineNumber - 1 );
          Utils.editor.edits.apply(this.textEditor, changes);
        }
        else{
          //add a todo box to the current new line
          previousLine = '';
          nextText = Consts.symbols.box + ' ';

          //this is just a proof of concept right now it just creates a box on the new line with no indentation
          const changes =  Utils.editor.edits.makeDiff ( previousLine, nextText, lineNumber );
          Utils.editor.edits.apply(this.textEditor, changes);
        }
    }  
  },
  
  // Placeholder for the implementation of this method
  isEmpty(str : String){
    const boxlessLine = str.replace(/([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/, '')
    
    return boxlessLine.match(/^[\s]*$/);
  }
}

/* EXPORT */

export default AutomaticTodo;

