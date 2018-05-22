
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
    todo: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)/gm,
    todoToken: /^[^\S\n]*(?!--|––|——)([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s/,
    todoBox: /^[^\S\n]*((?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s(?![^\n]*[^a-zA-Z0-9]@(?:done|cancelled)(?:(?:\([^)]*\))|(?![a-zA-Z])))[^\n]*)/gm,
    todoCancel: /^[^\S\n]*((?!--|––|——)(?:(?:(?:[✘xX]|\[-\])\s[^\n]*)|(?:(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*[^a-zA-Z0-9]@cancelled(?:(?:\([^)]*\))|(?![a-zA-Z]))[^\n]*)))/gm,
    todoDone: /^[^\S\n]*((?!--|––|——)(?:(?:(?:[✔✓☑+]|\[[xX+]\])\s[^\n]*)|(?:(?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ ?\])\s[^\n]*[^a-zA-Z0-9]@done(?:(?:\([^)]*\))|(?![a-zA-Z]))[^\n]*)))/gm,
    project: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)[^\S\n]*(.+:[^\S\n]*)(?:(?=@(?!.+ +[^@]))|$)/,
    projectParts: /(\s*)([^:]+):(.*)/,
    archive: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)([^\S\n]*Archive:.*$)/gm,
    comment: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)(?![^\S\n]*.+:[^\S\n]*(?:(?=@(?!.+ +[^@]))|$))[^\S\n]*([^\n]+)/gm,
    tag: /(?:^|[^a-zA-Z0-9`])(@[^\s*~(]+(?:\([^)]*\))?)/gm,
    tagSpecial: /(?=a)b/,
    tagSpecials: {},
    tagCreated: /(?:^|[^a-zA-Z0-9])@created(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
    tagStarted: /(?:^|[^a-zA-Z0-9])@started(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
    tagFinished: /(?:^|[^a-zA-Z0-9])@(?:done|cancelled)(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
    tagElapsed: /(?:^|[^a-zA-Z0-9])@(?:lasted|wasted)(?:(?:\(([^)]*)\))|(?![a-zA-Z]))/,
    tagEstimate: /(?:^|[^a-zA-Z0-9])@est\(([^)]*)\)|@(\d[^\)]+)/,
    code: /((?:```[\s\S]*?```)|(?:`[^`\n]*`))/gm,
    bold: /(?:^|\s)(\*.+\*)(?:\s|$)/gm,
    italic: /(?:^|\s)(_.+_)(?:\s|$)/gm,
    strikethrough: /(?:^|\s)(~.+~)(?:\s|$)/gm
  }
};

if ( Consts.tags.names.length ) {

  Consts.regexes.tagSpecial = new RegExp ( `(?:^|[^a-zA-Z0-9])(@(?:${Consts.tags.names.map ( n => _.escapeRegExp ( n ) ).join ( '|' )}))(?:(?:\\([^)]*\\))|(?![a-zA-Z]))`, 'gm' );

  Consts.tags.names.forEach ( name => {
    const re = new RegExp ( `(?:^|[^a-zA-Z0-9])(${_.escapeRegExp ( `@${name}` )})(?:(?:\\([^)]*\\))|(?![a-zA-Z]))`, 'gm' );
    Consts.regexes.tagSpecials[name] = re;
  });

}

const archiveName = Config.getKey ( 'archive.name' );

if ( archiveName ) {

  Consts.regexes.archive = new RegExp ( Consts.regexes.archive.source.replace ( 'Archive', _.escapeRegExp ( archiveName ) ), 'gm' );

}

/* EXPORT */

export default Consts;
