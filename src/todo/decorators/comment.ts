
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import CommentItem from '../items/comment';
import Consts from '../../consts';

/* DECORATION TYPES */

const COMMENT = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.comment,
  rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
  dark: {
    color: Consts.colors.dark.comment
  },
  light: {
    color: Consts.colors.light.comment
  }
});

/* COMMENT */

class Comment extends Line {

  TYPES = [COMMENT];

  getItemRanges ( comment: CommentItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangeDifference ( comment.text, comment.range, negRange || [Consts.regexes.tag, Consts.regexes.formattedCode] )];

  }

}

/* EXPORT */

export default Comment;
