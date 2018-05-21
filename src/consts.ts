
/* IMPORT */

import * as _ from 'lodash';
import Config from './config';

/* CONSTS */

const Consts = {
  languageId: 'todo',
  symbols: {
    project: ':',
    box: Config.getKey ( 'symbols.box' ),
    done: Config.getKey ( 'symbols.done' ),
    cancel: Config.getKey ( 'symbols.cancel' ),
    tag: '@'
  },
  colors: {
    cancel: Config.getKey ( 'colors.cancel' ),
    done: Config.getKey ( 'colors.done' ),
    code: Config.getKey ( 'colors.code' ),
    comment: Config.getKey ( 'colors.comment' ),
    project: Config.getKey ( 'colors.project' ),
    projectStatistics: Config.getKey ( 'colors.projectStatistics' ),
    tag: Config.getKey ( 'colors.tag' )
  },
  tags: {
    names: Config.getKey ( 'tags.names' ),
    backgroundColors: Config.getKey ( 'tags.backgroundColors' ),
    foregroundColors: Config.getKey ( 'tags.foregroundColors' )
  },
  regexes: {
    impossible: /(?=a)b/,
    empty: /^\s*$/,
    todo: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)/,
    todoToken: /^[^\S\n]*(?!--|––|——)([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/,
    todoBox: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*)/,
    todoCancel: /^[^\S\n]*((?!--|––|——)(?:[✘xX]|\[-\])\s[^\n]*)/,
    todoDone: /^[^\S\n]*((?:[✔✓☑+]|\[[xX+]\])\s[^\n]*)/,
    project: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)[^\S\n]*(.+:[^\S\n]*)(?:(?=@(?!.+ +[^@]))|$)/,
    projectParts: /(\s*)([^:]+):(.*)/,
    archive: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)([^\S\n]*Archive:.*$)/,
    comment: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)(?![^\S\n]*.+:[^\S\n]*(?:(?=@(?!.+ +[^@]))|$))[^\S\n]*([^\n]+)/,
    tag: /(?:^|[^a-zA-Z0-9`])(@[^\s*~(]+(?:\([^)]*\))?)/,
    tagSpecial: /(?=a)b/,
    tagCreated: /@created\(([^)]*)\)/,
    tagStarted: /@started\(([^)]*)\)/,
    tagFinished: /@(?:done|cancelled)\(([^)]*)\)/,
    tagElapsed: /@(?:lasted|wasted)\(([^)]*)\)/,
    tagEstimate: /@est\(([^)]*)\)|@(\d[^\)]+)/,
    code: /((?:```[\s\S]*?```)|(?:`[^`\n]*`))/,
    bold: /(?:^|\s)(\*.+\*)(?:\s|$)/,
    italic: /(?:^|\s)(_.+_)(?:\s|$)/,
    strikethrough: /(?:^|\s)(~.+~)(?:\s|$)/
  }
};

if ( Consts.tags.names.length ) {

  Consts.regexes.tagSpecial = new RegExp ( `(?:^|[^a-zA-Z0-9])(@(?:${Consts.tags.names.map ( n => _.escapeRegExp ( n ) ).join ( '|' )})(?:\\([^)]*\\))?)(?![a-zA-Z])` );

}

const archiveName = Config.getKey ( 'archive.name' );

if ( archiveName ) {

  Consts.regexes.archive = new RegExp ( Consts.regexes.archive.source.replace ( 'Archive', _.escapeRegExp ( archiveName ) ) );

}

/* EXPORT */

export default Consts;
