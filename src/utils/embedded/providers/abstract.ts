
/* IMPORT */

import * as _ from 'lodash';
import * as chokidar from 'chokidar';
import * as micromatch from 'micromatch';
import * as querystring from 'querystring';
import Config from '../../../config';
import Folder from '../../folder';

/* ABSTRACT */

class Abstract {

  include = undefined;
  exclude = undefined;
  globs = undefined;
  rootPaths = undefined;
  filesData = undefined; // { [filePath]: todo[] | undefined }
  watcher = undefined;

  async get ( rootPaths = Folder.getAllRootPaths (), groupByRoot = true, groupByType = true, groupByFile = true, filter: string | false = false ) {

    rootPaths = _.castArray ( rootPaths );

    const config = Config.get ();

    if ( !_.isEqual ( this.include, config.embedded.include ) || !_.isEqual ( this.exclude, config.embedded.exclude ) ) {

      this.include = config.embedded.include;
      this.exclude = config.embedded.exclude;
      this.globs = this.include.concat ( this.exclude.map ( pattern => `!${pattern}` ) );

    }

    if ( !this.filesData || !_.isEqual ( this.rootPaths, rootPaths ) ) {

      this.rootPaths = rootPaths;
      this.unwatchPaths ();
      await this.initFilesData ( rootPaths );
      this.watchPaths ( rootPaths );

    } else {

      await this.updateFilesData ();

    }

    return this.getTodos ( groupByRoot, groupByType, groupByFile, filter );

  }

  async watchPaths ( rootPaths ) {

    /* HELPERS */

    const pathNormalizer = filePath => filePath.replace ( /\\/g, '/' );

    /* HANDLERS */

    const add = filePath => {
      if ( !this.filesData ) return;
      filePath = pathNormalizer ( filePath );
      if ( this.filesData.hasOwnProperty ( filePath ) ) return;
      if ( !this.isIncluded ( filePath ) ) return;
      this.filesData[filePath] = undefined;
    };

    const change = filePath => {
      if ( !this.filesData ) return;
      filePath = pathNormalizer ( filePath );
      if ( !this.filesData.hasOwnProperty ( filePath ) ) return;
      this.filesData[filePath] = undefined;
    };

    const unlink = filePath => {
      if ( !this.filesData ) return;
      filePath = pathNormalizer ( filePath );
      delete this.filesData[filePath];
    };

    /* WATCHING */

    if ( !rootPaths.length ) return;

    const chokidarOptions = {
      ignored: this.exclude,
      ignoreInitial: true
    };

    this.watcher = chokidar.watch ( rootPaths, chokidarOptions ).on ( 'add', add ).on ( 'change', change ).on ( 'unlink', unlink );

  }

  unwatchPaths () {

    if ( !this.watcher ) return;

    this.watcher.close ();

  }

  getIncluded ( filePaths ) {

    return micromatch ( filePaths, this.globs, { dot: true } );

  }

  isIncluded ( filePath ) {

    return !!this.getIncluded ([ filePath ]).length;

  }

  async initFilesData ( rootPaths ) {

    this.filesData = {};

  }

  async updateFilesData () {}

  getTodos ( groupByRoot, groupByType, groupByFile, filter ) {

    if ( _.isEmpty ( this.filesData ) ) return;

    const todos = {}, // { [ROOT] { [TYPE] => { [FILEPATH] => [DATA] } } }
          filterRe = filter ? new RegExp ( _.escapeRegExp ( filter ), 'i' ) : false,
          filePaths = Object.keys ( this.filesData );

    filePaths.forEach ( filePath => {

      const data = this.filesData[filePath];

      if ( !data || !data.length ) return;

      const filePathGroup = groupByFile ? filePath : '';

      data.forEach ( datum => {

        if ( filterRe && !filterRe.test ( datum.line ) ) return;

        const rootGroup = groupByRoot ? datum.root : '';

        if ( !todos[rootGroup] ) todos[rootGroup] = {};

        const typeGroup = groupByType ? datum.type : '';

        if ( !todos[rootGroup][typeGroup] ) todos[rootGroup][typeGroup] = {};

        if ( !todos[rootGroup][typeGroup][filePathGroup] ) todos[rootGroup][typeGroup][filePathGroup] = [];

        todos[rootGroup][typeGroup][filePathGroup].push ( datum );

      });

    });

    const roots = Object.keys ( todos );

    return roots.length > 1 ? todos : { '': todos[roots[0]] };

  }

  renderTodos ( todos ) {

    if ( _.isEmpty ( todos ) ) return '';

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

          const data = todos[root][type][filePath];

          data.forEach ( datum => {

            const normalizedFilePath = `/${_.trimStart ( datum.filePath, '/' )}`,
                  encodedFilePath = querystring.escape ( normalizedFilePath ).replace ( sepRe, '/' );

            lines.push ( `${root ? indentation : ''}${type ? indentation : ''}${filePath ? indentation : ''}${box} ${_.trimStart ( wholeLine ? datum.line : datum.message )} @file://${encodedFilePath}#${datum.lineNr + 1}` );

          });

        });

      });

    });

    return lines.length ? `${lines.join ( '\n' )}\n` : '';

  }

}

/* EXPORT */

export default Abstract;
