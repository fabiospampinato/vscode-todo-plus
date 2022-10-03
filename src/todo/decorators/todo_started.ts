/* IMPORT */

import * as vscode from "vscode";
import Consts from "../../consts";
import TodoStartedItem from "../items/todo_started";
import Line from "./line";

/* DECORATION TYPES */

const TODO_STARTED = vscode.window.createTextEditorDecorationType({
  color: Consts.colors.started,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  dark: {
    color: Consts.colors.dark.started,
  },
  light: {
    color: Consts.colors.light.started,
  },
});

/* TODO DONE */

class TodoStarted extends Line {
  TYPES = [TODO_STARTED];

  getItemRanges(
    todoStarted: TodoStartedItem,
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