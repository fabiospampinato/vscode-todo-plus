
/* IMPORT */

import * as _ from 'lodash';
import Item from './item';
import Consts from '../../consts';
import Utils from '../../utils';

/* TODO */

class Todo extends Item {

  /* HELPERS */

  setText ( newText: string ) { //TODO: Update lines/ranges as well

    this.text = newText;

    return Utils.editor.makeReplaceEdit ( this.startLine.lineNumber, newText, this.startPos.character, this.endPos.character );

  }

  /* TIMEKEEPING */

  start () {

    const timestamp = Utils.timestamp.stringify ( new Date () ),
          tag = `@started(${timestamp})`,
          match = this.text.match ( Consts.regexes.tagStarted ),
          newText = match ? this.text.replace ( Consts.regexes.tagStarted, tag ) : `${_.trimEnd ( this.text )} ${tag}`;

    return this.setText ( newText );

  }

  /* TOKENS */

  toggleToken ( token: string, removeToken: string, insertToken?: string, force?: boolean ) {

    const set = ( replacement, startIndex, endIndex = startIndex ) => {
      const newText = `${this.text.substring ( 0, startIndex )}${replacement}${this.text.substring ( endIndex )}`;
      return this.setText ( newText );
    };

    const tokenMatch = this.text.match ( new RegExp ( `^[^\\S\\n]*(${_.escapeRegExp ( token )})` ) );

    if ( tokenMatch ) { // Remove

      if ( force === true ) return;

      const endIndex = tokenMatch.index + tokenMatch[0].length,
            startIndex = endIndex - tokenMatch[1].length,
            spaceNr = !removeToken && this.text.length >= startIndex + 1 && this.text[startIndex + 1].match ( /\s/ ) ? 1 : 0;

      return set ( removeToken, startIndex, endIndex + spaceNr );

    }

    const otherMatch = this.text.match ( Consts.regexes.todoToken );

    if ( otherMatch ) { // Replace

      if ( force === false ) return;

      const endIndex = otherMatch.index + otherMatch[0].length,
            startIndex = endIndex - otherMatch[1].length;

      return set ( token, startIndex, endIndex );

    }

    if ( insertToken ) { // Insert

      if ( force === false ) return;

      let startIndex = this.text.search ( /\S/ );

      if ( startIndex === -1 ) startIndex = this.text.length;

      return set ( `${insertToken} `, startIndex );

    }

  }

  toggleBox ( force?: boolean ) {

    return this.toggleToken ( Consts.symbols.box, '', Consts.symbols.box, force );

  }

  box () {

    return this.toggleBox ( true );

  }

  unbox () {

    return this.toggleBox ( false );

  }

  toggleCancel ( force?: boolean ) {

    return this.toggleToken ( Consts.symbols.cancel, Consts.symbols.box, Consts.symbols.cancel, force );

  }

  cancel () {

    return this.toggleCancel ( true );

  }

  uncancel () {

    return this.toggleCancel ( false );

  }

  toggleDone ( force?: boolean ) {

    return this.toggleToken ( Consts.symbols.done, Consts.symbols.box, Consts.symbols.done, force );

  }

  done () {

    return this.toggleDone ( true );

  }

  undone () {

    return this.toggleDone ( false );

  }

  /* IS */

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
