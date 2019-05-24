
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
    
    const lineNumber = this.textEditor.selection.active.line;
    
    // get the value and cursor position of the current line
    let previousLine = this.textEditor.document.lineAt( lineNumber ).text,
        cursorPossition = this.textEditor.selection.active.character;              


    // Last line was an todo Line
    if ( previousLine.match( Consts.regexes.todo ) ){
        
        let nextText = previousLine;
        // Last line was an empty todo
        if( Todo.is( nextText ) &&  /* Todo.isEmpty( nextText ) // later implement this method */ this.isEmpty( nextText ) ){
          // remove the todo from the previous line
          nextText = nextText.replace(/([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/, '')
          // this part to make changes is used multiple times so maybe it should be a function
          const changes =  Utils.editor.edits.makeDiff ( previousLine, nextText, lineNumber);
          Utils.editor.edits.apply(this.textEditor, changes);
        }
        else{
          //add a todo box to the current new line
          const indentation = previousLine.match(/^\s*/)[ 0 ]; // get the current indentation
          const previousLine1 = previousLine.substr( 0, cursorPossition ), // split the line on two on the cursor
                previousLine2 = previousLine.substr( cursorPossition );
          nextText = `${previousLine1}\n${indentation}${Consts.symbols.box} ${previousLine2}`; // add a newline character, the indentation and the todoIcon between the two parts of the line

          const changes =  Utils.editor.edits.makeDiff ( previousLine, nextText, lineNumber );
          Utils.editor.edits.apply(this.textEditor, changes);

          // this was for moving the cursor to the new line but it does not work
          /*
          const position = this.textEditor.selection.active;
          var newPosition = position.with(position.line, indentation.length + Consts.symbols.box.length + 1);
          var newSelection = new vscode.Selection(newPosition, newPosition);
          this.textEditor.selection = newSelection;
          */
        }
    }else{
      //last line was a normal line
      //this is pretty similar to add todo box to current line, so maybe it can be on a function
      const indentation = previousLine.match(/^\s*/)[0];
      const previousLine1 = previousLine.substr( 0, cursorPossition ),
            previousLine2 = previousLine.substr( cursorPossition );
      let nextText = `${previousLine1}\n${indentation}${previousLine2}`;

      let changes =  Utils.editor.edits.makeDiff ( previousLine, nextText, lineNumber );
      Utils.editor.edits.apply(this.textEditor, changes);
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

