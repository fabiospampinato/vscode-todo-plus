
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from '../config';
import FilesView from '../views/files';
import Folder from './folder';

/* FILES */

class Files { //FIXME: There's some code duplication between this and `embedded`

  include = undefined;
  exclude = undefined;
  rootPaths = undefined;
  filesData = undefined; // { [filePath]: todo | undefined }
  watcher: vscode.FileSystemWatcher = undefined;

  async get ( rootPaths = Folder.getAllRootPaths () ) {

    rootPaths = _.castArray ( rootPaths );

    const config = Config.get ();

    this.include = config.file.include;
    this.exclude = config.file.exclude;

    if ( !this.filesData || !_.isEqual ( this.rootPaths, rootPaths ) ) {

      this.rootPaths = rootPaths;
      this.unwatchPaths ();
      await this.initFilesData ( rootPaths );
      this.watchPaths ();

    } else {

      await this.updateFilesData ();

    }

    this.updateContext ();

    return this.getTodos ();

  }

  async watchPaths () {

    /* HELPERS */

    const pathNormalizer = filePath => filePath.replace ( /\\/g, '/' );

    /* HANDLERS */

    const refresh = _.debounce ( () => FilesView.refresh (), 250 );

    const add = event => {
      console.log('add',event.fsPath);
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      if ( this.filesData.hasOwnProperty ( filePath ) ) return;
      if ( !this.isIncluded ( filePath ) ) return;
      this.filesData[filePath] = undefined;
      refresh ();
    };

    const change = event => {
      console.log('change',event.fsPath);
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      if ( !this.isIncluded ( filePath ) ) return;
      this.filesData[filePath] = undefined;
      refresh ();
    };

    const unlink = event => {
      console.log('unlink',event.fsPath);
      if ( !this.filesData ) return;
      const filePath = pathNormalizer ( event.fsPath );
      delete this.filesData[filePath];
      refresh ();
    };

    /* WATCHING */

    this.include.forEach ( glob => {

      this.watcher = vscode.workspace.createFileSystemWatcher ( glob );

      this.watcher.onDidCreate ( add );
      this.watcher.onDidChange ( change );
      this.watcher.onDidDelete ( unlink );

    });

  }

  unwatchPaths () {

    if ( !this.watcher ) return;

    this.watcher.dispose ();

  }

  getIncluded ( filePaths ) {

    const micromatch = require ( 'micromatch' ); // Lazy import for performance

    return micromatch ( filePaths, this.include, { ignore: this.exclude, dot: true } );

  }

  isIncluded ( filePath ) {

    return !!this.getIncluded ([ filePath ]).length;

  }

  async getFilePaths ( rootPaths ) {

    const globby = require ( 'globby' ); // Lazy import for performance

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
