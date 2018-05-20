
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as globby from 'globby';
import * as isBinaryPath from 'is-binary-path';
import * as mkdirp from 'mkdirp';
import * as moment from 'moment';
import * as path from 'path';
import * as pify from 'pify';
import stringMatches from 'string-matches';
import * as vscode from 'vscode';
import * as Commands from './commands';
import Config from './config';
import Consts from './consts';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    const {commands, keybindings} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      if ( !_.includes ( ['todo.open', 'todo.openEmbedded'], command ) ) return;

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    keybindings.forEach ( ({ command }) => {

      if ( _.includes ( ['todo.open', 'todo.openEmbedded'], command ) ) return;

      const commandName = _.last ( command.split ( '.' ) ) as string,
            disposable = vscode.commands.registerTextEditorCommand ( command, Commands[commandName] );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  initLanguage () {

    vscode.languages.setLanguageConfiguration ( Consts.languageId, {
      wordPattern: /(-?\d*\.\d\w*)|([^\-\`\~\!\#\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      indentationRules: {
        increaseIndentPattern: Consts.regexes.project,
        decreaseIndentPattern: Consts.regexes.impossible
      }
    });

  },

  getAllMatches ( str: string, regex: RegExp, multi: boolean = true ) {

    regex = multi ? new RegExp ( regex.source, 'gm' ) : regex;

    let match,
        matches = [];

    while ( match = regex.exec ( str ) ) {

      matches.push ( match );

    }

    return matches;

  },

  matches2ranges ( matches: RegExpMatchArray[] ) {

    return matches.map ( Utils.match2range );

  },

  match2range ( match: RegExpMatchArray ) {

    const first = _.first ( match ),
          last = _.last ( match ),
          start = match.index + first.indexOf ( last ),
          end = start + last.length;

    return {start, end};

  },

  parseGlobs ( globs ) {

    return `{${_.castArray ( globs ).join ( ',' )}}`;

  },

  editor: {

    isSupported ( textEditor?: vscode.TextEditor ) {

      return textEditor && ( textEditor.document.languageId === Consts.languageId );

    },

    makeDeleteEdit ( lineNr: number, fromCh: number, toCh: number = fromCh ) {

      const range = new vscode.Range ( lineNr, fromCh, lineNr, toCh ),
            edit = vscode.TextEdit.delete ( range );

      return edit;

    },

    makeInsertEdit ( insertion: string, lineNr: number, charNr: number ) {

      const position = new vscode.Position ( lineNr, charNr ),
            edit = vscode.TextEdit.insert ( position, insertion );

      return edit;

    },

    makeReplaceEdit ( replacement: string, lineNr: number, fromCh: number, toCh: number = fromCh ) {

      const range = new vscode.Range ( lineNr, fromCh, lineNr, toCh ),
            edit = vscode.TextEdit.replace ( range, replacement );

      return edit;

    },

    applyEdits ( textEditor: vscode.TextEditor, edits: vscode.TextEdit[] ) {

      const uri = textEditor.document.uri,
            edit = new vscode.WorkspaceEdit ();

      edit.set ( uri, edits );

      return vscode.workspace.applyEdit ( edit );

    },

    open ( content ) {

      vscode.workspace.openTextDocument ({ language: Consts.languageId }).then ( ( textDocument: vscode.TextDocument ) => {

        vscode.window.showTextDocument ( textDocument ).then ( ( textEditor: vscode.TextEditor ) => {

          textEditor.edit ( edit => {

            const pos = new vscode.Position ( 0, 0 );

            edit.insert ( pos, content );

            textEditor.document.save ();

          });

        });

      });

    }

  },

  file: {

    open ( filepath, isTextDocument = true ) {

      filepath = path.normalize ( filepath );

      const fileuri = vscode.Uri.file ( filepath );

      if ( isTextDocument ) {

        return vscode.workspace.openTextDocument ( fileuri )
                                .then ( vscode.window.showTextDocument );

      } else {

        return vscode.commands.executeCommand ( 'vscode.open', fileuri );

      }

    },

    async read ( filepath ) {

      try {
        return ( await pify ( fs.readFile )( filepath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    readSync ( filepath ) {

      try {
        return ( fs.readFileSync ( filepath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    async make ( filepath, content ) {

      await pify ( mkdirp )( path.dirname ( filepath ) );

      return Utils.file.write ( filepath, content );

    },

    async write ( filepath, content ) {

      return pify ( fs.writeFile )( filepath, content, {} );

    }

  },

  folder: {

    getAllRootPaths () {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return [];

      return workspaceFolders.map ( folder => folder.uri.fsPath );

    },

    getRootPath ( basePath? ) {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return;

      const firstRootPath = workspaceFolders[0].uri.fsPath;

      if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

      const rootPaths = workspaceFolders.map ( folder => folder.uri.fsPath ),
            sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

      return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

    },

    async getWrapperPathOf ( rootPath, cwdPath, findPath ) {

      const foundPath = await findUp ( findPath, { cwd: cwdPath } );

      if ( foundPath ) {

        const wrapperPath = path.dirname ( foundPath );

        if ( wrapperPath.startsWith ( rootPath ) ) {

          return wrapperPath;

        }

      }

    }

  },

  todo: {

    getFiles ( folderPath ) {

      const config = Config.get (),
            {extensions} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes.languages[0],
            files = _.uniq ([ config.file, ...extensions ]);

      return files.map ( file => path.join ( folderPath, file ) );

    },

    get ( folderPath ) {

      const files = Utils.todo.getFiles ( folderPath );

      for ( let file of files ) {

        const content = Utils.file.readSync ( file );

        if ( _.isUndefined ( content ) ) continue;

        return {
          path: file,
          content
        };

      }

    }

  },

  embedded: {

    async get ( rootPaths ) {

      const filePaths = await Utils.embedded.getFilePaths ( rootPaths );

      if ( !filePaths.length ) return;

      const regex = Utils.embedded.getRegex (),
            todos = await Utils.embedded.getFilesTodos ( filePaths, regex ),
            content = await Utils.embedded.renderTodos ( todos );

      return content;

    },

    getRegex () {

      const config = Config.get ();

      return new RegExp ( config.embedded.regex, 'g' );

    },

    async getFilePaths ( rootPaths ) {

      rootPaths = _.castArray ( rootPaths );

      const config = Config.get (),
            {include, exclude} = config.embedded;

      let filePaths = [];

      for ( let rootPath of rootPaths ) {

        const rootFilePaths = await globby ( include, { cwd: rootPath, ignore: exclude, absolute: true } );

        filePaths = filePaths.concat ( rootFilePaths );

      }

      return filePaths;

    },

    async getFilesTodos ( filePaths, regex ) {

      const todos = {}; // { [TYPE] => { [FILE] => [{ LINE, NR }] } }

      await Promise.all ( filePaths.map ( async filePath => {

        const content = await Utils.file.read ( filePath );

        if ( !content ) return;

        const lines = content.split ( '\n' );

        lines.forEach ( ( line, lineNr ) => {

          const matches = stringMatches ( line, regex );

          matches.forEach ( match => {

            const type = match[1];

            if ( !todos[type] ) todos[type] = {};

            if ( !todos[type][filePath] ) todos[type][filePath] = [];

            todos[type][filePath].push ({ line, lineNr });

          });

        });

      }));

      return todos;

    },

    renderTodos ( todos ) {

      const config = Config.get (),
            { indentation, embedded: { groupByFile }, symbols: { box } } = config,
            lines = [];

      /* LINES */

      const types = Object.keys ( todos ).sort ();

      types.forEach ( type => {

        const files = todos[type],
              filePaths = Object.keys ( files ).sort (),
              typeLines = [];

        filePaths.forEach ( filePath => {

          const todos = files[filePath],
                normalizedFilePath = `/${_.trimStart ( filePath, '/' )}`;

          if ( groupByFile ) {
            typeLines.push ( `${indentation}@file://${normalizedFilePath}` );
          }

          todos.forEach ( ({ line, lineNr }) => {

            typeLines.push ( `${indentation}${groupByFile ? indentation : ''}${box} ${_.trimStart ( line )} @file://${normalizedFilePath}#${lineNr + 1}` );

          });

        });

        lines.push ( `${type} (${typeLines.length}):` );
        lines.push ( ...typeLines );

      });

      return lines.length ? `${lines.join ( '\n' )}\n` : '';

    }

  },

  statistics: {

    getTokens ( textEditor = vscode.window.activeTextEditor ) {

      if ( !Utils.editor.isSupported ( textEditor ) ) return;

      let text = textEditor.document.getText ();

      if ( Config.getKey ( 'statistics.ignoreArchive' ) ) {

        const archiveMatch = _.last ( Utils.getAllMatches ( text, Consts.regexes.archive ) ) as undefined | RegExpMatchArray;

        if ( archiveMatch ) {

          text = text.substr ( 0, archiveMatch.index );

        }

      }

      let tokens: any = {
        pending: Utils.getAllMatches ( text, Consts.regexes.todoBox ).length,
        done: Utils.getAllMatches ( text, Consts.regexes.todoDone ).length,
        cancelled: Utils.getAllMatches ( text, Consts.regexes.todoCancel ).length
      };

      tokens.finished = tokens.done + tokens.cancelled;
      tokens.all = tokens.pending + tokens.finished;
      tokens.percentage = tokens.all ? Math.round ( tokens.finished / tokens.all * 100 ) : 100;

      return tokens;

    },

    renderTemplate ( template: string, tokens = Utils.statistics.getTokens () ) {

      if ( !tokens ) return;

      _.forOwn ( tokens, ( val, token ) => {

        template = template.replace ( `[${token}]`, val );

      });

      return template;

    }

  }

};

/* EXPORT */

export default Utils;
