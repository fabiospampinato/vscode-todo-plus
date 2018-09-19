# Todo+

<p style="text-align: center;">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-todo-plus/master/resources/logo/logo-128x128.png" alt="Logo" />
</p>

Manage todo lists with ease. Powerful, easy to use and customizable.


## Table of Contents

- [Quick Overview](#quick-overview)
  - [Example Todo File](#example-todo-file)
  - [Embedded Todos](#embedded-todos)
  - [Activity Bar Views](#activity-bar-views)
  - [Todos Statistics](#todos-statistics)
  - [Timekeeping & Timer](#timekeeping--timer)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Usage with the Command Palette](#usage-with-the-command-palette)
  - [Usage with keyboard shortcuts](#usage-with-keyboard-shortcuts)
- [Settings](#settings)
- [Embedded Todos Providers](#embedded-todos-providers)
- [Statistics Tokens](#statistics-tokens)
- [Hints](#hints)
- [Related](#related)
- [License](#license)


## Quick Overview

### Example Todo File
<details>

  [See source code of this file](resources/readme.todo)
  ![Example todo file](resources/demo/syntax.png)
</details>


### Embedded Todos
<details>

  ![Embedded](resources/demo/embedded.gif)
</details>


### Activity Bar Views
<details>

  ![Activity bar views](resources/demo/activity_bar_views.png)
</details>


### Todos Statistics
<details>
  <summary>Statistics in Status Bar</summary>

  ![Statistics](resources/demo/statistics.png)
</details>

<details>
  <summary>Statistics in TODO file</summary>

  ![Project Statistics](resources/demo/project_statistics.png)
</details>

<details>
  <summary>Statistics and progress in TODO file</summary>

  ![Project Statistics Advanced](resources/demo/project_statistics_adv.gif)
</details>


### Timekeeping & Timer
<details>

  ![Timekeeping & Timer](resources/demo/timer.gif)
</details>


## Features

- **Easy to use**: you're just a few shortcuts away from becoming a master
- **Portable**: being a plain text format you can read and edit it using any editor
- **Custom symbols**: you can replace the default symbols with any of the supported ones
  - **Box**: `-` `❍` `❑` `■` `⬜` `□` `☐` `▪` `▫` `–` `—` `≡` `→` `›` `[]` `[ ]`
  - **Done**: `✔` `✓` `☑` `+` `[x]` `[X]` `[+]`
  - **Cancelled**: `✘` `x` `X` `[-]`
- **Custom colors**: all colors can be customized
- **Custom special tags**: special tags' names and their colors can be customized
- **Archive**: you can move finished todos to a special "Archive" section with a shortcut
- **Formatting**: you can format text in a markdown-like fashion, we support: **bold**, _italic_, ~~strikethrough~~ and `code`
- **Go To Symbol**: you can easily move between projects by using the `Go to Symbol in File...` command
- **[TaskPaper](https://www.taskpaper.com) compatible**: just set `todo.symbols.box`, `todo.symbols.done` and `todo.symbols.cancelled` to `-`
- **Timekeeping**: you can mark todos as started and track elapsed time until completion
- **Timer**: a timer can be displayed in the statusbar for started todos
- **Time estimates**: you can estimate the time it will take to complete a todo by adding a tag to it that looks like this: `@est(3 hours)`, `@est(2h30m)` or `@2h30m`. Then you can use the `[est]` token in statistics
- **Statistics**: statistics about your entire file and/or project-level statistics about your individual projects
- **Embedded todos**: it's common to have `//TODO` or `//FIXME` comments in our code, this extension can find those as well
- **Activity bar views**: you can view your todo file and your embedded todos from a custom activity bar section


## Installation

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-todo-plus
```


## Usage

### Usage with the Command Palette
8 commands are available through the command palette:

```js
'Todo: Open'             // Open or create your project's todo file
'Todo: Open Embedded'    // Open embedded todos
'Todo: Toggle Box'       // Toggle todo's box symbol
'Todo: Toggle Done'      // Toggle todo's done symbol
'Todo: Toggle Cancelled' // Toggle todo's cancelled symbol
'Todo: Toggle Start'     // Toggle a todo as started
'Todo: Toggle Timer'     // Toggle the timer
'Todo: Archive'          // Archive finished todos
```


### Usage with keyboard shortcuts

When editing a `Todo` file, 5 commands shortcuts are available :

```js
'Cmd/Ctrl+Enter'   // Triggers `Todo: Toggle Box`
'Alt+D'            // Triggers `Todo: Toggle Done`
'Alt+C'            // Triggers `Todo: Toggle Cancelled`
'Alt+S'            // Triggers `Todo: Toggle Start`
'Cmd/Ctrl+Shift+A' // Triggers `Todo: Archive`
```


## Settings

You can customize each setting by duplicating it in your own User Settings File. (some will require a restart to be applied, like symbols, colors, providers...)

An actual regex will be generated from the value of the `todo.embedded.regex` setting. It uses 2 capturing groups, the first one captures the type of the todo (`TODO`, `FIXME` etc.) and the second one captures an optional description (`TODO: description`).

Dates are formatted using [Moment.js](https://momentjs.com/docs/#/displaying/format).

<details>
  <summary>See the full list of settings</summary>

  ```js
  {
    // Todo file name.
    // Other supported names are: `*.todo`, `*.todos`, `*.task`, `*.tasks`, `*.taskpaper` and `todolist.txt`
    "todo.file.name": "TODO",

    // New todo files default content
    "todo.file.defaultContent": "\nTodo:\n  ☐ Item\n",

    // Globs to use for including files
    "todo.file.include": ["**/TODO", ...],

    // Globs to use for excluding files
    "todo.file.exclude": ["**/.*/**", ...],

    // Start the tree in an expanded state
    "todo.file.view.expanded": true,

    // String used for indentation
    "todo.indentation": "  ",

    // Box symbol
    "todo.symbols.box": "☐",

    // Done symbol
    "todo.symbols.done": "✔",

    // Cancelled symbol
    "todo.symbols.cancelled": "✘",

    // Done todo color
    "todo.colors.done": "#a6e22e",

    // Cancelled todo color
    "todo.colors.cancelled": "#f92672",

    // Code color
    "todo.colors.code": "#fd971f",

    // Comment color
    "todo.colors.comment": "#75715e",

    // Project color
    "todo.colors.project": "#66d9ef",

    // Project statistics color
    "todo.colors.projectStatistics": "#4694a3",

    // Tag color
    "todo.colors.tag": "#e6db74",

    // Object mapping todo types to their color
    "todo.colors.types": { "TODO": "#ffcc00", "FIXME": "#cc0000" ... },

    // Special tags' names
    "todo.tags.names": ["critical", "high", "low", "today"],

    // Infer commonly used tags' names
    "todo.tags.namesInference": true,

    // Special tags' background colors
    "todo.tags.backgroundColors": ["#e54545", "#e59f45", "#e5d145", "#ae81ff"],

    // Special tags' foreground colors
    "todo.tags.foregroundColors": ["#000000", "#000000", "#000000", "#000000"],

    // Name of the special "Archive" section
    "todo.archive.name": "Archive",

    // Remove projects without todos
    "todo.archive.remove.emptyProjects": true,

    // Remove extra empty lines,
    // keeping no more than `emptyLinesThreshold` consecutive empty lines
    "todo.archive.remove.emptyLines": 1,

    // Enable the @project tag
    "todo.archive.project.enabled": true,

    // String used for joining multiple projects
    "todo.archive.project.separator": ".",

    // Enable markdown-like formatting
    "todo.formatting.enabled": true,

    // Enable the @created tag
    "todo.timekeeping.created.enabled": false,

    // Insert the time inside the @created tag
    "todo.timekeeping.created.time": true,

    // Format used for displaying time inside @created
    "todo.timekeeping.created.format": "YY-MM-DD HH:mm",

    // Insert the time inside the @started tag
    "todo.timekeeping.started.time": true,

    // Format used for displaying time inside @started
    "todo.timekeeping.started.format": "YY-MM-DD HH:mm",

    // Enable the @done/cancelled tag.
    // Always enabled if you explicitly start a todo or if you use only 1 symbol
    "todo.timekeeping.finished.enabled": true,

    // Insert the time inside the @done/cancelled tag
    "todo.timekeeping.finished.time": true,

    // Format used for displaying time inside @done/cancelled
    "todo.timekeeping.finished.format": "YY-MM-DD HH:mm",

    // Enable the @lasted/wasted tag
    "todo.timekeeping.elapsed.enabled": true,

    // Format used for displaying time diff inside @lasted/waster
    "todo.timekeeping.elapsed.format": "short-compact",

    // Format used for the `[est]` token
    "todo.timekeeping.estimate.format": "short-compact",

    // Show a timer for started todos in the statusbar
    "todo.timer.statusbar.enabled": true,

    // Should the item be placed to the left or right?
    "todo.timer.statusbar.alignment": "left",

    // The foreground color for this item
    "todo.timer.statusbar.color": "",

    // The priority of this item.
    // Higher value means the item should be shown more to the left
    "todo.timer.statusbar.priority": -10,

    // Show statistics next to a project, boolean or JS expression
    "todo.statistics.project.enabled": "global.projects < 100 && project.pending > 0",

    // Template used for rendering the text
    "todo.statistics.project.text": "([pending]) [est]",

    // Show statistics in the statusbar, boolean or JS expression
    "todo.statistics.statusbar.enabled": "global.all > 0",

    // Ignore the archive when rendering statistics in the statusbar
    "todo.statistics.statusbar.ignoreArchive": true,

    // Should the item be placed to the left or right?
    "todo.statistics.statusbar.alignment": "left",

    // The foreground color for this item
    "todo.statistics.statusbar.color": "",

    // Command to execute on click
    "todo.statistics.statusbar.command": "",

    // The priority of this item.
    // Higher value means the item should be shown more to the left
    "todo.statistics.statusbar.priority": -1,

    // Template used for rendering the text
    "todo.statistics.statusbar.text": "$(check) [finished]/[all] ([percentage]%)",

    // Template used for rendering the tooltip
    "todo.statistics.statusbar.tooltip": "[pending] Pending - [done] Done - [cancelled] Cancelled",

    // Regex used for finding embedded todos, requires double escaping
    "todo.embedded.regex": "(?:<!-- *)?(?:#|//|/\\*+|<!--|--) *(TODO|FIXME|FIX|BUG|UGLY|HACK|NOTE|IDEA|REVIEW|DEBUG|OPTIMIZE)(?:\\([^)]+\\))?:?(?!\\w)(?: *-->| *\\*/|(?= *(?:[^:]//|/\\*+|<!--|@|--))|((?: +[^\\n@]*?)(?= *(?:[^:]//|/\\*+|<!--|@|--(?!>)))|(?: +[^@\\n]+)?))",

    // Regex flags to use
    "todo.embedded.regexFlags": "gi",

    // Globs to use for including files
    "todo.embedded.include": ["**/*"],

    // Globs to use for excluding files
    "todo.embedded.exclude": ["**/.*", "**/.*/**", ...],

    // The provider to use when searching for embedded todos
    "todo.embedded.provider": "",

    // Regex used by ag, requires double escaping
    "todo.embedded.providers.ag.regex": "(?:#|//|/\\*+|<!--|--) *(TODO|FIXME|FIX|BUG|UGLY|HACK|NOTE|IDEA|REVIEW|DEBUG|OPTIMIZE)",

    // Extra arguments to pass to ag
    "todo.embedded.providers.ag.args": ['--ignore-case'],

    // Regex used by rg, requires double escaping
    "todo.embedded.providers.rg.regex": "(?:#|//|/\\*+|<!--|--) *(TODO|FIXME|FIX|BUG|UGLY|HACK|NOTE|IDEA|REVIEW|DEBUG|OPTIMIZE)",

    // Extra arguments to pass to rg
    "todo.embedded.providers.rg.args": ['--ignore-case'],

    // Show the whole line
    "todo.embedded.file.wholeLine": true,

    // Group embedded todos by workspace root
    "todo.embedded.file.groupByRoot": true,

    // Group embedded todos by type
    "todo.embedded.file.groupByType": true,

    // Group embedded todos by file
    "todo.embedded.file.groupByFile": true,

    // Show the whole line
    "todo.embedded.view.wholeLine": false,

    // Group embedded todos by workspace root
    "todo.embedded.view.groupByRoot": true,

    // Group embedded todos by type
    "todo.embedded.view.groupByType": true,

    // Group embedded todos by file
    "todo.embedded.view.groupByFile": true,

    // Start the tree in an expanded state
    "todo.embedded.view.expanded": true,

    // Show icons next to todos and types"
    "todo.embedded.view.icons": true,
  }
  ```
</details>


## Embedded Todos Providers

This extension supports various providers for searching for embedded todos, it'll use the one you set via the `todo.embedded.provider` setting or the first one available between:

1. **[ag / The Silver Searcher](https://github.com/ggreer/the_silver_searcher)**: About 50x faster than the `javascript` provider, it'll use the regex defined under `todo.embedded.providers.ag.regex`. It must be installed in your system.
2. **[rg / ripgrep](https://github.com/BurntSushi/ripgrep)**: About 50x faster than the `javascript` provider, it'll use the regex defined under `todo.embedded.providers.rg.regex`. It doesn't support lookaheads and lookbehinds. It must be installed in your system, or Visual Studio Code must include it.
3. **javascript**: Works on every system, but it's quite slow. This is the fallback provider.

`ag` and `rg` will use their specific regexes for finding the lines containing embedded todos, then those lines will be searched in using the regex defined under `todo.embedded.regex`.


## Statistics Tokens

The following tokens can be used in `todo.statistics.project.text`, `todo.statistics.statusbar.text` and `todo.statistics.statusbar.tooltip`, they will be replaced with the value they represent.

| Token          | Value                        |
|----------------|------------------------------|
| `[comments]`   | Number of comments           |
| `[projects]`   | Number of projects           |
| `[tags]`       | Number of tags               |
| `[pending]`    | Number of pending todos      |
| `[done]`       | Number of done todos         |
| `[cancelled]`  | Number of cancelled todos    |
| `[finished]`   | Number of finished todos     |
| `[all]`        | Number of todos              |
| `[percentage]` | Percentage of finished todos |
| `[est]`        | Estimated time               |


## Hints

- **Activity Bar**: you can switch the focus to the `Todo` activity bar view by assigning a shortcut to the `workbench.view.extension.todo` command.

- **Icons**: icons can be used in `todo.statistics.statusbar.text`. [Here](https://octicons.github.com/) you can browse a list of supported icons. If for instance you click the first icon, you'll get a page with `.octicon-alert` written in it, to get the string to use simply remove the `.octicon-` part, so in this case the icon name would be `alert`.

- **CLI**: you can view your embedded todos from the command line with the `todo` command if you install [ag](https://github.com/ggreer/the_silver_searcher) and add the following to your shell configuration file:

```bash
alias todo="ag --color-line-number '1;36' --color-path '1;36' --ignore-case --print-long-lines --silent '(?:<!-- *)?(?:#|//|/\*+|<!--|--) *(TODO|FIXME|FIX|BUG|UGLY|HACK|NOTE|IDEA|REVIEW|DEBUG|OPTIMIZE)(?:\([^(]+\))?:?(?!\w)(?: *-->| *\*/|(?= *(?:[^:]//|/\*+|<!--|@|--))|((?: +[^\n@]*?)(?= *(?:[^:]//|/\*+|<!--|@|--))|(?: +[^@\n]+)?))'"
```


## Related

- **[Highlight](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-highlight)**: I recommend using this extension for highlighting your embedded todos.

- **[Projects+ Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus-todo-plus)**: Bird's-eye view over your projects, view all your todo files aggregated into one.

- **[Noty](https://github.com/fabiospampinato/noty)**: Autosaving sticky note with support for multiple notes, find/replace, programmers shortcuts and more. It implements a subset of the functionalities provided by this extension.


## License

MIT © Fabio Spampinato