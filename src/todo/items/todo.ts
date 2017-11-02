
/* IMPORT */

import * as _ from 'lodash';
import Item from './item';
import Consts from '../../consts';
import Utils from '../../utils';

/* TODO */

class Todo extends Item {

  start () {

    const timestamp = Utils.timestamp.stringify ( new Date () ),
          tag = `@started(${timestamp})`,
          match = this.text.match ( Consts.regexes.tagStarted ),
          newText = match ? this.text.replace ( Consts.regexes.tagStarted, tag ) : `${_.trimEnd ( this.text )} ${tag}`;

    return Utils.editor.makeReplaceEdit ( this.startLine.lineNumber, newText, this.startPos.character, this.endPos.character );

  }

  isBox () {

    return Item.is ( this.text, Consts.regexes.todoBox );

  }

  isDone () {

    return Item.is ( this.text, Consts.regexes.todoDone );

  }

  isCancel () {

    return Item.is ( this.text, Consts.regexes.todoCancel );

  }

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.todo );

  }

}

/* EXPORT */

export default Todo;
