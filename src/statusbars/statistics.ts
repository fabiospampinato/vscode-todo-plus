
/* IMPORT */

import * as vscode from 'vscode';
import Config from '../config';
import Utils from '../utils';

/* STATISTICS */

class Statistics {

  item; itemProps; config; tokens;

  constructor () {

    this.item = this._initItem ();
    this.itemProps = {};

    this.update ();

  }

  _initItem () {

    const alignment = Config.getKey ( 'statistics.statusbar.alignment' ) === 'right' ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left,
          priority = Config.getKey ( 'statistics.statusbar.priority' );

    return vscode.window.createStatusBarItem ( alignment, priority );

  }

  _setItemProp ( prop, value, _set = true ) {

    if ( this.itemProps[prop] === value ) return false;

    this.itemProps[prop] = value;

    if ( _set ) {

      this.item[prop] = value;

    }

    return true;

  }

  update () {

    this.config = Config.get ();
    this.tokens = Utils.statistics.tokens.global;

    this.updateVisibility ();

    if ( !this.itemProps.visibility ) return;

    this.updateColor ();
    this.updateCommand ();
    this.updateTooltip ();
    this.updateText ();

  }

  updateColor () {

    const {color} = this.config.statistics.statusbar;

    this._setItemProp ( 'color', color );

  }

  updateCommand () {

    const {command} = this.config.statistics.statusbar;

    this._setItemProp ( 'command', command );

  }

  updateTooltip () {

    let template = this.config.statistics.statusbar.tooltip,
        tooltip = Utils.statistics.template.render ( template, this.tokens );

    if ( !tooltip ) return;

    this._setItemProp ( 'tooltip', tooltip );

  }

  updateText () {

    let template = this.config.statistics.statusbar.text,
        text = Utils.statistics.template.render ( template, this.tokens );

    if ( !text ) return;

    this._setItemProp ( 'text', text );

  }

  updateVisibility () {

    const condition = this.config.statistics.statusbar.enabled,
          visibility = Utils.editor.isSupported ( vscode.window.activeTextEditor ) && Utils.statistics.condition.is ( condition, this.tokens, undefined );

    if ( this._setItemProp ( 'visibility', visibility ) ) {

      this.item[visibility ? 'show' : 'hide']();

    }

  }

}

/* EXPORT */

export default new Statistics ();
