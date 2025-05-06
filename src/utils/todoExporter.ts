/* IMPORT */
import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';

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
              content += `${prefix}${relativePath} Line ${todo.lineNr}:\n`;
              content += `${prefix}☐ ${todo.message}\n`;
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

  /**
   * 同步 .todo 文件与代码中的 TODO 注释
   */
  async syncTodoWithCode() {
    try {
      // 获取工作区根目录
      const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0] ? 
                           vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // 获取 .todo 文件路径
      const todoFilePath = path.join(workspaceRoot, '.todo');
      console.log('Todo file path:', todoFilePath);
      // 读取 .todo 文件内容
      const todoContent = fs.readFileSync(todoFilePath, 'utf8');
      const todoLines = todoContent.split('\n');
      console.log('Todo lines:', todoLines);
      // 提取所有未完成的 todo
      const uncheckedTodos = todoLines
        .map((line, idx) => ({ line, idx }))
        .filter(obj => obj.line.trim().startsWith('☐'))
        .map(obj => ({
          ...obj,
          message: obj.line.replace(/^.*☐\s*/, '').trim()
        }));
      console.log('Unchecked todos:', uncheckedTodos);
      // 扫描代码中的 TODO 注释
      const commentsTodos = await this.scanCodeTodos(workspaceRoot);
      console.log('comments todos:', commentsTodos);
      // 更新 .todo 文件
      const updatedLines = [...todoLines];//  // 复制原始行
      // 遍历未完成的 todos，检查是否在代码注释中
      console.log('Updated lines:', updatedLines);
      console.log('Unchecked todos:', uncheckedTodos);
      // 遍历未完成的 todos，检查是否在代码注释中
      let updated = false;
      for (const todo of uncheckedTodos) {
        console.log('Processing todo:', todo);
        console.log('Todo message:', todo.message);
        // 如果 todo message 不在代码注释中，标记为已完成
        if (!commentsTodos.some(comment => comment.message === todo.message)) {
          const timestamp = moment().format('YY-MM-DD HH:mm');
          const message = todo.line.replace(/^.*☐\s*/, '').trim();
          updatedLines[todo.idx] = `✔ ${message} @done(${timestamp})`;
          console.log('Updating line:', updatedLines[todo.idx]);
          // 更新行内容
          updated = true;
        }
      }
      // 如果代码注释中有新的 TODO，添加到 .todo 文件
      for (const commentTodo of commentsTodos) {
        // 检查是否已经存在于 .todo 文件中
        const exists = todoLines.some(line => line.includes(commentTodo.message));
        if (!exists) {
          // 添加新的 TODO，包含文件路径和行号信息
          const relativePath = path.relative(workspaceRoot, commentTodo.filePath);
          updatedLines.push(`${relativePath} Line ${commentTodo.lineNumber}:`);
          updatedLines.push(`☐ ${commentTodo.message}\n`);
          updated = true;
        }
      }
      console.log('Updated lines after processing:', updatedLines);

      // 如果有更新，保存文件
      if (updated) {
        fs.writeFileSync(todoFilePath, updatedLines.join('\n'), 'utf8');
        vscode.window.showInformationMessage('Successfully synced todos with code comments');
        
        // 打开更新后的 .todo 文件
        const doc = await vscode.workspace.openTextDocument(todoFilePath);
        await vscode.window.showTextDocument(doc);
      } else {
        vscode.window.showInformationMessage('No todos need to be updated');
      }

    } catch (error) {
      vscode.window.showErrorMessage(`Failed to sync todos: ${error.message}`);
    }
  }

  /**
   * 扫描代码中的 TODO 注释
   * @param workspaceRoot 工作区根目录
   * @returns 包含文件路径、行号和消息的对象数组
   */
  private async scanCodeTodos(workspaceRoot: string): Promise<Array<{filePath: string, lineNumber: number, message: string}>> {
    console.log('Scanning code for TODO comments...');
    const todoItems: Array<{filePath: string, lineNumber: number, message: string}> = [];
    const codeFilePatterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.py',
      '**/*.java',
      '**/*.c',
      '**/*.cpp',
      '**/*.cs'
    ];
    try {
      // 使用 VS Code 的文件搜索功能
      for (const pattern of codeFilePatterns) {
        console.log(`Searching for files matching pattern: ${pattern}`);
        const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
        console.log(`Found ${files.length} files matching pattern: ${pattern}`);
        for (const file of files) {
          console.log(`Reading file: ${file.fsPath}`);
          try {
            const content = fs.readFileSync(file.fsPath, 'utf8');
            console.log(`File content length: ${content.length}`);
            // 使用正则表达式匹配 TODO 注释
            const regex = /\/\/\s*TODO:?\s*(.*)/g;
            let match;
            let lineNumber = 1;
            
            // 按行处理文件内容
            const lines = content.split('\n');
            for (const line of lines) {
              if ((match = regex.exec(line)) !== null) {
                console.log(`Found TODO in file: ${file.fsPath}, line: ${lineNumber}, message: ${match[1]}`);
                // 将 TODO 注释的信息添加到数组中
                todoItems.push({
                  filePath: file.fsPath,
                  lineNumber: lineNumber,
                  message: match[1].trim()
                });
              }
              lineNumber++;
            }
          } catch (error) {
            console.error(`Error reading file ${file.fsPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error scanning code files:', error);
    }

    return todoItems;
  }
} 