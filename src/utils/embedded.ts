
/* IMPORT */

import * as _ from 'lodash';
import * as globby from 'globby';
import * as isBinaryPath from 'is-binary-path';
import stringMatches from 'string-matches';
import Config from '../config';
import Consts from '../consts';
import File from './file';

/* EMBEDDED */

const Embedded = {

  async get ( rootPaths ) {

    const filePaths = await Embedded.getFilePaths ( rootPaths );

    if ( !filePaths.length ) return;

    const todos = await Embedded.getFilesTodos ( filePaths, Consts.regexes.todoEmbedded ),
          content = await Embedded.renderTodos ( todos );

    return content;

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

      const content = await File.read ( filePath );

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

      lines.push ( `${type}:` );
      lines.push ( ...typeLines );

    });

    return lines.length ? `${lines.join ( '\n' )}\n` : '';

  }

};

/* EXPORT */

export default Embedded;
