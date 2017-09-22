
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

  }

};

/* EXPORT */

export default Config;
