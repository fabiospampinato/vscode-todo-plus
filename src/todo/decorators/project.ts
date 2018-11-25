
/* IMPORT */

import * as vscode from 'vscode';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';
import ProjectItem from '../items/project';
import Line from './line';

/* DECORATION TYPES */

const PROJECT_BASIC = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.project,
  rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
  dark: {
    color: Consts.colors.dark.project
  },
  light: {
    color: Consts.colors.light.project
  }
});

const PROJECT_STATISTICS = () => ({
  color: Consts.colors.project,
  rangeBehavior: vscode.DecorationRangeBehavior.OpenClosed,
  after: {
    contentText: undefined,
    color: Consts.colors.projectStatistics,
    margin: '.05em 0 .05em .5em',
    textDecoration: ';font-size: .9em'
  },
  dark: {
    color: Consts.colors.dark.project,
    after: {
      color: Consts.colors.dark.projectStatistics,
    }
  },
  light: {
    color: Consts.colors.light.project,
    after: {
      color: Consts.colors.light.projectStatistics,
    }
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

/* PROJECT */

class Project extends Line {

  TYPES = [PROJECT_BASIC];

  getItemRanges ( project: ProjectItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangeDifference ( project.text, project.range, negRange || [Consts.regexes.tag] )];

  }

  getDecorations ( projects: ProjectItem[] ) {

    const condition = Config.getKey ( 'statistics.project.enabled' );

    if ( condition === false ) return super.getDecorations ( projects );

    const textEditor = projects.length ? projects[0].textEditor : vscode.window.activeTextEditor;

    StatisticsTypes.reset ( textEditor );

    const template = Config.getKey ( 'statistics.project.text' ),
          basicRanges = [],
          statisticsData = [];

    projects.forEach ( project => {

      const ranges = this.getItemRanges ( project )[0],
            tokens = Utils.statistics.tokens.projects[project.lineNumber],
            withStatistics = Utils.statistics.condition.is ( condition, Utils.statistics.tokens.global, tokens );

      if ( withStatistics ) {

        const contentText = Utils.statistics.template.render ( template, tokens ),
              type = StatisticsTypes.get ( contentText, textEditor );

        statisticsData.push ({ type, ranges });

      } else {

        basicRanges.push ( ...ranges );

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
