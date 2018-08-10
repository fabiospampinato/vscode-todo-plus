
/* IMPORT */

import * as vscode from 'vscode';
import Config from '../config';
import Utils from '../utils';
import Item from './items/item';
import Group from './items/group';
import Placeholder from './items/placeholder';
import Todo from './items/todo';
import View from './view';

/* FILE */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

class File extends View {

  id = 'todo.views.1file';
  clear = false;
  expanded = false;
  textEditor: vscode.TextDocument;

	getTreeItem ( item: Item ): vscode.TreeItem {

    if ( item.collapsibleState !== vscode.TreeItemCollapsibleState.None ) {
      item.collapsibleState = this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }

		return item;

	}

  async getChildren ( item?: Item ): Promise<Item[]> {

    if ( this.clear ) {

      setTimeout ( this.refresh.bind ( this ), 0 );

      return [];

    }

    if ( !item ) {

      this.textEditor = await this.getFileEditor ();

    }

    if ( !this.textEditor ) return [new Placeholder ( 'No todo file found' )];

    const items = [],
          lineNr = item ? item.obj.line.lineNumber : -1;

    Utils.ast.walkChildren ( this.textEditor, lineNr, obj => {

      obj.filePath = this.textEditor.uri.fsPath;
      obj.lineNr = obj.line.lineNumber;

      let isGroup = false;

      Utils.ast.walkChildren ( this.textEditor, obj.line.lineNumber, () => {
        isGroup = true;
        return false;
      });

      const item = isGroup ? new Group ( obj, obj.line.text ) : new Todo ( obj, obj.line.text );

      items.push ( item );

    });

    if ( !items.length && !item ) return [new Placeholder ( 'The file is empty' )];

    return items;

  }

  async getFileEditor () { //FIXME: There's some code duplication between this and the `open` command

    const config = Config.get (),
          {activeTextEditor} = vscode.window,
          editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath,
          rootPath = Utils.folder.getRootPath ( editorPath );

    if ( !rootPath ) return;

    const projectPath = ( ( await Utils.folder.getWrapperPathOf ( rootPath, editorPath || rootPath, config.file.name ) ) || rootPath ) as string,
          todo = Utils.todo.get ( projectPath );

    if ( !todo ) return;

    return await vscode.workspace.openTextDocument ( todo.path );

  }

  refresh ( clear? ) {

    this.clear = !!clear;

    super.refresh ();

  }

}

/* EXPORT */

export default new File ();
