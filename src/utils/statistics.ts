
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from '../config';
import Consts from '../consts';
import {Comment, Project, Tag, TodoBox, TodoDone, TodoCancelled} from '../todo/items';
import AST from './ast';
import Editor from './editor';
import Regex from './regex';
import Time from './time';

/* STATISTICS */

const Statistics = {

  /* ESTIMATE */

  estimate: {

    estimates: {}, // It assumes that all estimates are relative to `now`

    parse ( str, from?: Date ) {

      if ( Statistics.estimate.estimates[str] ) return Statistics.estimate.estimates[str];

      const est = str.match ( Consts.regexes.tagEstimate );

      if ( !est ) return 0;

      const time = est[2] || est[1],
            seconds = Time.diffSeconds ( time, from );

      Statistics.estimate.estimates[str] = seconds;

      return seconds;

    }

  },

  /* CONDITION */

  condition: {

    functions: {}, // Cache of functions created from conditions

    toFunction ( condition ) { // Avoiding repeatedly calling `eval`

      if ( Statistics.condition.functions[condition] ) return Statistics.condition.functions[condition];

      const fn = new Function ( 'global', 'project', `return ${condition}` );

      Statistics.condition.functions[condition] = fn;

      return fn;

    },

    is ( condition, globalTokens, projectTokens ) {

      if ( _.isBoolean ( condition ) ) return condition;

      if ( !globalTokens && !projectTokens ) return false;

      const fn = Statistics.condition.toFunction ( condition );

      try {

        return !!fn ( globalTokens, projectTokens );

      } catch ( e ) {

        return false;

      }

    }

  },

  /* TOKENS */

  tokens: {

    global: {},

    updateGlobal ( items ) {

      const tokens: any = {
        comments: items.comments.length,
        projects: items.projects.length,
        tags: items.tags.length,
        pending: items.todosBox.length,
        done: items.todosDone.length,
        cancelled: items.todosCancelled.length,
        estSeconds: _.sum ( items.tags.map ( tag => Statistics.estimate.parse ( tag.text ) ) )
      };

      tokens.finished = tokens.done + tokens.cancelled;
      tokens.all = tokens.pending + tokens.done + tokens.cancelled;
      tokens.percentage = tokens.all ? Math.round ( tokens.finished / tokens.all * 100 ) : 100;
      tokens.est = tokens.estSeconds ? Time.diff ( Date.now () + ( tokens.estSeconds * 1000 ), undefined, Config.getKey ( 'timekeeping.estimate.format' ) ) : '';

      Statistics.tokens.global = tokens;

    },

    projects: {},

    updateProjects ( items ) {

      Statistics.tokens.projects = {};

      if ( !items.projects ) return;

      function mergeSorted ( arr1, arr2 ) { //URL: https://stackoverflow.com/questions/5958169/how-to-merge-two-sorted-arrays-into-a-sorted-array#answer-31310853

        const merged = new Array ( arr1.length + arr2.length );

        let i = arr1.length - 1,
            j = arr2.length - 1,
            k = merged.length;

        while ( k ) {
          merged[--k] = ( j < 0 || ( i >= 0 && arr1[i].lineNumber > arr2[j].lineNumber ) ) ? arr1[i--] : arr2[j--];
        }

        return merged;

      }

      const groups = [items.projects, items.todosBox, items.todosDone, items.todosCancelled, items.tags.length >= 500 ? [] : items.tags], //TODO: Undocumented, uncustomizable limitation regarding tags
            lines = groups.reduce ( ( arr1, arr2 ) => mergeSorted ( arr1, arr2 ) );

      items.projects.forEach ( project => {
        Statistics.tokens.updateProject ( project, lines, lines.indexOf ( project ) );
      });

    },

    updateProject ( project, lines, lineNr: number ) {

      if ( Statistics.tokens.projects[project.lineNumber] ) return Statistics.tokens.projects[project.lineNumber];

      project.level = ( project.level || AST.getLevel ( project.line.text ) );

      const tokens: any = {
        comments: 0,
        projects: 0,
        tags: 0,
        pending: 0,
        done: 0,
        cancelled: 0,
        estSeconds: 0
      };

      let wasPending = false;

      for ( let i = lineNr + 1, l = lines.length; i < l; i++ ) {

        const nextItem = lines[i];

        if ( nextItem instanceof Tag ) {

          tokens.tags++;

          if ( !wasPending ) continue;

          tokens.estSeconds += Statistics.estimate.parse ( nextItem.text );

        } else {

          nextItem.level = ( nextItem.level || AST.getLevel ( nextItem.line.text ) );

          if ( nextItem.level <= project.level ) break;

          wasPending = nextItem instanceof TodoBox;

          if ( nextItem instanceof Project ) {

            const nextTokens = Statistics.tokens.updateProject ( nextItem, lines, i );

            tokens.comments += nextTokens.comments;
            tokens.projects += 1 + nextTokens.projects;
            tokens.tags += nextTokens.tags;
            tokens.pending += nextTokens.pending;
            tokens.done += nextTokens.done;
            tokens.cancelled += nextTokens.cancelled;
            tokens.estSeconds += nextTokens.estSeconds;

            i += nextTokens.comments + nextTokens.projects + nextTokens.tags + nextTokens.pending + nextTokens.done + nextTokens.cancelled; // Jumping

          } if ( nextItem instanceof Comment ) {

            tokens.comments++;

          } else if ( nextItem instanceof TodoBox ) {

            tokens.pending++;

          } else if ( nextItem instanceof TodoDone ) {

            tokens.done++;

          } else if ( nextItem instanceof TodoCancelled ) {

            tokens.cancelled++;

          }

        }

      }

      tokens.finished = tokens.done + tokens.cancelled;
      tokens.all = tokens.pending + tokens.done + tokens.cancelled;
      tokens.percentage = tokens.all ? Math.round ( tokens.finished / tokens.all * 100 ) : 100;
      tokens.est = tokens.estSeconds ? Time.diff ( Date.now () + ( tokens.estSeconds * 1000 ), undefined, Config.getKey ( 'timekeeping.estimate.format' ) ) : '';

      Statistics.tokens.projects[project.lineNumber] = tokens;

      return tokens;

    }

  },

  /* TEMPLATE */

  template: {

    tokensRe: {}, // Map of `token => tokenRe`

    getTokenRe ( token ) {

      if ( Statistics.template.tokensRe[token] ) return Statistics.template.tokensRe[token];

      const re = new RegExp ( `\\[${_.escapeRegExp ( token )}\\]`, 'g' );

      Statistics.template.tokensRe[token] = re;

      return re;

    },

    render ( template: string, tokens = Statistics.getTokens () ) {

      if ( !tokens ) return;

      for ( let token in tokens ) {

        const re = Statistics.template.getTokenRe ( token );

        template = template.replace ( re, tokens[token] );

      }

      return template;

    }

  }

};

/* EXPORT */

export default Statistics;
