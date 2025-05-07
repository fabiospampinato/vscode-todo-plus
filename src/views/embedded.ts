/* IMPORT */
// Import required dependencies
import * as _ from 'lodash';  // Import lodash utility library
import * as vscode from 'vscode';  // Import VS Code API
import * as path from 'path';  // Import path handling module
import * as fs from 'fs';  // Import file system module
import Utils from '../utils';  // Import utility class
import File from './items/file';  // Import file item component
import Item from './items/item';  // Import base item component
import Group from './items/group';  // Import group component
import Placeholder from './items/placeholder';  // Import placeholder component
import Todo from './items/todo';  // Import todo item component
import View from './view';  // Import view base class
import { TodoExporter } from '../utils/todoExporter';  // Import todo exporter

/* EMBEDDED */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

/**
 * Embedded class - View for displaying embedded todos
 * Extends the View base class, implements tree structure for todo display
 */
class Embedded extends View {
  private todoExporter: TodoExporter;

  id = 'todo.views.2embedded';  // Unique identifier for the view
  all = true;  // Whether to show all todos
  clear = false;  // Whether to clear the view
  expanded = true;  // Whether to expand all nodes
  filter: string | false = false;  // Filter condition
  filePathRe = /^(?!~).*(?:\\|\/)/;  // Regular expression for file paths

  constructor () {
    super ();
    this.todoExporter = new TodoExporter();

    // Listen for active editor change events
    vscode.window.onDidChangeActiveTextEditor ( ()  => {
      if ( this.all ) return;  // If showing all todos, don't refresh
      this.refresh ();  // Otherwise refresh the view
    });



    // Register command to sync .todo file with code comments
    vscode.commands.registerCommand('todo.syncTodoWithCode', () => {
      this.syncTodoWithCode();
    });
  }

  /**
   * Get tree item
   * @param item Tree item object
   * @returns Processed tree item
   */
  getTreeItem ( item: Item ): vscode.TreeItem {
    // Set tree item expand/collapse state
    if ( item.collapsibleState !== vscode.TreeItemCollapsibleState.None ) {
      item.collapsibleState = this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }
    return item;
  }

  /**
   * Get embedded todos
   * @returns Todo data
   */
  async getEmbedded () {
    await Utils.embedded.initProvider ();  // Initialize provider
    // Get todo data, including grouping and filter conditions
    return await Utils.embedded.provider.get ( undefined, this.config.embedded.view.groupByRoot, this.config.embedded.view.groupByType, this.config.embedded.view.groupByFile, this.filter, !this.all );
  }

  /**
   * Get child items
   * @param item Parent item object
   * @returns Array of child items
   */
  async getChildren ( item?: Item ): Promise<Item[]> {
    // If view needs to be cleared
    if ( this.clear ) {
      setTimeout ( this.refresh.bind ( this ), 0 );
      return [];
    }

    let obj = item ? item.obj : await this.getEmbedded ();

    // Collapse unnecessary groups
    while ( obj && '' in obj ) obj = obj[''];

    // If no data, show placeholder
    if ( _.isEmpty ( obj ) ) return [new Placeholder ( 'No embedded todos found' )];

    // If array, process todo list
    if ( _.isArray ( obj ) ) {
      const todos = obj.map ( obj => {
        return new Todo ( obj, this.config.embedded.view.wholeLine ? obj.line : obj.message || obj.todo, this.config.embedded.view.icons );
      });

      // If configured to sort by label
      if ( this.config.embedded.view.sortBy === 'label' ) {
        todos.sort ( ( a, b ) => {
          return a.label.toString ().localeCompare ( b.label.toString () );
        });
      }

      return todos;
    } 
    
    // If object, process groups
    else if ( _.isObject ( obj ) ) {
      const keys = Object.keys ( obj ).sort ();

      return keys.map ( key => {
        const val = obj[key];

        // If file path, create file item
        if ( this.filePathRe.test ( key ) ) {
          const uri = Utils.view.getURI ( val[0] );
          return new File ( val, uri );
        } 
        // Otherwise create group item
        else {
          return new Group ( val, key, this.config.embedded.view.icons );
        }
      });
    }
  }

  /**
   * Refresh view
   * @param clear Whether to clear the view
   */
  refresh ( clear? ) {
    this.clear = !!clear;
    super.refresh ();
  }

  /**
   * Sync .todo file with code comments
   */
  async syncTodoWithCode() {
    try {
      if (!this.todoExporter) {
        this.todoExporter = new TodoExporter();
      }
      await this.todoExporter.syncTodoWithCode();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to sync todos: ${error.message}`);
    }
  }
}
/* EXPORT */
// Export singleton instance of Embedded class
export default new Embedded ();
