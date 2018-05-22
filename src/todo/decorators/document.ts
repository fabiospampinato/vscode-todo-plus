
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

    const doc = new DocumentModule ( textEditor ),
          lines = doc.getLines (),
          codes = doc.getCodes (),
          comments = doc.getComments (),
          projects = doc.getProjects (),
          todosDone = doc.getTodosDone (),
          todosCancel = doc.getTodosCancel ();

    const  decorations = Document.getDecorations ( lines, codes, comments, projects, todosDone, todosCancel );

    decorations.forEach ( ({ type, ranges }) => textEditor.setDecorations ( type, ranges ) );

  }

  static getDecorations ( lines, codes, comments, projects, todosDone, todosCancel ) {

    let codeRanges = new Code ().getRanges ( codes ),
        negRanges = _.filter ( _.flatten ( _.flatten ( codeRanges ).map ( range => lines.map ( line => line.range.intersection ( range ) ) ) ) ).map ( range => ({ line: range.start.line, start: range.start.character, end: range.end.character }) ) as any; //FIXME: O(n²), ugly //TSC

    return _.concat (
      new Tags ().getDecorations ( lines, negRanges ),
      new Code ().getDecorations ( codes ),
      new Comment ().getDecorations ( comments, negRanges ),
      new Project ().getDecorations ( projects, negRanges ),
      new Done ().getDecorations ( todosDone, negRanges ),
      new Cancel ().getDecorations ( todosCancel, negRanges ),
      new Style ().getDecorations ( lines, negRanges )
    );

  }

}

/* EXPORT */

export default Document;
