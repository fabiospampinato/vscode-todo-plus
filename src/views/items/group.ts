
/* IMPORT */

import * as vscode from 'vscode';
import Item from './item';

/* GROUP */

class Group extends Item {

  contextValue = 'group';

  constructor ( obj, label, icon = false ) {

    super ( obj, label, vscode.TreeItemCollapsibleState.Expanded );

    if ( icon ) {
      this.setTypeIcon ( label );
    }

  }

}

/* EXPORT */

export default Group;
