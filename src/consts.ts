
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
    comment: Config.getKey ( 'colors.comment' ),
    project: Config.getKey ( 'colors.project' ),
    tag: Config.getKey ( 'colors.tag' )
  },
  tags: {
    names: Config.getKey ( 'tags.names' ),
    backgroundColors: Config.getKey ( 'tags.backgroundColors' ),
    foregroundColors: Config.getKey ( 'tags.foregroundColors' )
  },
  regexes: {
    indent: /^\s*\w+.+:\s*$/,
    outdent: /^\uffff$/,
    todo: /^[^\S\n]*((?:[-❍❑■□☐▪▫–—≡→›✘x✔✓☑+]|\[[ x+-]\])[^\n@]*)/,
    todoToken: /^[^\S\n]*([-❍❑■□☐▪▫–—≡→›✘x✔✓☑+]|\[[ x+-]\])/,
    todoBox: /^[^\S\n]*((?:[-❍❑■□☐▪▫–—≡→›]|\[ \])[^\n@]*)/,
    todoCancel: /^[^\S\n]*((?:[✘x]|\[-\])[^\n@]*)/,
    todoDone: /^[^\S\n]*((?:[✔✓☑+]|\[[x+]\])[^\n@]*)/,
    project: /^(?![^\S\n]*(?:[-❍❑■□☐▪▫–—≡→›✘x✔✓☑+]|\[[ x+-]\])[^\n@]*)[^\S\n]*(.+:[^\S\n]*)(?:(?=@)|$)/,
    comment: /^(?![^\S\n]*(?:[-❍❑■□☐▪▫–—≡→›✘x✔✓☑+]|\[[ x+-]\])[^\n@]*)(?![^\S\n]*.+:[^\S\n]*(?:(?=@)|$))[^\S\n]*([^\n@]+)/,
    tag: /(@\S+)/,
    bold: /(\*.+\*)/,
    italic: /(_.+_)/,
    strikethrough: /(~.+~)/
  }
};

if ( Consts.tags.names.length ) {

  Consts.regexes.tag = new RegExp ( `(@(?!${ Consts.tags.names.map ( n => _.escapeRegExp ( n ) ).join ( '|' )})\\S+)` );

}

/* EXPORT */

export default Consts;
