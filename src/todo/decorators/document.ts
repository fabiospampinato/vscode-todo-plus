
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Comment from './comment';
import Project from './project';
import Done from './done';
import Cancel from './cancel';
import Code from './code';
import Tags from './tags';
import Style from './style';
import DocumentModule from '../document';
import Utils from '../../utils';

/* DOCUMENT */

class Document {

  static decorate ( textEditor: vscode.TextEditor = vscode.window.activeTextEditor ) {

    if ( !Utils.editor.isSupported ( textEditor ) ) return;

    const doc = new DocumentModule ( textEditor.document ),
          lines = doc.getLines (),
          codes = doc.getCodes (),
          comments = doc.getComments (),
          projects = doc.getProjects (),
          todos = doc.getTodos (),
          decorations = Document.getDecorations ( lines, codes, comments, projects, todos );

    decorations.forEach ( ({ type, ranges }) => textEditor.setDecorations ( type, ranges ) );

  }

  static getDecorations ( lines, codes, comments, projects, todos ) {

    let codeRanges = new Code ().getRanges ( codes ),
        negRanges = _.filter ( _.flatten ( _.flatten ( codeRanges ).map ( range => lines.map ( line => line.range.intersection ( range ) ) ) ) ).map ( range => ({ line: range.start.line, start: range.start.character, end: range.end.character }) ); //FIXME: O(n²), ugly

    return _.concat (
      new Tags ().getDecorations ( lines, negRanges ),
      new Code ().getDecorations ( codes ),
      new Comment ().getDecorations ( comments, negRanges ),
      new Project ().getDecorations ( projects ),
      new Done ().getDecorations ( todos, negRanges ),
      new Cancel ().getDecorations ( todos, negRanges ),
      new Style ().getDecorations ( lines, negRanges )
    );

  }

}

/* EXPORT */

export default Document;
