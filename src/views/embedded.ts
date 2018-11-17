
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Utils from '../utils';
import File from './items/file';
import Item from './items/item';
import Group from './items/group';
import Placeholder from './items/placeholder';
import Todo from './items/todo';
import View from './view';

/* EMBEDDED */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

class Embedded extends View {

  id = 'todo.views.2embedded';
  clear = false;
  expanded = true;
  filter: string | false = false;
  filePathRe = /^(?!~).*(?:\\|\/)/;

  getTreeItem ( item: Item ): vscode.TreeItem {

    if ( item.collapsibleState !== vscode.TreeItemCollapsibleState.None ) {
      item.collapsibleState = this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }

    return item;

  }

  async getEmbedded () {

    await Utils.embedded.initProvider ();

    return await Utils.embedded.provider.get ( undefined, this.config.embedded.view.groupByRoot, this.config.embedded.view.groupByType, this.config.embedded.view.groupByFile, this.filter );

  }

  async getChildren ( item?: Item ): Promise<Item[]> {

    if ( this.clear ) {

      setTimeout ( this.refresh.bind ( this ), 0 );

      return [];

    }

    let obj = item ? item.obj : await this.getEmbedded ();

    while ( obj && '' in obj ) obj = obj['']; // Collapsing unnecessary groups

    if ( _.isEmpty ( obj ) ) return [new Placeholder ( 'No embedded todos found' )];

    if ( _.isArray ( obj ) ) {

      return obj.map ( obj => {

        return new Todo ( obj, this.config.embedded.view.wholeLine ? obj.line : obj.message || obj.todo, this.config.embedded.view.icons );

      });

    } else if ( _.isObject ( obj ) ) {

      const keys = Object.keys ( obj ).sort ();

      return keys.map ( key => {

        const val = obj[key];

        if ( this.filePathRe.test ( key ) ) {

          const uri = Utils.view.getURI ( val[0] );

          return new File ( val, uri );

        } else {

          return new Group ( val, key, this.config.embedded.view.icons );

        }

      });

    }

  }

  refresh ( clear? ) {

    this.clear = !!clear;

    super.refresh ();

  }

}

/* EXPORT */

export default new Embedded ();
