
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as findUp from 'find-up';
import * as fs from 'fs';
import * as globby from 'globby';
import * as isBinaryPath from 'is-binary-path';
import * as mkdirp from 'mkdirp';
import * as moment from 'moment';
import 'moment-precise-range-plugin';
import * as path from 'path';
import * as pify from 'pify';
import stringMatches from 'string-matches';
import * as sugar from 'sugar-date';
import * as toTime from 'to-time';
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

    makeDeleteLineEdit ( lineNr: number ) {

      const range = new vscode.Range ( lineNr, 0, lineNr + 1, 0 ),
            edit = vscode.TextEdit.delete ( range );

      return edit;

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

  date: {

    diff ( to: Date | string | number, from: Date = new Date (), format: string = 'long' ) {

      const toSeconds = Utils.date.diffSeconds ( to, from ),
            toDate = new Date ( from.getTime () + ( toSeconds * 1000 ) );

      switch ( format ) {
        case 'long': return Utils.date.diffLong ( toDate, from );
        case 'short': return Utils.date.diffShort ( toDate, from );
        case 'short-compact': return Utils.date.diffShortCompact ( toDate, from );
        case 'clock': return Utils.date.diffClock ( toDate, from );
        case 'seconds': return Utils.date.diffSeconds ( toDate, from );
      }

    },

    diffLong ( to: Date, from: Date = new Date () ) {

      return moment['preciseDiff']( from, to );

    },

    diffShortRaw ( to: Date, from: Date = new Date () ) {

      const seconds = Math.round ( ( to.getTime () - from.getTime () ) / 1000 ),
            secondsAbs = Math.abs ( seconds ),
            sign = Math.sign ( seconds );

      let remaining = secondsAbs,
          parts = [];

      const sections: [string, number][] = [
        ['y', 31536000 ],
        ['w', 604800 ],
        ['d', 86400 ],
        ['h', 3600 ],
        ['m', 60 ],
        ['s', 1 ]
      ];

      sections.forEach ( ([ token, seconds ]) => {

        const times = Math.floor ( remaining / seconds );

        parts.push ({ times, token });

        remaining -= seconds * times;

      });

      return { parts, sign };

    },

    diffShort ( to: Date, from?: Date ) {

      const { parts, sign } = Utils.date.diffShortRaw ( to, from );

      const shortParts = [];

      parts.forEach ( ({ times, token }) => {

        if ( !times ) return;

        shortParts.push ( `${times}${token}` );

      });

      return `${sign < 0 ? '-' : ''}${shortParts.join ( ' ' )}`;

    },

    diffShortCompact ( to: Date, from?: Date ) {

      return Utils.date.diffShort ( to, from ).replace ( /\s+/g, '' );

    },

    diffClock ( to: Date, from?: Date ) {

      const { parts, sign } = Utils.date.diffShortRaw ( to, from );

      const padTokens = ['h', 'm', 's'],
            clockParts = [];

      parts.forEach ( ({ times, token }) => {

        if ( !times && !clockParts.length ) return;

        clockParts.push ( `${padTokens.indexOf ( token ) >= 0 && clockParts.length ? _.padStart ( times, 2, '0' ) : times}` );

      });

      return `${sign < 0 ? '-' : ''}${clockParts.join ( ':' )}`;

    },

    diffSeconds ( to: Date | string | number, from: Date = new Date () ) {

      let toDate;

      if ( to instanceof Date ) {

        toDate = to;

      } else if ( _.isNumber ( to ) ) {

        toDate = new Date ( to );

      } else {

        to = to.replace ( / and /gi, ' ' );
        to = to.replace ( /(\d)(ms|s|m|h|d|w|y)(\d)/gi, '$1$2 $3' );

        if ( /^\s*\d+\s*$/.test ( to ) ) return 0;

        if ( !toDate ) { // sugar + ` from now` //FIXME: Should be + ` from ${date.toString ()}` or something
          const date = sugar.Date.create ( `${to} from now` );
          if ( !_.isNaN ( date.getTime () ) ) {
            toDate = date;
          }
        }

        if ( !toDate ) { // sugar
          const date = sugar.Date.create ( to );
          if ( !_.isNaN ( date.getTime () ) ) {
            toDate = date;
          }
        }

        if ( !toDate ) { // to-time
          try {
            const milliseconds = toTime ( to ).milliseconds ();
            toDate = new Date ( from.getTime () + milliseconds );
          } catch ( e ) {}
        }

      }

      return toDate ? Math.round ( ( toDate.getTime () - from.getTime () ) / 1000 ) : 0;

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

    estimatesCache: {}, //TODO: Move this to a more appropriate place // It takes for granted that all estimates are relative to `now`

    getEstimate ( str, from?: Date ) { //TODO: Move this to a more appropriate place

      if ( Utils.statistics.estimatesCache[str] ) return Utils.statistics.estimatesCache[str];

      const est = str.match ( Consts.regexes.tagEstimate );

      if ( !est ) return 0;

      const time = est[2] || est[1],
            seconds = Utils.date.diffSeconds ( time, from );

      Utils.statistics.estimatesCache[str] = seconds;

      return seconds;

    },

    getTokens ( textEditor = vscode.window.activeTextEditor ) {

      if ( !Utils.editor.isSupported ( textEditor ) ) return;

      let text = textEditor.document.getText ();

      if ( Config.getKey ( 'statistics.ignoreArchive' ) ) {

        const archiveMatch = _.last ( Utils.getAllMatches ( text, Consts.regexes.archive ) ) as undefined | RegExpMatchArray;

        if ( archiveMatch ) {

          text = text.substr ( 0, archiveMatch.index );

        }

      }

      const now = new Date (),
            pending = Utils.getAllMatches ( text, Consts.regexes.todoBox );

      let tokens: any = {
        pending: pending.length,
        done: Utils.getAllMatches ( text, Consts.regexes.todoDone ).length,
        cancelled: Utils.getAllMatches ( text, Consts.regexes.todoCancel ).length,
        est: _.sum ( pending.map ( match => Utils.statistics.getEstimate ( match[1], now ) ) )
      };

      tokens.finished = tokens.done + tokens.cancelled;
      tokens.all = tokens.pending + tokens.finished;
      tokens.percentage = tokens.all ? Math.round ( tokens.finished / tokens.all * 100 ) : 100;
      tokens.est = tokens.est ? Utils.date.diff ( now.getTime () + ( tokens.est * 1000 ), now, Config.getKey ( 'timekeeping.estimate.format' ) ) : '';

      return tokens;

    },

    getTokensProject ( textEditor = vscode.window.activeTextEditor, lineNr: number ) {

      const now = new Date ();

      const tokens: any = {
        pending: 0,
        done: 0,
        cancelled: 0,
        est: 0
      };

      Utils.ast.walkDown ( textEditor.document, lineNr, false, function ({ startLevel, line, level }) {
        if ( level <= startLevel ) return false;
        const todoBox = line.text.match ( Consts.regexes.todoBox );
        if ( todoBox ) {
          tokens.pending++;
          const est = Utils.statistics.getEstimate ( todoBox[1], now );
          if ( est ) {
            tokens.est += est;
          }
        } else if ( Consts.regexes.todoDone.test ( line.text ) ) {
          tokens.done++;
        } else if ( Consts.regexes.todoCancel.test ( line.text ) ) {
          tokens.cancelled++;
        }
      });

      tokens.finished = tokens.done + tokens.cancelled;
      tokens.all = tokens.pending + tokens.finished;
      tokens.percentage = tokens.all ? Math.round ( tokens.finished / tokens.all * 100 ) : 100;
      tokens.est = tokens.est ? Utils.date.diff ( now.getTime () + ( tokens.est * 1000 ), now, Config.getKey ( 'timekeeping.estimate.format' ) ) : '';

      return tokens;

    },

    renderTemplate ( template: string, tokens = Utils.statistics.getTokens () ) {

      if ( !tokens ) return;

      _.forOwn ( tokens, ( val, token ) => {

        template = template.replace ( `[${token}]`, val );

      });

      return _.trim ( template );

    }

  },

  ast: {

    getLevel ( str, indentation = Config.getKey ( 'indentation' ) ) {

      let level = 0,
          index = 0;

      while ( index < str.length  ) {
        if ( str.substr ( index, indentation.length ) !== indentation ) break;
        level++;
        index += indentation.length;
      }

      return level;

    },

    walk ( textDocument: vscode.TextDocument, lineNr: number = 0, direction: number = 1, strictlyMonotonic: boolean = false, callback: Function ) { // strictlyMonotonic: only go strictly up or down, don't process other elements at the same level

      const indentation = Config.getKey ( 'indentation' ),
            {lineCount} = textDocument;

      const startLine = textDocument.lineAt ( lineNr ),
            startLevel = Utils.ast.getLevel ( startLine.text, indentation );

      let prevLevel = startLevel,
          nextLine = lineNr + direction;

      while ( nextLine >= 0 && nextLine < lineCount ) {

        const line = textDocument.lineAt ( nextLine );

        if ( !line.text.length || Consts.regexes.empty.test ( line.text ) ) {
          nextLine += direction;
          continue;
        }

        const level = Utils.ast.getLevel ( line.text, indentation );

        if ( direction > 0 && level < startLevel ) break;

        if ( strictlyMonotonic && ( ( direction > 0 && level <= prevLevel ) || ( direction < 0 && level >= prevLevel ) ) ) {
          nextLine += direction;
          continue;
        }

        if ( callback ({ startLine, startLevel, line, level }) === false ) break;

        prevLevel = level;
        nextLine += direction;

      }

    },

    walkDown ( textDocument: vscode.TextDocument, lineNr: number, strictlyMonotonic: boolean, callback: Function ) {

      return Utils.ast.walk ( textDocument, lineNr, 1, strictlyMonotonic, callback );

    },

    walkUp ( textDocument: vscode.TextDocument, lineNr: number, strictlyMonotonic: boolean, callback: Function ) {

      return Utils.ast.walk ( textDocument, lineNr, -1, strictlyMonotonic, callback );

    }

  }

};

/* EXPORT */

export default Utils;
