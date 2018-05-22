
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import CodeItem from '../items/code';
import CommentItem from '../items/comment';
import LineItem from '../items/line';
import ProjectItem from '../items/project';
import TodoItem from '../items/todo';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';
import Line from './line';

/* PROJECT */

const PROJECT_BASIC = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.project
});

const PROJECT_STATISTICS = () => ({
  color: Consts.colors.project,
  after: {
    contentText: undefined,
    color: Consts.colors.projectStatistics,
    margin: '0 5px 0 5px',
    textDecoration: ';font-size: .9em'
  }
});

const StatisticsTypes = {

  types: {},

  get ( contentText: string, textEditor: vscode.TextEditor ) {
    const decorations = PROJECT_STATISTICS ();
    decorations.after.contentText = contentText;
    const type = vscode.window.createTextEditorDecorationType ( decorations );
    const id = textEditor.document.uri.fsPath;
    if ( !StatisticsTypes.types[id] ) StatisticsTypes.types[id] = [];
    StatisticsTypes.types[id].push ( type );
    return type;
  },

  reset ( textEditor: vscode.TextEditor ) {
    const id = textEditor.document.uri.fsPath;
    if ( !StatisticsTypes.types[id] ) return;
    StatisticsTypes.types[id].forEach ( type => textEditor.setDecorations ( type, [] ) );
    StatisticsTypes.types[id] = [];
  }

};

class Project extends Line {

  TYPES = [PROJECT_BASIC];
  TYPES_STATISTICS = [];

  getItemRanges ( project: ProjectItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangesRegex ( project.startLine, Consts.regexes.project, [Consts.regexes.tag, Consts.regexes.code], negRange )];

  }

  getDecorations ( items: ProjectItem[] | CodeItem[] | CommentItem[] | LineItem[], negRange?: vscode.Range | vscode.Range[] ) {

    const condition = Config.getKey ( 'statistics.project.enabled' );

    if ( condition === false ) return super.getDecorations ( items, negRange );

    const textEditor = items.length ? items[0].textEditor : vscode.window.activeTextEditor;

    StatisticsTypes.reset ( textEditor );

    const template = Config.getKey ( 'statistics.project.text' ),
          basicRanges = [],
          statisticsData = [];

    items.forEach ( item => {

      const ranges = this.getItemRanges ( item, negRange ),
            range = ranges[0][0],
            tokens = Utils.statistics.getTokensProject ( textEditor, range.start.line ),
            withStatistics = Utils.statistics.isEnabled ( condition, tokens );

      if ( withStatistics ) {

        const contentText = Utils.statistics.renderTemplate ( template, tokens ),
              type = StatisticsTypes.get ( contentText, textEditor );

        statisticsData.push ({ type, ranges: [range] });

      } else {

        basicRanges.push ( range );

      }

    });

    return [
      {
        type: PROJECT_BASIC,
        ranges: basicRanges
      },
      ...statisticsData
    ];

  }

}

/* EXPORT */

export default Project;
