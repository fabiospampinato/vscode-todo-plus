
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';

/* CONFIG */

const Config = {

  get ( extension = 'todo' ) {

    return vscode.workspace.getConfiguration ().get ( extension ) as any;

  },

  getKey ( key: string ) {

    return _.get ( Config.get (), key ) as any;

  },

  check ( config ) { // Check if the configuration is valid

    const checkers = [
      config => _.isString ( _.get ( config, 'file' ) ) && 'Todo+: "todo.file" has been renamed to "todo.file.name"',
      config => _.isString ( _.get ( config, 'defaultContent' ) ) && 'Todo+: "todo.defaultContent" has been renamed to "todo.file.defaultContent"',
      config => _.isArray ( _.get ( config, 'tags.backgroundColors' ) ) && 'Todo+: "todo.tags.backgroundColors" has been renamed to "todo.colors.tags.background"',
      config => _.isArray ( _.get ( config, 'tags.foregroundColors' ) ) && 'Todo+: "todo.tags.foregroundColors" has been renamed to "todo.colors.tags.foreground"'
    ];

    const errors = _.compact ( checkers.map ( checker => checker ( config ) ) );

    if ( !errors.length ) return;

    errors.forEach ( err => vscode.window.showErrorMessage ( err ) );

    throw new Error ( 'Invalid configuration, check the changelog' );

  }

};

/* EXPORT */

export default Config;
