
/* IMPORT */

import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import * as vscode from 'vscode';
import Item from './item';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';

/* TODO */

class Todo extends Item {

  /* HELPERS */

  getStatus () {

    const box = this.isBox (),
          done = !box && this.isDone (),
          cancelled = !box && !done && this.isCancelled (),
          other = !box && !done && !cancelled;

    return { box, done, cancelled, other };

  }

  setToken ( replacement: string, startIndex: number, endIndex: number = startIndex ) {

    const was = this.getStatus ();

    this.text = `${this.text.substring ( 0, startIndex )}${replacement}${this.text.substring ( endIndex )}`;

    const is = this.getStatus ();

    if ( ( ( was.done || was.cancelled ) && is.box ) || ( !was.other && is.other ) ) {

      return this.unfinish ();

    } else if ( ( was.box && !is.box ) || ( was.cancelled && is.done ) || ( was.done && is.cancelled ) || ( was.other && ( is.done || is.cancelled ) ) ) {

      return this.finish ();

    } else {

      return this.makeEdit ();

    }

  }

  makeEdit () {

    if ( this.startLine.text === this.text ) return;

    return Utils.editor.makeReplaceEdit ( this.startLine.lineNumber, this.text, this.startPos.character, this.endPos.character );

  }

  /* TAGS */

  addTag ( tag: string ) {

    this.text = `${_.trimEnd ( this.text )} ${tag}`;

    return this.makeEdit ();

  }

  removeTag ( tagRegex: RegExp ) {

    this.text = _.trimEnd ( this.text.replace ( tagRegex, '' ) );

    return this.makeEdit ();

  }

  replaceTag ( tagRegex: RegExp, tag: string ) {

    this.removeTag ( tagRegex );

    return this.addTag ( tag );

  }

  /* TIMEKEEPING */

  start () {

    const date = moment (),
          format = Config.getKey ( 'timekeeping.started.format' ),
          timestamp = date.format ( format ),
          tag = `@started(${timestamp})`;

    return this.replaceTag ( Consts.regexes.tagStarted, tag );

  }

  unstart () {

    return this.removeTag ( Consts.regexes.tagStarted );

  }

  finish () {

    const started = this.text.match ( Consts.regexes.tagStarted );

    if ( Config.getKey ( 'timekeeping.finished.enabled' ) || started ) {

      this.unfinish ();

      const isPositive = this.isDone ();

      /* FINISH */

      const finishedDate = moment (),
            finishedFormat = Config.getKey ( 'timekeeping.finished.format' ),
            finishedTimestamp = finishedDate.format ( finishedFormat ),
            finishedTag = `@${isPositive ? 'done' : 'cancelled' }(${finishedTimestamp})`;

      this.addTag ( finishedTag );

      /* ELAPSED */

      if ( Config.getKey ( 'timekeeping.elapsed.enabled' ) && started ) {

        const startedTimestamp = _.last ( started ),
              startedFormat = Config.getKey ( 'timekeeping.started.format' ),
              startedDate = moment ( startedTimestamp, startedFormat ),
              diff = moment.preciseDiff ( startedDate, finishedDate ),
              elapsedTag = `@${isPositive ? 'lasted' : 'wasted'}(${diff})`;

        return this.addTag ( elapsedTag );

      }

    }

    return this.makeEdit ();

  }

  unfinish () {

    this.removeTag ( Consts.regexes.tagFinished );

    return this.removeTag ( Consts.regexes.tagElapsed );

  }

  /* TOKENS */

  toggleToken ( token: string, removeToken: string, insertToken?: string, force?: boolean ) {

    const tokenMatch = this.text.match ( new RegExp ( `^[^\\S\\n]*(${_.escapeRegExp ( token )})` ) );

    if ( tokenMatch ) { // Remove

      if ( force === true ) return;

      const endIndex = tokenMatch.index + tokenMatch[0].length,
            startIndex = endIndex - tokenMatch[1].length,
            spaceNr = !removeToken && this.text.length >= startIndex + 1 && this.text[startIndex + 1].match ( /\s/ ) ? 1 : 0;

      return this.setToken ( removeToken, startIndex, endIndex + spaceNr );

    }

    const otherMatch = this.text.match ( Consts.regexes.todoToken );

    if ( otherMatch ) { // Replace

      if ( force === false ) return;

      const endIndex = otherMatch.index + otherMatch[0].length,
            startIndex = endIndex - otherMatch[1].length;

      return this.setToken ( token, startIndex, endIndex );

    }

    if ( insertToken ) { // Insert

      if ( force === false ) return;

      let startIndex = this.text.search ( /\S/ );

      if ( startIndex === -1 ) startIndex = this.text.length;

      return this.setToken ( `${insertToken} `, startIndex );

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

  isCancelled () {

    return Item.is ( this.text, Consts.regexes.todoCancel );

  }

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.todo );

  }

}

/* EXPORT */

export default Todo;
