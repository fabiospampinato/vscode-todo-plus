
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from '../config';
import File from './file';

/* TODO */

const Todo = {

  getFiles ( folderPath ) {

    const config = Config.get (),
          {extensions} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-todo-plus' ).packageJSON.contributes.languages[0],
          files = _.uniq ([ config.file.name, ...extensions ]);

    return files.map ( file => path.join ( folderPath, file ) );

  },

  get ( folderPath ) {

    const files = Todo.getFiles ( folderPath );

    for ( let file of files ) {

      const content = File.readSync ( file );

      if ( _.isUndefined ( content ) ) continue;

      return {
        path: file,
        content
      };

    }

  }

};

/* EXPORT */

export default Todo;
