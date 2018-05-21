
/* IMPORT */

import * as _ from 'lodash';
import * as diff from 'diff';
import * as moment from 'moment';
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

    if ( was.other && !is.other ) {

      this.create ();

    }

    if ( !was.other && is.other ) {

      this.unfinish ();
      this.unstart ();
      this.uncreate ();

    }

    if ( ( was.done || was.cancelled ) && is.box ) {

      this.unfinish ();

    }

    if ( ( ( was.box || was.other ) && ( is.done || is.cancelled ) ) || ( was.cancelled && is.done ) || ( was.done && is.cancelled ) ) {

      this.finish ();

    }

  }

  makeEdit () {

    if ( this.startLine.text === this.text ) return;

    const changes = diff.diffWordsWithSpace ( this.startLine.text, this.text );

    let index = 0;

    return _.filter ( changes.map ( change => {
      if ( change.added ) {
        return Utils.editor.makeInsertEdit ( change.value, this.startLine.lineNumber, index );
      } else if ( change.removed ) {
        const edit = Utils.editor.makeDeleteEdit ( this.startLine.lineNumber, index, index + change.value.length );
        index += change.value.length;
        return edit;
      } else {
        index += change.value.length;
      }
    }));

  }

  /* TAGS */

  addTag ( tag: string ) {

    this.text = `${_.trimEnd ( this.text )} ${tag}`;

  }

  removeTag ( tagRegex: RegExp ) {

    if ( this.hasTag ( tagRegex ) ) {

      const re = new RegExp ( tagRegex.source + '\\s?' );

      this.text = _.trimEnd ( this.text.replace ( re, '' ) );

    }

  }

  replaceTag ( tagRegex: RegExp, tag: string ) {

    this.removeTag ( tagRegex );
    this.addTag ( tag );

  }

  hasTag ( tagRegex: RegExp ) {

    return Item.is ( this.text, tagRegex );

  }

  /* TIMEKEEPING */

  create () {

    if ( Config.getKey ( 'timekeeping.created.enabled' ) ) {

      if ( Config.getKey ( 'timekeeping.created.time' ) ) {

        const date = moment (),
              format = Config.getKey ( 'timekeeping.created.format' ),
              timestamp = date.format ( format ),
              tag = `@created(${timestamp})`;

        this.addTag ( tag );

      } else {

        const tag = '@created';

        this.addTag ( tag );

      }

    }

  }

  uncreate () {

    this.removeTag ( Consts.regexes.tagCreated );

  }

  start () {

    if ( Config.getKey ( 'timekeeping.started.time' ) ) {

      const date = moment (),
            format = Config.getKey ( 'timekeeping.started.format' ),
            timestamp = date.format ( format ),
            tag = `@started(${timestamp})`;

      this.replaceTag ( Consts.regexes.tagStarted, tag );

    } else {

      const tag = '@started';

      this.replaceTag ( Consts.regexes.tagStarted, tag );

    }

  }

  unstart () {

    this.removeTag ( Consts.regexes.tagStarted );

  }

  finish () {

    const started = this.text.match ( Consts.regexes.tagStarted );

    if ( Config.getKey ( 'timekeeping.finished.enabled' ) || started ) {

      this.unfinish ();

      const isPositive = this.isDone ();

      /* FINISH */

      if ( Config.getKey ( 'timekeeping.finished.time' ) ) {

        const finishedDate = moment (),
              finishedFormat = Config.getKey ( 'timekeeping.finished.format' ),
              finishedTimestamp = finishedDate.format ( finishedFormat ),
              finishedTag = `@${isPositive ? 'done' : 'cancelled'}(${finishedTimestamp})`;

        this.addTag ( finishedTag );

      } else {

        const finishedTag = `@${isPositive ? 'done' : 'cancelled'}`;

        this.addTag ( finishedTag );

      }

      /* ELAPSED */

      if ( Config.getKey ( 'timekeeping.elapsed.enabled' ) && started && started[1] ) {

        const startedTimestamp = _.last ( started ),
              startedFormat = Config.getKey ( 'timekeeping.started.format' ),
              startedMoment = moment ( startedTimestamp, startedFormat ),
              startedDate = new Date ( startedMoment.valueOf () ),
              elapsedFormat = Config.getKey ( 'timekeeping.elapsed.format' ),
              timestamp = Utils.date.diff ( new Date (), startedDate, elapsedFormat ),
              elapsedTag = `@${isPositive ? 'lasted' : 'wasted'}(${timestamp})`;

        this.addTag ( elapsedTag );

      }

    }

  }

  unfinish () {

    this.removeTag ( Consts.regexes.tagFinished );
    this.removeTag ( Consts.regexes.tagElapsed );

  }

  /* TOKENS */

  toggleToken ( token: string, removeToken: string, insertToken?: string, force?: boolean ) {

    const tokenMatch = this.text.match ( new RegExp ( `^[^\\S\\n]*(${_.escapeRegExp ( token )})` ) );

    if ( tokenMatch ) { // Remove

      if ( force === true ) return;

      const endIndex = tokenMatch.index + _.trimEnd ( tokenMatch[0] ).length,
            startIndex = endIndex - tokenMatch[1].length,
            spaceNr = !removeToken && this.text.length >= ( endIndex + 1 ) && Consts.regexes.empty.test ( this.text[endIndex] ) ? 1 : 0;

      return this.setToken ( removeToken, startIndex, endIndex + spaceNr );

    }

    const otherMatch = this.text.match ( Consts.regexes.todoToken );

    if ( otherMatch ) { // Replace

      if ( force === false ) return;

      const endIndex = otherMatch.index + _.trimEnd ( otherMatch[0] ).length,
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

    this.toggleToken ( Consts.symbols.box, '', Consts.symbols.box, force );

  }

  box () {

    this.toggleBox ( true );

  }

  unbox () {

    this.toggleBox ( false );

  }

  toggleCancel ( force?: boolean ) {

    this.toggleToken ( Consts.symbols.cancel, Consts.symbols.box, Consts.symbols.cancel, force );

  }

  cancel () {

    this.toggleCancel ( true );

  }

  uncancel () {

    this.toggleCancel ( false );

  }

  toggleDone ( force?: boolean ) {

    this.toggleToken ( Consts.symbols.done, Consts.symbols.box, Consts.symbols.done, force );

  }

  done () {

    this.toggleDone ( true );

  }

  undone () {

    this.toggleDone ( false );

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
