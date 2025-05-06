/* IMPORT */
import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * TodoExporter 类 - 负责处理待办事项的导出功能
 */
export class TodoExporter {
  private filePathRe = /^(?!~).*(?:\\|\/)/;  // 文件路径的正则表达式

  /**
   * 将待办事项导出到 .todo 文件
   * @param embeddedTodos 待导出的待办事项数据
   */
  async exportToTodoFile(embeddedTodos: any) {
    try {
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
        console.log('Processing object:', JSON.stringify(obj, null, 2));
        console.log('Current prefix:', prefix);

        if (_.isArray(obj)) {
          console.log('Processing array with length:', obj.length);
          // 如果是数组，直接处理每个待办事项
          obj.forEach(todo => {
            if (todo.filePath && todo.lineNr) {
              console.log('enter the array of todoarray process');
              // 如果是待办事项，添加文件标题和待办事项内容
              const relativePath = todo.relativePath;
              console.log(`Adding todo for file: ${relativePath}, line: ${todo.lineNr}`);
              content += `${prefix}${relativePath}\n`;
              content += `${prefix}☐ Line ${todo.lineNr}: ${todo.message}\n`;
              if (todo.code) {
                console.log('Adding code snippet:', todo.code);
                // 如果有代码片段，添加代码内容
                content += `${prefix}Code: ${todo.code}\n`;
              }
              content += '\n';
            }
          });
        } else if (_.isObject(obj)) {
          console.log('Processing object with keys:', Object.keys(obj));
          // 如果是对象，递归处理每个键
          Object.keys(obj).forEach(key => {
            console.log(`Processing key: ${key}`);
            if (this.filePathRe.test(key)) {
              // 如果是文件路径，添加文件标题
              console.log(`Adding file path: ${key}`);
              content += `${prefix}${key}\n`;
              console.log('Processing todos array key for file:', key);
              console.log('Todos:', obj[key]);
              // 递归处理文件下的待办事项
              processTodos(obj[key], prefix + '  ');
            } else if (key === '') {
              // 如果是空键，直接处理其值
              processTodos(obj[key], prefix);
            } else {
              // 如果是其他分组，添加分组标题
              console.log(`Adding group: ${key}`);
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