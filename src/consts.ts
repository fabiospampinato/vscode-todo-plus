
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
    impossible: /(?=a)b/,
    todo: /^[^\S\n]*((?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]\])[^\n]*)/,
    todoToken: /^[^\S\n]*([-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]\])/,
    todoBox: /^[^\S\n]*((?:[-❍❑■⬜□☐▪▫–—≡→›]|\[ \])[^\n]*)/,
    todoCancel: /^[^\S\n]*((?:[✘xX]|\[-\])[^\n]*)/,
    todoDone: /^[^\S\n]*((?:[✔✓☑+]|\[[xX+]\])[^\n]*)/,
    project: /^(?![^\S\n]*(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]\])[^\n]*)[^\S\n]*(.+:[^\S\n]*)(?:(?=@)|$)/,
    comment: /^(?![^\S\n]*(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]\])[^\n]*)(?![^\S\n]*.+:[^\S\n]*(?:(?=@)|$))[^\S\n]*([^\n]+)/,
    tag: /(@[^\s*~_]+)/,
    tagSpecial: /(?=a)b/,
    bold: /(\*.+\*)/,
    italic: /(_.+_)/,
    strikethrough: /(~.+~)/
  }
};

if ( Consts.tags.names.length ) {

  Consts.regexes.tagSpecial = new RegExp ( `(@(?:${Consts.tags.names.map ( n => _.escapeRegExp ( n ) ).join ( '|' )}))(?![a-zA-Z])` );

}

/* EXPORT */

export default Consts;
