
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

  getItemRanges ( todo: Todo ) {

    if ( !todo.isDone () ) return [];

    return [this.getRangesRegex ( todo.line, Consts.regexes.todo, Consts.regexes.tag )];

  }

}

/* EXPORT */

export default Done;
