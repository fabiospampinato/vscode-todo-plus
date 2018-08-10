
/* IMPORT */

import * as vscode from 'vscode';
import Item from './item';

/* GROUP */

class Group extends Item {

  contextValue = 'group';

  constructor ( obj, label, icon = false ) {

    super ( obj, label, vscode.TreeItemCollapsibleState.Expanded );

    if ( icon ) {

      const type = label.toUpperCase ();

      this.setTypeIcon ( type );

      if ( this.iconPath ) {

        this.label = type;

      }

    }

  }

}

/* EXPORT */

export default Group;
