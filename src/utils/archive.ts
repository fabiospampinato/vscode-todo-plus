
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as moment from 'moment';
import {Comment, Project, Todo, TodoBox} from '../todo/items';
import Document from '../todo/document';
import Config from '../config';
import Consts from '../consts';
import AST from './ast';
import Editor from './editor';

/* ARCHIVE */

const Archive = {

  async get ( doc: Document, insert: boolean = false ) {

    let archive = doc.getArchive ();

    if ( archive ) return archive;

    if ( insert ) {

      const config = Config.get (),
            pos = doc.textDocument.positionAt ( Infinity ), // Last pos
            text = `\n${config.archive.name}${Consts.symbols.project}\n`,
            edit = Editor.edits.makeInsert ( text, pos.line, pos.character );

      await Editor.edits.apply ( doc.textEditor, [edit] );

      return doc.getArchive ();

    }

  },

  async run ( doc: Document ) {

    const archive = await Archive.get ( doc ),
          archivableRange = new vscode.Range ( 0, 0, archive ? archive.line.range.start.line : Infinity, archive ? archive.line.range.start.character : Infinity ),
          archivableText = doc.textDocument.getText ( archivableRange ),
          archivableDoc = new Document ( doc.textDocument );

    archivableDoc.text = archivableText;

    const data = {
      remove: [], // Lines to remove
      insert: {} // Map of `lineNumber => text` to insert
    };

    for ( let transformation of Archive.transformations.order ) {

      Archive.transformations[transformation]( archivableDoc, data );

    }

    Archive.edit ( doc, data );

  },

  async edit ( doc: Document, data ) { //FIXME: Refactor, this is getting quite ugly

    const finishedFormat = Config.getKey ( 'timekeeping.finished.format' );

    let prevFinishedDate: number | Date = -1; // Ensuring comments' position relative to their parent todo is preserved

    function getFinishedDate ( line ) {

      if ( Consts.regexes.todoFinished.test ( line ) ) {

        const match = line.match ( Consts.regexes.tagFinished );

        if ( match ) return prevFinishedDate = moment ( match[1], finishedFormat ).toDate ();

        return prevFinishedDate = -1;

      }

      return prevFinishedDate;

    }

    const line2number = line => line.lineNumber,
          line2date = Config.getKey ( 'archive.sortByDate' ) ? line => getFinishedDate ( line.text ) : _.constant ( -1 ),
          natSort = ( a, b ) => a.lineNumber - b.lineNumber,
          removeLines = _.uniqBy ( data.remove, line2number ) as any, //TSC
          insertLines = _.orderBy ( _.map ( data.insert, ( text, lineNumber ) => ({ text, lineNumber }) ).sort ( natSort ), [line2date], ['desc'] ).map ( line => line['text']), //TSC
          edits = [];

    removeLines.forEach ( line => {
      edits.push ( Editor.edits.makeDeleteLine ( line.lineNumber ) );
    });

    if ( insertLines.length ) {

      const archive = await Archive.get ( doc, true ),
            insertText = `${Consts.indentation}${insertLines.join ( `\n${Consts.indentation}` )}\n`;

      edits.push ( Editor.edits.makeInsert ( insertText, archive.line.range.start.line + 1, 0 ) );

    }

    Editor.edits.apply ( doc.textEditor, edits );

  },

  transformations: { // Transformations to apply to the document

    order: ['addTodosFinished', 'addTodosComments', 'addProjectTag', 'removeEmptyProjects', 'removeEmptyLines'], // The order in which to apply the transformations

    addTodosFinished ( doc: Document, data ) {

      const todosFinished = doc.getTodosFinished (),
            lines = todosFinished.map ( todo => todo.line );

      lines.forEach ( line => {

        data.remove.push ( line );
        data.insert[line.lineNumber] = _.trimStart ( line.text );

      });

    },

    addTodosComments ( doc: Document, data ) {

      data.remove.forEach ( line => {

        AST.walkDown ( doc.textDocument, line.lineNumber, true, false, function ({ startLevel, line, level }) {

          if ( startLevel === level || !Comment.is ( line.text ) ) return false;

          data.remove.push ( line );
          data.insert[line.lineNumber] = `${Consts.indentation}${_.trimStart ( line.text )}`;

        });

      });

    },

    addProjectTag ( doc: Document, data ) {

      if ( !Config.getKey ( 'archive.project.enabled' ) ) return;

      data.remove.forEach ( line => {

        if ( !Todo.is ( line.text ) ) return;

        const projects = [];

        AST.walkUp ( doc.textDocument, line.lineNumber, true, true, function ({ line }) {

          if ( !Project.is ( line.text ) ) return;

          const parts = line.text.match ( Consts.regexes.projectParts );

          projects.push ( parts[2] );

        });

        if ( !projects.length ) return;

        data.insert[line.lineNumber] = `${data.insert[line.lineNumber]} ${Consts.symbols.tag}project(${projects.reverse ().join ( Config.getKey ( 'archive.project.separator' ) )})`;

      });

    },

    removeEmptyProjects ( doc: Document, data ) {

      if ( !Config.getKey ( 'archive.remove.emptyProjects' ) ) return;

      const projects = doc.getProjects ();

      projects.forEach ( project => {

        const lines = [project.line];

        let isEmpty = true;

        AST.walkDown ( doc.textDocument, project.line.lineNumber, true, false, function ({ startLevel, line, level }) {

          if ( startLevel === level ) return false;

          if ( TodoBox.is ( line.text ) ) return isEmpty = false;

          lines.push ( line );

        });

        if ( !isEmpty ) return;

        data.remove.push ( ...lines );

      });

    },

    removeEmptyLines ( doc: Document, data ) {

      const emptyLines = Config.getKey ( 'archive.remove.emptyLines' );

      if ( emptyLines < 0 ) return;

      let streak = 0; // Number of consecutive empty lines

      AST.walkDown ( doc.textDocument, -1, false, false, function ({ startLevel, line, level }) {

        if ( data.remove.find ( other => other === line ) ) return;

        if ( line.text && !Consts.regexes.empty.test ( line.text ) ) {

          streak = 0;

        } else {

          streak++;

          if ( streak > emptyLines ) {

            data.remove.push ( line );

          }

        }

      });

    }

  }

};

/* EXPORT */

export default Archive;
