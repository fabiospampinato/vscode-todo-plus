/* IMPORT */
import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';

/**
 * TodoExporter class - Handles todo export functionality
 */
export class TodoExporter {
  private filePathRe = /^(?!~).*(?:\\|\/)/;  // Regular expression for file paths

  /**
   * Synchronize .todo file with TODO comments in code
   */
  async syncTodoWithCode() {
    try {
      // Get workspace root directory
      const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0] ? 
                           vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      // Get .todo file path
      const todoFilePath = path.join(workspaceRoot, '.todo');
      // Read .todo file content
      const todoContent = fs.readFileSync(todoFilePath, 'utf8');
      const todoLines = todoContent.split('\n');
      // Extract all unchecked todos
      const uncheckedTodos = todoLines
        .map((line, idx) => ({ line, idx }))
        .filter(obj => obj.line.trim().startsWith('☐'))
        .map(obj => ({
          ...obj,
          message: obj.line.replace(/^.*☐\s*/, '').trim()
        }));
      // Scan TODO comments in code
      const commentsTodos = await this.scanCodeTodos(workspaceRoot);
      // Update .todo file
      const updatedLines = [...todoLines];  // Copy original lines
      // Process unchecked todos
      let updated = false;
      for (const todo of uncheckedTodos) {
        // If todo message is not in code comments, mark as completed
        if (!commentsTodos.some(comment => comment.message === todo.message)) {
          const timestamp = moment().format('YY-MM-DD HH:mm');
          const message = todo.line.replace(/^.*☐\s*/, '').trim();
          updatedLines[todo.idx] = `✔ ${message} @done(${timestamp})`;
          // Update line content
          updated = true;
        }
      }

      // If there are new TODOs in code comments, add them to .todo file
      // Group TODOs by file path
      const todosByFile = _.groupBy(commentsTodos, todo => todo.filePath);
      
      for (const [filePath, todos] of Object.entries(todosByFile)) {
        // Check if this file already has any TODOs in .todo file
        const relativePath = path.relative(workspaceRoot, filePath);
        const fileExists = todoLines.some(line => line.includes(relativePath));
        
        // If file doesn't exist in .todo file, add file path
        if (!fileExists) {
          updatedLines.push(`\n${relativePath}`);
        }
        
        // Add all TODOs for this file
        for (const todo of todos) {
          // Check if this specific TODO already exists
          const exists = todoLines.some(line => line.includes(todo.message));
          if (!exists) {
            updatedLines.push(`  ${relativePath} Line ${todo.lineNumber}:`);
            updatedLines.push(`  ☐  ${todo.message}\n`);
            updated = true;
          }
        }
      }

      // If there are updates, save the file
      if (updated) {
        fs.writeFileSync(todoFilePath, updatedLines.join('\n'), 'utf8');
        vscode.window.showInformationMessage('Successfully synced todos with code comments');
        
        // Open updated .todo file
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
   * Scan code for TODO comments
   * @param workspaceRoot Workspace root directory
   * @returns Array of objects containing filePath, lineNumber and message
   */
  private async scanCodeTodos(workspaceRoot: string): Promise<Array<{filePath: string, lineNumber: number, message: string}>> {
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
      // Use VS Code's file search functionality
      for (const pattern of codeFilePatterns) {
        const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
        for (const file of files) {
          try {
            const content = fs.readFileSync(file.fsPath, 'utf8');
            // Use regex to match TODO comments
            const regex = /\/\/\s*TODO:?\s*(.*)/g;
            let match;
            let lineNumber = 1;
            
            // Process file content line by line
            const lines = content.split('\n');
            for (const line of lines) {
              if ((match = regex.exec(line)) !== null) {
                // Add TODO information to array
                todoItems.push({
                  filePath: file.fsPath,
                  lineNumber: lineNumber,
                  message: match[1].trim()
                });
              }
              lineNumber++;
            }
          } catch (error) {
            vscode.window.showErrorMessage(`Error reading file ${file.fsPath}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error scanning code files: ${error.message}`);
    }

    return todoItems;
  }
} 