
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import Todo from '../items/todo';
import Consts from '../../consts';

/* DONE */

const TODO = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.done
});

class Done extends Line {

  TYPES = [TODO];

  getItemRanges ( todo: Todo, negRange?: vscode.Range | vscode.Range[] ) {

    if ( !todo.isDone () ) return [];

    return [this.getRangesRegex ( todo.startLine, Consts.regexes.todo, Consts.regexes.tag, negRange )];

  }

}

/* EXPORT */

export default Done;
