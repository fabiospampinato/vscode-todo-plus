
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import Config from '../config';
import Consts from '../consts';
import {Comment, Project, Tag, TodoBox, TodoDone, TodoCancelled} from '../todo/items';
import AST from './ast';
import Tokens from './statistics_tokens';
import Time from './time';

/* STATISTICS */

const Statistics = {

  /* TIME TAGS */

  timeTags: {

    add ( tag: string, tokens: Tokens, disabledTokens, disabledEst = false ) {

      const prefix = tag[1];

      if ( !disabledTokens.lasted && prefix === 'l' ) { // Maybe @lasted(2h)

        tokens.lastedSeconds += Statistics.timeTags.parseElapsed ( tag );

      } else if ( !disabledTokens.wasted && prefix === 'w' ) { // maybe @wasted(30m)

        tokens.wastedSeconds += Statistics.timeTags.parseElapsed ( tag );

      } else if ( !disabledTokens.est && !disabledEst && ( prefix === 'e' || ( prefix >= '0' && prefix <= '9' ) ) ) { // Maybe @est(1h20m) or @1h20m

        tokens.estSeconds += Statistics.timeTags.parseEstimate ( tag );

      }

    },

    elapseds: {},

    parseElapsed ( tag: string ) {

      if ( Statistics.timeTags.elapseds[tag] ) return Statistics.timeTags.elapseds[tag];

      const match = tag.match ( Consts.regexes.tagElapsed );

      if ( !match ) return 0;

      const time = match[1],
            seconds = Time.diffSeconds ( time );

      Statistics.timeTags.elapseds[tag] = seconds;

      return seconds;

    },

    estimates: {}, // It assumes that all estimates are relative to `now`

    parseEstimate ( tag: string, from?: Date ) {

      if ( Statistics.timeTags.estimates[tag] ) return Statistics.timeTags.estimates[tag];

      const est = tag.match ( Consts.regexes.tagEstimate );

      if ( !est ) return 0;

      const time = est[2] || est[1],
            seconds = Time.diffSeconds ( time, from );

      Statistics.timeTags.estimates[tag] = seconds;

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

    disabled: { // Disabled tokens, no need to compute them
      global: {},
      projects: {}
    },

    updateDisabledAll () {

      const tokens = ['est', 'lasted', 'wasted', 'elapsed']; // These are the expensive tokens

      const globalSettings = ['statistics.statusbar.enabled', 'statistics.statusbar.text', 'statistics.statusbar.tooltip']; // Global settings where tokens could be in use

      Statistics.tokens.updateDisabled ( Statistics.tokens.disabled.global, tokens, globalSettings );

      const projectsSettings = ['statistics.project.enabled', 'statistics.project.text']; // Local settings where tokens could be in use

      Statistics.tokens.updateDisabled ( Statistics.tokens.disabled.projects, tokens, projectsSettings );

    },

    updateDisabled ( obj, tokens: string[], settings: string[] ) { // Ugly name,

      tokens.forEach ( token => {

        obj[token] = !settings.find ( setting => _.includes ( Config.getKey ( setting ), token ) );

      });

    },

    global: {},

    updateGlobal ( items ) {

      if ( items.archive && Config.getKey ( 'statistics.statusbar.ignoreArchive' ) ) { // Keeping only items before the archive

        items = _.reduce ( items, ( acc, value, key ) => {

          const newValue = _.isArray ( value ) ? value.filter ( item => item.lineNumber < items.archive.lineNumber ) : value;

          acc[key] = newValue;

          return acc;

        }, {} );

      }

      const tokens = _.extend ( new Tokens (), {
        comments: items.comments.length,
        projects: items.projects.length,
        tags: items.tags.length,
        pending: items.todosBox.length,
        done: items.todosDone.length,
        cancelled: items.todosCancelled.length
      });

      items.tags.forEach ( tag => Statistics.timeTags.add ( tag.text, tokens, Statistics.tokens.disabled.global ) );

      Statistics.tokens.global = tokens;

    },

    projects: {},

    updateProjects ( textDocument: vscode.TextDocument, items ) {

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
        Statistics.tokens.updateProject ( textDocument, project, lines, lines.indexOf ( project ) );
      });

    },

    updateProject ( textDocument: vscode.TextDocument, project, lines, lineNr: number ) {

      if ( Statistics.tokens.projects[project.lineNumber] ) return Statistics.tokens.projects[project.lineNumber];

      project.level = ( project.level || AST.getLevel ( textDocument, project.line.text ) );

      const tokens = new Tokens ();

      let wasPending = false;

      for ( let i = lineNr + 1, l = lines.length; i < l; i++ ) {

        const nextItem = lines[i];

        if ( nextItem instanceof Tag ) {

          tokens.tags++;

          Statistics.timeTags.add ( nextItem.text, tokens, Statistics.tokens.disabled.projects, !wasPending );

        } else {

          nextItem.level = ( nextItem.level || AST.getLevel ( textDocument, nextItem.line.text ) );

          if ( nextItem.level <= project.level ) break;

          wasPending = nextItem instanceof TodoBox;

          if ( nextItem instanceof Project ) {

            const nextTokens = Statistics.tokens.updateProject ( textDocument, nextItem, lines, i );

            tokens.comments += nextTokens.comments;
            tokens.projects += 1 + nextTokens.projects;
            tokens.tags += nextTokens.tags;
            tokens.pending += nextTokens.pending;
            tokens.done += nextTokens.done;
            tokens.cancelled += nextTokens.cancelled;
            tokens.estSeconds += nextTokens.estSeconds;
            tokens.lastedSeconds += nextTokens.lastedSeconds;
            tokens.wastedSeconds += nextTokens.wastedSeconds;

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

      for ( let token of Tokens.supported ) {

        const re = Statistics.template.getTokenRe ( token );

        if ( !re.test ( template ) ) continue;

        template = template.replace ( re, tokens[token] );

      }

      return template;

    }

  }

};

/* EXPORT */

export default Statistics;
