
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import Todo from '../items/todo';
import Consts from '../../consts';

/* CANCEL */

const TODO = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.cancel
});

class Cancel extends Line {

  TYPES = [TODO];

  getItemRanges ( todo: Todo ) {

    if ( !todo.isCancel () ) return [];

    return [this.getRangesRegex ( todo.line, Consts.regexes.todo, Consts.regexes.tag )];

  }

}

/* EXPORT */

export default Cancel;
