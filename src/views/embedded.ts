/* IMPORT */
// 导入所需的依赖包
import * as _ from 'lodash';  // 导入 lodash 工具库
import * as vscode from 'vscode';  // 导入 VS Code API
import * as path from 'path';  // 导入路径处理模块
import * as fs from 'fs';  // 导入文件系统模块
import Utils from '../utils';  // 导入工具类
import File from './items/file';  // 导入文件项组件
import Item from './items/item';  // 导入基础项组件
import Group from './items/group';  // 导入分组组件
import Placeholder from './items/placeholder';  // 导入占位符组件
import Todo from './items/todo';  // 导入待办事项组件
import View from './view';  // 导入视图基类

/* EMBEDDED */

//TODO: Collapse/Expand without rebuilding the tree https://github.com/Microsoft/vscode/issues/54192

/**
 * Embedded 类 - 用于显示嵌入式待办事项的视图
 * 继承自 View 基类，实现了树形结构的待办事项显示
 */
class Embedded extends View {

  id = 'todo.views.2embedded';  // 视图的唯一标识符
  all = true;  // 是否显示所有待办事项
  clear = false;  // 是否清除视图
  expanded = true;  // 是否展开所有节点
  filter: string | false = false;  // 过滤条件
  filePathRe = /^(?!~).*(?:\\|\/)/;  // 文件路径的正则表达式

  constructor () {
    super ();

    // 监听活动编辑器变化事件
    vscode.window.onDidChangeActiveTextEditor ( ()  => {
      if ( this.all ) return;  // 如果显示所有待办事项，则不刷新
      this.refresh ();  // 否则刷新视图
    });

    // 注册导出到 .todo 文件的命令
    vscode.commands.registerCommand('todo.exportEmbeddedToTodo', () => {
      this.exportToTodoFile();
    });
  }

  /**
   * 获取树形项
   * @param item 树形项对象
   * @returns 处理后的树形项
   */
  getTreeItem ( item: Item ): vscode.TreeItem {
    // 设置树形项的展开/折叠状态
    if ( item.collapsibleState !== vscode.TreeItemCollapsibleState.None ) {
      item.collapsibleState = this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
    }
    return item;
  }

  /**
   * 获取嵌入式待办事项
   * @returns 待办事项数据
   */
  async getEmbedded () {
    await Utils.embedded.initProvider ();  // 初始化提供者
    // 获取待办事项数据，包含分组和过滤条件
    return await Utils.embedded.provider.get ( undefined, this.config.embedded.view.groupByRoot, this.config.embedded.view.groupByType, this.config.embedded.view.groupByFile, this.filter, !this.all );
  }

  /**
   * 获取子项
   * @param item 父项对象
   * @returns 子项数组
   */
  async getChildren ( item?: Item ): Promise<Item[]> {
    // 如果需要清除视图
    if ( this.clear ) {
      setTimeout ( this.refresh.bind ( this ), 0 );
      return [];
    }

    let obj = item ? item.obj : await this.getEmbedded ();

    // 折叠不必要的分组
    while ( obj && '' in obj ) obj = obj[''];

    // 如果没有数据，显示占位符
    if ( _.isEmpty ( obj ) ) return [new Placeholder ( 'No embedded todos found' )];

    // 如果是数组，处理待办事项列表
    if ( _.isArray ( obj ) ) {
      const todos = obj.map ( obj => {
        return new Todo ( obj, this.config.embedded.view.wholeLine ? obj.line : obj.message || obj.todo, this.config.embedded.view.icons );
      });

      // 如果配置了按标签排序
      if ( this.config.embedded.view.sortBy === 'label' ) {
        todos.sort ( ( a, b ) => {
          return a.label.toString ().localeCompare ( b.label.toString () );
        });
      }

      return todos;
    } 
    // 如果是对象，处理分组
    else if ( _.isObject ( obj ) ) {
      const keys = Object.keys ( obj ).sort ();

      return keys.map ( key => {
        const val = obj[key];

        // 如果是文件路径，创建文件项
        if ( this.filePathRe.test ( key ) ) {
          const uri = Utils.view.getURI ( val[0] );
          return new File ( val, uri );
        } 
        // 否则创建分组项
        else {
          return new Group ( val, key, this.config.embedded.view.icons );
        }
      });
    }
  }

  /**
   * 刷新视图
   * @param clear 是否清除视图
   */
  refresh ( clear? ) {
    this.clear = !!clear;
    super.refresh ();
  }

  /**
   * 将嵌入式待办事项导出到 .todo 文件
   */
  async exportToTodoFile() {
    try {
      // 获取所有嵌入式待办事项
      const embeddedTodos = await this.getEmbedded();
      
      // 获取工作区根目录
      const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0] ? 
                           vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // 创建 .todo 文件路径
      const todoFilePath = path.join(workspaceRoot, '.todo');
      
      // 准备要写入的内容
      let content = '';
      
      // 处理嵌入式待办事项
      const processTodos = (obj: any, prefix: string = '') => {
        if (_.isArray(obj)) {
          // 如果是数组，直接处理每个待办事项
          obj.forEach(todo => {
            if (todo.file && todo.line) {
              const relativePath = path.relative(workspaceRoot, todo.file);
              content += `${prefix}${relativePath}\n`;
              content += `${prefix}Line ${todo.line}: ${todo.message || todo.todo}\n\n`;
            }
          });
        } else if (_.isObject(obj)) {
          // 如果是对象，递归处理每个键
          Object.keys(obj).forEach(key => {
            if (this.filePathRe.test(key)) {
              // 如果是文件路径，添加文件标题
              content += `${prefix}${key}\n`;
              processTodos(obj[key], prefix + '  ');
            } else {
              // 如果是其他分组，添加分组标题
              content += `${prefix}${key}\n`;
              processTodos(obj[key], prefix + '  ');
            }
          });
        }
      };

      processTodos(embeddedTodos);

      // 写入文件
      fs.writeFileSync(todoFilePath, content, 'utf8');
      
      vscode.window.showInformationMessage('Successfully exported embedded todos to .todo file');
      
      // 打开 .todo 文件
      const doc = await vscode.workspace.openTextDocument(todoFilePath);
      await vscode.window.showTextDocument(doc);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to export embedded todos: ${error.message}`);
    }
  }
}

/* EXPORT */
// 导出 Embedded 类的单例实例
export default new Embedded ();
