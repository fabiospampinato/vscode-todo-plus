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
      // 按文件路径分组 TODO
      const todosByFile = _.groupBy(commentsTodos, todo => todo.filePath);
      
      for (const [filePath, todos] of Object.entries(todosByFile)) {
        // 检查这个文件是否已经有任何 TODO 存在于 .todo 文件中
        const relativePath = path.relative(workspaceRoot, filePath);
        const fileExists = todoLines.some(line => line.includes(relativePath));
        
        // 如果文件不存在于 .todo 文件中，添加文件路径
        if (!fileExists) {
          updatedLines.push(`\n${relativePath}`);
        }
        
        // 添加该文件的所有 TODO
        for (const todo of todos) {
          // 检查这个具体的 TODO 是否已经存在
          const exists = todoLines.some(line => line.includes(todo.message));
          if (!exists) {
            updatedLines.push(`  ${relativePath} Line ${todo.lineNumber}:`);
            updatedLines.push(`  ☐  ${todo.message}\n`);
            updated = true;
          }
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