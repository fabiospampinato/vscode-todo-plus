
/* IMPORT */

import * as _ from 'lodash';
import * as moment from 'moment';
import * as vscode from 'vscode';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';
import Item from './item';

/* TODO */

class Todo extends Item {

  /* GETTERS & SETTERS */

  _lineNextText;
  get lineNextText () {
    if ( !_.isUndefined ( this._lineNextText ) ) return this._lineNextText;
    return this._lineNextText = ( this.line ? this.line.text : this.text );
  }

  set lineNextText ( val ) {
    this._lineNextText = val;
  }

  /* EDIT */

  makeEdit () {

    return Utils.editor.edits.makeDiff ( this.line.text, this.lineNextText, this.line.lineNumber );

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

  getTag ( re: RegExp ) {

    const match = this.lineNextText.match ( re );

    return match && match[0];

  }

  addTag ( tag: string ) {

    this.lineNextText = `${_.trimEnd ( this.lineNextText )} ${tag}`;

  }

  removeTag ( tagRegex: RegExp ) {

    if ( !this.hasTag ( tagRegex ) ) return;

    this.lineNextText = _.trimEnd ( this.lineNextText.replace ( tagRegex, '' ) );

  }

  replaceTag ( tagRegex: RegExp, tag: string ) {

    this.removeTag ( tagRegex );
    this.addTag ( tag );

  }

  hasTag ( tagRegex: RegExp ) {

    return Item.is ( this.lineNextText, tagRegex );

  }

  /* TIMEKEEPING */

  create () {

    if ( Config.getKey ( 'timekeeping.created.enabled' ) ) {

      if ( Config.getKey ( 'timekeeping.created.time' ) ) {

        const date = moment (),
              format = Config.getKey ( 'timekeeping.created.format' ),
              time = date.format ( format ),
              tag = `@created(${time})`;

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

  toggleStart () {

    if ( this.hasTag ( Consts.regexes.tagStarted ) ) {

      this.unstart ();

    } else {

      this.start ();

    }

  }

  start () {

    if ( Config.getKey ( 'timekeeping.started.time' ) ) {

      const date = moment (),
            format = Config.getKey ( 'timekeeping.started.format' ),
            time = date.format ( format ),
            tag = `@started(${time})`;

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

    const started = this.getTag ( Consts.regexes.tagStarted );

    if ( started || Config.getKey ( 'timekeeping.finished.enabled' ) || Consts.symbols.box === ( isPositive ? Consts.symbols.done : Consts.symbols.cancelled ) ) {

      this.unfinish ();

      /* FINISH */

      if ( Config.getKey ( 'timekeeping.finished.time' ) ) {

        const finishedDate = moment (),
              finishedFormat = Config.getKey ( 'timekeeping.finished.format' ),
              finishedTime = finishedDate.format ( finishedFormat ),
              finishedTag = `@${isPositive ? 'done' : 'cancelled'}(${finishedTime})`;

        this.addTag ( finishedTag );

      } else {

        const finishedTag = `@${isPositive ? 'done' : 'cancelled'}`;

        this.addTag ( finishedTag );

      }

      /* ELAPSED */

      if ( Config.getKey ( 'timekeeping.elapsed.enabled' ) && started ) {

        const startedFormat = Config.getKey ( 'timekeeping.started.format' ),
              startedMoment = moment ( started, startedFormat ),
              startedDate = new Date ( startedMoment.valueOf () ),
              elapsedFormat = Config.getKey ( 'timekeeping.elapsed.format' ),
              time = Utils.time.diff ( new Date (), startedDate, elapsedFormat ),
              elapsedTag = `@${isPositive ? 'lasted' : 'wasted'}(${time})`;

        this.addTag ( elapsedTag );

      }

    }

  }

  unfinish () {

    this.removeTag ( Consts.regexes.tagFinished );
    this.removeTag ( Consts.regexes.tagElapsed );

  }

  /* SYMBOLS */

  setSymbol ( symbol: string ) {

    const match = this.lineNextText.match ( Consts.regexes.todoSymbol ),
          firstChar = this.lineNextText.match ( /\S/ ),
          startIndex = match ? match[0].indexOf ( match[1] ) : ( firstChar ? firstChar.index : this.lineNextText.length ),
          endIndex = match ? match[0].length : startIndex;

    this.lineNextText = `${this.lineNextText.substring ( 0, startIndex )}${symbol ? `${symbol} ` : ''}${this.lineNextText.substring ( endIndex )}`;

  }

  setSymbolAndState ( symbol: string, state: string ) {

    const prevStatus = this.getStatus ();

    this.setSymbol ( symbol );

    const nextStatus = this.makeStatus ( state );

    this.setStatus ( nextStatus, prevStatus );

  }

  toggleBox ( force: boolean = !this.isBox () ) {

    const symbol = force ? Consts.symbols.box : '',
          state = force ? 'box' : 'other';

    this.setSymbolAndState ( symbol, state );

  }

  box () {

    this.toggleBox ( true );

  }

  unbox () {

    this.toggleBox ( false );

  }

  toggleDone ( force: boolean = !this.isDone () ) {

    const symbol = force ? Consts.symbols.done : Consts.symbols.box,
          state = force ? 'done' : 'box';

    this.setSymbolAndState ( symbol, state );

  }

  done () {

    this.toggleDone ( true );

  }

  undone () {

    this.toggleDone ( false );

  }

  toggleCancelled ( force: boolean = !this.isCancelled () ) {

    const symbol = force ? Consts.symbols.cancelled : Consts.symbols.box,
          state = force ? 'cancelled' : 'box';

    this.setSymbolAndState ( symbol, state );

  }

  cancelled () {

    this.toggleCancelled ( true );

  }

  uncancelled () {

    this.toggleCancelled ( false );

  }

  /* IS */

  isBox () {

    return Item.is ( this.text, Consts.regexes.todoBox );

  }

  isDone () {

    return Item.is ( this.text, Consts.regexes.todoDone );

  }

  isCancelled () {

    return Item.is ( this.text, Consts.regexes.todoCancelled );

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
