
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Line from './items/line';
import Code from './items/code';
import Comment from './items/comment';
import Project from './items/project';
import Todo from './items/todo';
import Consts from '../consts';
import Utils from '../utils';

/* DOCUMENT */

class Document {

  textDocument: vscode.TextDocument;

  constructor ( textDocument: vscode.TextDocument ) {

    this.textDocument = textDocument;

  }

  /* GET */

  getLines () {

    return _.range ( this.textDocument.lineCount )
            .map ( lineNr => this.textDocument.lineAt ( lineNr ) )
            .map ( line => new Line ( this.textDocument, line.range.start, line.range.end, line, line, line.text ) );

  }

  getItems ( Item: typeof Todo | typeof Project | typeof Comment | typeof Line, regex: RegExp ) {

    const matches = Utils.getAllMatches ( this.textDocument.getText (), regex );

    return matches.map ( match => {

      let range = Utils.match2range ( match ),
          startPos = this.textDocument.positionAt ( range.start ),
          endPos = this.textDocument.positionAt ( range.end ),
          startLine = this.textDocument.lineAt ( startPos ),
          endLine = this.textDocument.lineAt ( endPos ),
          text = _.last ( match );

      return new Item ( this.textDocument, startPos, endPos, startLine, endLine, text );

    });

  }

  getCodes () {

    return this.getItems ( Code, Consts.regexes.code );

  }

  getComments () {

    return this.getItems ( Comment, Consts.regexes.comment );

  }

  getProjects () {

    return this.getItems ( Project, Consts.regexes.project );

  }

  getTodos () {

    return this.getItems ( Todo, Consts.regexes.todo );

  }

  /* TAGS */

  static toTag ( tagName: string ): string {

    return `${Consts.symbols.tag}${tagName}`;

  }

}

/* EXPORT */

export default Document;
