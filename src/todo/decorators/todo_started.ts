/* IMPORT */

import * as vscode from "vscode";
import Consts from "../../consts";
import TodoBox from "../items/todo_box";
import Line from "./line";

/* DECORATION TYPES */

const TODO_STARTED = vscode.window.createTextEditorDecorationType({
  color: Consts.colors.started,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  dark: {
    color: Consts.colors.dark.done,
  },
  light: {
    color: Consts.colors.light.done,
  },
});

/* TODO DONE */

class TodoStarted extends Line {
  TYPES = [TODO_STARTED];

  getItemRanges(
    todoStarted: TodoBox,
    negRange?: vscode.Range | vscode.Range[]
  ) {
    return [
      this.getRangeDifference(
        todoStarted.text,
        todoStarted.range,
        negRange || [Consts.regexes.tag, Consts.regexes.formattedCode]
      ),
    ];
  }
}

/* EXPORT */

export default TodoStarted;
