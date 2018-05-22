
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

  /* EDIT */

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

  /* STATUS */

  makeStatus ( state: string ) {

    const status = {
      box: false,
      done: false,
      cancelled: false,
      other: false
    };

    status[state] = true;

    return status;

  }

  getStatus () {

    const box = this.isBox (),
          done = !box && this.isDone (),
          cancelled = !box && !done && this.isCancelled (),
          other = !box && !done && !cancelled;

    return { box, done, cancelled, other };

  }

  setStatus ( is, was = this.getStatus () ) {

    if ( _.isEqual ( is, was ) ) return;

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

      this.finish ( is.done );

    }

  }

  /* TAGS */

  addTag ( tag: string ) {

    this.text = `${_.trimEnd ( this.text )} ${tag}`;

  }

  removeTag ( tagRegex: RegExp ) {

    if ( this.hasTag ( tagRegex ) ) {

      const re = new RegExp ( tagRegex.source );

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

  finish ( isPositive?: boolean ) {

    isPositive = _.isBoolean ( isPositive ) ? isPositive : this.isDone ();

    const started = this.text.match ( Consts.regexes.tagStarted );

    if ( Config.getKey ( 'timekeeping.finished.enabled' ) || started || ( ( isPositive && Consts.symbols.box === Consts.symbols.done ) || ( !isPositive && Consts.symbols.box === Consts.symbols.cancel ) ) ) {

      this.unfinish ();

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

  setToken ( token: string ) {

    const match = this.text.match ( Consts.regexes.todoToken ),
          firstChar = this.text.match ( /\S/ ),
          startIndex = match ? match[0].indexOf ( match[1] ) : ( firstChar ? firstChar.index : this.text.length ),
          endIndex = match ? match[0].length : startIndex;

    this.text = `${this.text.substring ( 0, startIndex )}${token ? `${token} ` : ''}${this.text.substring ( endIndex )}`;

  }

  toggleBox ( force?: boolean ) {

    force = _.isBoolean ( force ) ? force : !this.isBox ();

    const prevStatus = this.getStatus ();

    this.setToken ( force ? Consts.symbols.box : false );

    const status = this.makeStatus ( force ? 'box' : 'other' );

    this.setStatus ( status, prevStatus );

  }

  box () {

    this.toggleBox ( true );

  }

  unbox () {

    this.toggleBox ( false );

  }

  toggleCancel ( force?: boolean ) {

    force = _.isBoolean ( force ) ? force : !this.isCancelled ();

    const prevStatus = this.getStatus ();

    this.setToken ( force ? Consts.symbols.cancel : Consts.symbols.box );

    const status = this.makeStatus ( force ? 'cancelled' : 'box' );

    this.setStatus ( status, prevStatus );

  }

  cancel () {

    this.toggleCancel ( true );

  }

  uncancel () {

    this.toggleCancel ( false );

  }

  toggleDone ( force?: boolean ) {

    force = _.isBoolean ( force ) ? force : !this.isDone ();

    const prevStatus = this.getStatus ();

    this.setToken ( force ? Consts.symbols.done : Consts.symbols.box );

    const status = this.makeStatus ( force ? 'done' : 'box' );

    this.setStatus ( status, prevStatus );

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

  isFinished () {

    return this.isDone () || this.isCancelled ();

  }

  static is ( str: string ) {

    return super.is ( str, Consts.regexes.todo );

  }

}

/* EXPORT */

export default Todo;
