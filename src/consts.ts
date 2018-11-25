
/* IMPORT */

import * as _ from 'lodash';
import Config from './config';

/* CONSTS */

const Consts = {

  get () {

    const config = Config.get (),
          archiveName = _.get ( config, 'archive.name' ) || 'Archive',
          tagsNames = _.get ( config, 'tags.names' );

    function getColors ( root ) {
      return {
        done: _.get ( config, `${root}.done` ),
        cancelled: _.get ( config, `${root}.cancelled` ),
        code: _.get ( config, `${root}.code` ),
        comment: _.get ( config, `${root}.comment` ),
        project: _.get ( config, `${root}.project` ),
        projectStatistics: _.get ( config, `${root}.projectStatistics` ),
        tag: _.get ( config, `${root}.tag` ),
        tags: {
          background: _.get ( config, `${root}.tags.background`, [] ),
          foreground: _.get ( config, `${root}.tags.foreground`, [] )
        },
        types: _.transform ( _.get ( config, `${root}.types`, {} ), ( acc, val, key: string ) => { acc[key.toUpperCase ()] = val }, {} )
      }
    }

    return {
      languageId: 'todo',
      indentation: _.get ( config, 'indentation' ),
      timer: _.get ( config, 'timer.statusbar.enabled' ),
      symbols: {
        project: ':',
        box: _.get ( config, 'symbols.box' ),
        done: _.get ( config, 'symbols.done' ),
        cancelled: _.get ( config, 'symbols.cancelled' ),
        tag: '@'
      },
      colors: _.extend ( getColors ( 'colors' ), {
        dark: getColors ( 'colors.dark' ),
        light: getColors ( 'colors.light' )
      }),
      tags: {
        names: _.get ( config, 'tags.names' )
      },
      regexes: {
        impossible: /(?=a)b/gm,
        empty: /^\s*$/,
        todo: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)/gm,
        todoSymbol: /^[^\S\n]*(?!--|––|——)([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/,
        todoBox: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s(?![^\n]*[^a-zA-Z0-9]@(?:done|cancelled)(?:(?:\([^)]*\))|(?![a-zA-Z])))[^\n]*)/gm,
        todoBoxStarted: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s(?=[^\n]*[^a-zA-Z0-9]@started(?:(?:\([^)]*\))|(?![a-zA-Z])))[^\n]*)/gm,
        todoDone: /^[^\S\n]*((?!--|––|——)(?:(?:(?:[✔✓☑+]|\[[xX+]\])\s[^\n]*)|(?:(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*[^a-zA-Z0-9]@done(?:(?:\([^)]*\))|(?![a-zA-Z]))[^\n]*)))/gm,
        todoCancelled: /^[^\S\n]*((?!--|––|——)(?:(?:(?:[✘xX]|\[-\])\s[^\n]*)|(?:(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*[^a-zA-Z0-9]@cancelled(?:(?:\([^)]*\))|(?![a-zA-Z]))[^\n]*)))/gm,
        todoFinished:  /^[^\S\n]*((?!--|––|——)(?:(?:(?:[✔✓☑+✘xX]|\[[xX+-]\])\s[^\n]*)|(?:(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*[^a-zA-Z0-9]@(?:done|cancelled)(?:(?:\([^)]*\))|(?![a-zA-Z]))[^\n]*)))/gm,
        todoEmbedded: new RegExp ( _.get ( config, 'embedded.regex' ), _.get ( config, 'embedded.regexFlags' ) ),
        project: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)[^\S\n]*(.+:)[^\S\n]*(?:(?=@[^\s*~(:]+(?::\/\/[^\s*~(:]+)?(?:\([^)]*\))?)|$)/gm,
        projectParts: /(\s*)([^:]+):(.*)/,
        archive: new RegExp ( `^(?![^\\S\\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\\[[ xX+-]?\\])\\s[^\\n]*)([^\\S\\n]*${_.escapeRegExp ( archiveName )}:.*$)`, 'gm' ),
        comment: /^(?!\s*$)(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)(?![^\S\n]*.+:[^\S\n]*(?:(?=@[^\s*~(:]+(?::\/\/[^\s*~(:]+)?(?:\([^)]*\))?)|$))[^\S\n]*([^\n]+)/gm,
        tag: /(?:^|[^a-zA-Z0-9`])(@[^\s*~(:]+(?::\/\/[^\s*~(:]+)?(?:\([^)]*\))?)/gm,
        tagSpecial: new RegExp ( `(?:^|[^a-zA-Z0-9])@(${tagsNames.map ( n => _.escapeRegExp ( n ) ).join ( '|' )})(?:(?:\\([^)]*\\))|(?![a-zA-Z]))`, 'gm' ),
        tagSpecialNormal: new RegExp ( `(?:^|[^a-zA-Z0-9])(?:${tagsNames.map ( n => `(@${_.escapeRegExp ( n )}(?:(?:\\([^)]*\\))|(?![a-zA-Z])))` ).join ( '|' )}|(@[^\\s*~(:]+(?::\/\/[^\\s*~(:]+)?(?:(?:\\([^)]*\\))|(?![a-zA-Z]))))`, 'gm' ),
        tagNormal: new RegExp ( `(?:^|[^a-zA-Z0-9])@(?!${tagsNames.map ( n => _.escapeRegExp ( n ) ).join ( '|' )}|created|done|cancelled|started|lasted|wasted|est|\\d)[^\\s*~(:]+(?::\/\/[^\\s*~(:]+)?(?:\\([^)]*\\))?` ),
        tagCreated: /(?:^|[^a-zA-Z0-9])@created(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
        tagStarted: /(?:^|[^a-zA-Z0-9])@started(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
        tagFinished: /(?:^|[^a-zA-Z0-9])@(?:done|cancelled)(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
        tagElapsed: /(?:^|[^a-zA-Z0-9])@(?:lasted|wasted)(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
        tagEstimate: /(?:^|[^a-zA-Z0-9])@est\(([^)]*)\)|@(\d\S+)/,
        formatted: /(?:^|[^a-zA-Z0-9])(?:(`[^\n`]*`)|(\*[^\n*]+\*)|(_[^\n_]+_)|(~[^\n~]+~))(?![a-zA-Z])/gm,
        formattedCode: /(?:^|[^a-zA-Z0-9])(`[^\n`]*`)(?![a-zA-Z])/gm,
        formattedBold: /(?:^|[^a-zA-Z0-9])(\*[^\n*]+\*)(?![a-zA-Z])/gm,
        formattedItalic: /(?:^|[^a-zA-Z0-9])(_[^\n_]+_)(?![a-zA-Z])/gm,
        formattedStrikethrough: /(?:^|[^a-zA-Z0-9])(~[^\n~]+~)(?![a-zA-Z])/gm
      }
    };

  },

  update () {

    _.extend ( Consts, Consts.get () );

  }

};

Consts.update ();

type IConsts = typeof Consts & ReturnType<typeof Consts.get>;

/* EXPORT */

export default Consts as IConsts;
