/* IMPORT */

import * as vscode from "vscode";
import Consts from "../../consts";
import TodoInfoItem from "../items/todo_info";
import Line from "./line";

/* DECORATION TYPES */

const TODO_INFO = vscode.window.createTextEditorDecorationType({
  color: Consts.colors.info,
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  dark: {
    color: Consts.colors.dark.info,
  },
  light: {
    color: Consts.colors.light.info,
  },
});

/* TODO DONE */

class TodoInfo extends Line {
  TYPES = [TODO_INFO];

  getItemRanges(
    todoInfo: TodoInfoItem,
    negRange?: vscode.Range | vscode.Range[]
  ) {
    return [
      this.getRangeDifference(
        todoInfo.text,
        todoInfo.range,
        negRange || [Consts.regexes.tag, Consts.regexes.formattedCode]
      ),
    ];
  }
}

/* EXPORT */

export default TodoInfo;