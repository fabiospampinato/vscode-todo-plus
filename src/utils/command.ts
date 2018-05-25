
/* IMPORT */

import * as vscode from 'vscode';

/* COMMAND */

const Command = {

  proxiesHashes: [], // Array of hashes (`${command}${arguments}`) of proxy commands

  get ( command, args ) {

    if ( !args ) return command;

    const hash = `${command}${JSON.stringify ( args )}`,
          exists = !!Command.proxiesHashes.find ( h => h === hash );

    if ( exists ) return hash;

    vscode.commands.registerCommand ( hash, () => {
      vscode.commands.executeCommand ( command, ...args );
    });

    Command.proxiesHashes.push ( hash );

    return hash;

  }

};

/* EXPORT */

export default Command;
