
/* IMPORT */

import * as _ from 'lodash';
import * as chokidar from 'chokidar';
import * as globby from 'globby';
import * as isBinaryPath from 'is-binary-path';
import * as querystring from 'querystring';
import stringMatches from 'string-matches';
import Config from '../config';
import Consts from '../consts';
import File from './file';
import Folder from './folder';

/* EMBEDDED */

const Embedded = {

  async get ( rootPaths = Folder.getAllRootPaths (), groupByRoot = true, groupByType = true, groupByFile = true, filter: string | false = false ) {

    const filePaths = await Embedded.getFilePaths ( rootPaths );

    if ( !filePaths.length ) return;

    return await Embedded.getFilesTodos ( filePaths, Consts.regexes.todoEmbedded, groupByRoot, groupByType, groupByFile, filter );

  },

  filePaths: undefined,

  async getFilePaths ( rootPaths ) {

    if ( Embedded.filePaths ) return Embedded.filePaths;

    rootPaths = _.castArray ( rootPaths );

    const config = Config.get (),
          {include, exclude} = config.embedded;

    let filePaths = [];

    for ( let rootPath of rootPaths ) {

      const rootFilePaths = await globby ( include, { cwd: rootPath, ignore: exclude, absolute: true } );

      filePaths = filePaths.concat ( rootFilePaths );

    }

    filePaths = filePaths.filter ( filePath => !isBinaryPath ( filePath ) );

    Embedded.filePaths = filePaths;

    Embedded.watchFilePaths ();

    return filePaths;

  },

  watcher: undefined,

  async watchFilePaths () {

    Embedded.unwatchFilePaths ();

    const config = Config.get ();

    /* HANDLERS */

    function add ( filePath ) {
      if ( !Embedded.filePaths ) return;
      if ( Embedded.filePaths.includes ( filePath ) ) return;
      if ( isBinaryPath ( filePath ) ) return;
      Embedded.filePaths.push ( filePath );
    }

    function change ( filePath ) {
      if ( !Embedded.filePaths ) return;
      delete Embedded.fileData[filePath];
    }

    function unlink ( filePath ) {
      if ( !Embedded.filePaths ) return;
      Embedded.filePaths = Embedded.filePaths.filter ( other => other !== filePath );
      change ( filePath );
    }

    /* WATCHING */

    const roots = Folder.getAllRootPaths ();

    if ( !roots.length ) return;

    Embedded.watcher = chokidar.watch ( roots, { ignored: config.embedded.exclude } ).on ( 'add', add ).on ( 'change', change ).on ( 'unlink', unlink );

  },

  unwatchFilePaths () {

    if ( !Embedded.watcher ) return;

    Embedded.watcher.close ();
    Embedded.filePaths = undefined;
    Embedded.fileData = {};

  },

  fileData: {},

  async getFileData ( filePath, regex ) {

    if ( Embedded.fileData[filePath] ) return Embedded.fileData[filePath];

    const content = await File.read ( filePath );

    if ( !content ) return [];

    const data = [],
          lines = content.split ( /\r?\n/ );

    let pathData;

    lines.forEach ( ( line, lineNr ) => {

      const matches = stringMatches ( line, regex );

      if ( !matches.length ) return;

      if ( !pathData ) {

        pathData = Folder.parsePath ( filePath );

      }

      matches.forEach ( match => {

        data.push ([ pathData, line, lineNr, match ]);

      });

    });

    Embedded.fileData[filePath] = data;

    return data;

  },

  async getFilesTodos ( filePaths, regex, groupByRoot, groupByType, groupByFile, filter ) {

    const todos = {}, // { [ROOT] { [TYPE] => { [FILEPATH] => [DATA] } } }
          filterRe = filter ? new RegExp ( _.escapeRegExp ( filter ), 'i' ) : false;

    await Promise.all ( filePaths.map ( async filePath => {

      const data = await Embedded.getFileData ( filePath, regex );

      if ( !data.length ) return;

      const filePathGroup = groupByFile ? filePath : '';

      data.forEach ( ([ { root, rootPath, relativePath }, line, lineNr, match ]) => {

        if ( filterRe && !filterRe.test ( line ) ) return;

        const todo = match[0],
              type = match[1].toUpperCase (),
              message = match[2],
              code = line.slice ( 0, line.indexOf ( match[0] ) ),
              rootGroup = groupByRoot ? root : '',
              typeGroup = groupByType ? type : '';

        if ( !todos[rootGroup] ) todos[rootGroup] = {};

        if ( !todos[rootGroup][typeGroup] ) todos[rootGroup][typeGroup] = {};

        if ( !todos[rootGroup][typeGroup][filePathGroup] ) todos[rootGroup][typeGroup][filePathGroup] = [];

        todos[rootGroup][typeGroup][filePathGroup].push ({ root, rootPath, relativePath, filePath, line, lineNr, todo, type, message, code });

      });

    }));

    const roots = Object.keys ( todos );

    if ( roots.length === 1 && roots[0] ) {

      return { '': todos[roots[0]] };

    } else {

      return todos;

    }

  },

  renderTodos ( todos ) {

    if ( !todos ) return '';

    const sepRe = new RegExp ( querystring.escape ( '/' ), 'g' ),
          config = Config.get (),
          { indentation, embedded: { file: { wholeLine } }, symbols: { box } } = config,
          lines = [];

    /* LINES */

    const roots = Object.keys ( todos ).sort ();

    roots.forEach ( root => {

      if ( root ) {
        lines.push ( `\n${root}:` );
      }

      const types = Object.keys ( todos[root] ).sort ();

      types.forEach ( type => {

        if ( type ) {
          lines.push ( `${root ? indentation : '\n'}${type}:` );
        }

        const filePaths = Object.keys ( todos[root][type] ).sort ();

        filePaths.forEach ( filePath => {

          if ( filePath ) {

            const normalizedFilePath = `/${_.trimStart ( filePath, '/' )}`,
                  encodedFilePath = querystring.escape ( normalizedFilePath ).replace ( sepRe, '/' );

            lines.push ( `${root ? indentation : ''}${type ? indentation : ''}@file://${encodedFilePath}` );

          }

          const datas = todos[root][type][filePath];

          datas.forEach ( ({ filePath: todoFilePath, line, lineNr, message }) => {

            const normalizedFilePath = `/${_.trimStart ( todoFilePath, '/' )}`,
                  encodedFilePath = querystring.escape ( normalizedFilePath ).replace ( sepRe, '/' );

            lines.push ( `${root ? indentation : ''}${type ? indentation : ''}${filePath ? indentation : ''}${box} ${_.trimStart ( wholeLine ? line : message )} @file://${encodedFilePath}#${lineNr + 1}` );

          });

        });

      });

    });

    return lines.length ? `${lines.join ( '\n' )}\n` : '';

  }

};

/* EXPORT */

export default Embedded;
