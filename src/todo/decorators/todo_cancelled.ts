
/* IMPORT */

import * as vscode from 'vscode';
import Consts from '../../consts';
import TodoCancelledItem from '../items/todo_cancelled';
import Line from './line';

/* DECORATION TYPES */

const TODO_CANCELLED = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.cancelled,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
});

/* TODO CANCELLED */

class TodoCancelled extends Line {

  TYPES = [TODO_CANCELLED];

  getItemRanges ( todoCancelled: TodoCancelledItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangeDifference ( todoCancelled.text, todoCancelled.range, negRange || [Consts.regexes.tag, Consts.regexes.formattedCode] )];

  }

}

/* EXPORT */

export default TodoCancelled;
