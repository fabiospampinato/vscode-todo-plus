
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

    return [this.getRangesRegex ( todo.startLine, Consts.regexes.todoDone, [Consts.regexes.tag, Consts.regexes.code], negRange )];

  }

}

/* EXPORT */

export default Done;
