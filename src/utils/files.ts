
/* IMPORT */

import * as _ from 'lodash';
import * as chokidar from 'chokidar';
import * as globby from 'globby';
import * as micromatch from 'micromatch';
import * as vscode from 'vscode';
import Config from '../config';
import Folder from './folder';

/* FILES */

class Files { //FIXME: There's some code duplication between this and `embedded`

  include = undefined;
  exclude = undefined;
  rootPaths = undefined;
  filesData = undefined; // { [filePath]: todo | undefined }
  watcher = undefined;

  async get ( rootPaths = Folder.getAllRootPaths () ) {

    rootPaths = _.castArray ( rootPaths );

    const config = Config.get ();

    this.include = config.file.include;
    this.exclude = config.file.exclude;

    if ( !this.filesData || !_.isEqual ( this.rootPaths, rootPaths ) ) {

      this.rootPaths = rootPaths;
      this.unwatchPaths ();
      await this.initFilesData ( rootPaths );
      this.watchPaths ( rootPaths );

    } else {

      await this.updateFilesData ();

    }

    this.updateContext ();

    return this.getTodos ();

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
      if ( !this.isIncluded ( filePath ) ) return;
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

    return micromatch ( filePaths, this.include, { ignore: this.exclude, dot: true } );

  }

  isIncluded ( filePath ) {

    return !!this.getIncluded ([ filePath ]).length;

  }

  async getFilePaths ( rootPaths ) {

    return _.flatten ( await Promise.all ( rootPaths.map ( cwd => globby ( this.include, { cwd, ignore: this.exclude, dot: true, absolute: true } ) ) ) );

  }

  async initFilesData ( rootPaths ) {

    const filePaths = await this.getFilePaths ( rootPaths );

    this.filesData = {};

    await Promise.all ( filePaths.map ( async ( filePath: string ) => {

      this.filesData[filePath] = await this.getFileData ( filePath );

    }));

  }

  async updateFilesData () {

    if ( _.isEmpty ( this.filesData ) ) return;

    await Promise.all ( _.map ( this.filesData, async ( val, filePath ) => {

      if ( val ) return;

      this.filesData[filePath] = await this.getFileData ( filePath );

    }));

  }

  async getFileData ( filePath ) {

    const parsedPath = Folder.parsePath ( filePath ),
          textEditor = await vscode.workspace.openTextDocument ( filePath );

    return {
      textEditor,
      filePath,
      root: parsedPath.root,
      rootPath: parsedPath.rootPath,
      relativePath: parsedPath.relativePath
    };

  }

  getTodos () {

    if ( _.isEmpty ( this.filesData ) ) return;

    const todos = {}, // { [ROOT] { { [FILEPATH] => [DATA] } }
          filePaths = Object.keys ( this.filesData );

    filePaths.forEach ( filePath => {

      const data = this.filesData[filePath];

      if ( !data ) return;

      if ( !todos[data.root] ) todos[data.root] = {};

      todos[data.root][filePath] = data;

    });

    return this.simplifyTodos ( todos );

  }

  simplifyTodos ( obj ) {

    if ( _.isObject ( obj ) ) {

      const keys = Object.keys ( obj );

      if ( keys.length === 1 ) {

        obj[''] = this.simplifyTodos ( obj[keys[0]] );

      }

    }

    return obj;

  }

  updateContext () {

    const filesNr = Object.keys ( this.filesData ).length;

    vscode.commands.executeCommand ( 'setContext', 'todo-files-open-button', filesNr <= 1 );

  }

}

/* EXPORT */

export default new Files ();
