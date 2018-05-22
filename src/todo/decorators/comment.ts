
/* IMPORT */

import * as vscode from 'vscode';
import Line from './line';
import CommentItem from '../items/comment';
import Consts from '../../consts';

/* COMMENT */

const COMMENT = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.comment
});

class Comment extends Line {

  TYPES = [COMMENT];

  getItemRanges ( comment: CommentItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangesRegex ( comment.startLine, Consts.regexes.comment, [Consts.regexes.tag, Consts.regexes.code], negRange )];

  }

}

/* EXPORT */

export default Comment;
