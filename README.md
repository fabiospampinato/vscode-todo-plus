# Todo+

<p align="center">
	<img src="https://raw.githubusercontent.com/fabiospampinato/vscode-todo-plus/master/resources/logo/logo-128x128.png" alt="Logo">
</p>

Manage todo lists with ease. Powerful, easy to use and customizable.

## Features

- **Easy to use**: you're just a few shortcuts away from becoming a master
- **Portable**: being a plain text format you can read and edit it using any editor
- **Custom symbols**: you can replace the default symbols with any of the supported ones
  - **Box**: `-` `❍` `❑` `■` `⬜` `□` `☐` `▪` `▫` `–` `—` `≡` `→` `›` `[]` `[ ]`
  - **Done**: `✔` `✓` `☑` `+` `[x]` `[X]` `[+]`
  - **Cancel**: `✘` `x` `X` `[-]`
- **Custom colors**: all colors can be customized
- **Custom special tags**: special tags' names and their colors can be customized
- **Code blocks**: you can define inline code blocks by wrapping them in backticks (`)
- **Archive**: you can move finished todos to a special "Archive" section with a shortcut
- **Timekeeping**: you can mark todos as started and track elapsed time until completion
- **Time estimates**: you can estimate the time it will take to complete a todo by adding a tag to it that looks like this: `@est(3 hours)`, `@est(2h30m)` or `@2h30m`. Then you can use the `[est]` token in statistics
- **Statistics**: some statistics about your file and/or about your individual projects
- **Go To Symbol**: you can easily move between projects by using the `Go to Symbol in File...` command
- **Embedded todos**: it's common to have `//TODO` or `//FIXME` comments to your code, this extension can detect those as well
- **TaskPaper compatible**: just set `todo.symbols.box`, `todo.symbols.done` and `todo.symbols.cancel` to `-`

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-todo-plus
```

## Usage

It adds 7 commands to the command palette:

```js
'Todo: Open' // Open or create your project's todo file
'Todo: Open Embedded' // Open embedded todos
'Todo: Start' // Mark a todo as started
'Todo: Toggle Box' // Toggle todo's box symbol
'Todo: Toggle Cancel' // Toggle todo's done symbol
'Todo: Toggle Done' // Toggle todo's cancel symbol
'Todo: Archive' // Archive finished todos
```

It adds 5 shortcuts when editing a `Todo` file:

```js

'Cmd/Ctrl+Shift+A' // Triggers  `Todo: Archive`
'Cmd/Ctrl+Enter' // Triggers `Todo: Toggle Box`
'Alt+D' // Triggers `Todo: Toggle Done`
'Alt+C' // Triggers `Todo: Toggle Cancel`
'Alt+S' // Triggers `Todo: Start`
```

## Settings

```js
{
  "todo.file": "TODO", // Todo file name. Other supported names are: `*.todo`, `*.todos`, `*.task`, `*.tasks`, `*.taskpaper` and `todolist.txt`
  "todo.defaultContent": "\nTodo:\n  ☐ Item\n", // New todo files default content
  "todo.indentation": "  ", // String used for indentation
  "todo.symbols.box": "☐", // Box symbol
  "todo.symbols.done": "✔", // Done symbol
  "todo.symbols.cancel": "✘", // Cancel symbol
  "todo.colors.cancel": "#f92672", // Cancelled todo color
  "todo.colors.done": "#a6e22e", // Done todo color
  "todo.colors.code": "#fd971f", // Code color
  "todo.colors.comment": "#75715e", // Comment color
  "todo.colors.project": "#66d9ef", // Project color
  "todo.colors.projectStatistics": "#4694a3", // Project statistics color
  "todo.colors.tag": "#e6db74", // Tag color
  "todo.tags.names": ["critical", "high", "low", "today"], // Special tags' names
  "todo.tags.backgroundColors": ["#e54545", "#e59f45", "#e5d145", "#ae81ff"], // Special tags' background colors
  "todo.tags.foregroundColors": ["#000000", "#000000", "#000000", "#000000"], // Special tags' foreground colors
  "todo.formatting.enabled": true, // Enable markdown-like formatting
  "todo.timekeeping.created.enabled": false, // Enable the @created tag
  "todo.timekeeping.created.time": true, // Insert the time inside the @created tag
  "todo.timekeeping.created.format": "YY-MM-DD HH:mm", // Format used for displaying time inside @created
  "todo.timekeeping.started.time": true, // Insert the time inside the @started tag
  "todo.timekeeping.started.format": "YY-MM-DD HH:mm", // Format used for displaying time inside @started
  "todo.timekeeping.finished.enabled": true, // Enable the @done/cancelled tag. It's always enabled if you explicitly start a todo or if you use only 1 symbol
  "todo.timekeeping.finished.time": true, // Insert the time inside the @done/cancelled tag
  "todo.timekeeping.finished.format": "YY-MM-DD HH:mm", // Format used for displaying time inside @done/cancelled
  "todo.timekeeping.elapsed.enabled": true, // Enable the @lasted/wasted tag
  "todo.timekeeping.elapsed.format": "short-compact", // Format used for displaying time diff inside @lasted/waster
  "todo.timekeeping.estimate.format": "short-compact", // Format used for the `[est]` token
  "todo.archive.name": "Archive", // Name of the special "Archive" section
  "todo.archive.remove.emptyProjects": true, // Remove projects without todos
  "todo.archive.remove.emptyLines": 1, // Remove extra empty lines, keeping no more than `emptyLinesThreshold` consecutive empty lines
  "todo.archive.project.enabled": true, // Enable the @project tag
  "todo.archive.project.separator": ".", // String used for joining multiple projects
  "todo.embedded.regex": "(?:<!-- *)?(?:#|//|/\\*+|<!--) *(TODO|FIXME|FIX|BUG|UGLY|HACK|NOTE|IDEA|REVIEW|DEBUG|OPTIMIZE)(?: |:|\"|'|`|-->|$)", // Regex used for finding embedded todos, requires double escaping
  "todo.embedded.include": ["**/*"], // Globs to use for including files
  "todo.embedded.exclude": ["**/.git", ...], // Globs to use for excluding files
  "todo.embedded.groupByFile": false, // Group todos by file
  "todo.statistics.ignoreArchive": true, // Ignore the archive when rendering statistics
  "todo.statistics.project.enabled": "pending > 0", // Show statistics next to a project, boolean or JS expression
  "todo.statistics.project.text": "([pending]) [est]", // Template used for rendering the text
  "todo.statistics.statusbar.enabled": "all > 0", // Show statistics in the statusbar, boolean or JS expression
  "todo.statistics.statusbar.alignment": "left", // Should the item be placed to the left or right?
  "todo.statistics.statusbar.color": "", // The foreground color for this item
  "todo.statistics.statusbar.command": "", // Command to execute on click
  "todo.statistics.statusbar.priority": -1, // The priority of this item. Higher value means the item should be shown more to the left
  "todo.statistics.statusbar.text": "$(check) [finished]/[all] ([percentage]%)", // Template used for rendering the text
  "todo.statistics.statusbar.tooltip": "[pending] Pending - [done] Done - [cancelled] Cancelled" // Template used for rendering the tooltip
}
```

Changing some settings (symbols, colors, tags) requires a restart.

Dates are formatted using [moment](https://momentjs.com/docs/#/displaying/format), and are parsed using [sugar](https://sugarjs.com) and [to-time](https://www.npmjs.com/package/to-time).

## Statistics Tokens

The following tokens can be used in `todo.statistics.project.text`, `todo.statistics.statusbar.text` and `todo.statistics.statusbar.tooltip`, they will be replaced with the value they represent.

| Token          | Value                        |
|----------------|------------------------------|
| `[pending]`    | Number of pending todos      |
| `[done]`       | Number of done todos         |
| `[cancelled]`  | Number of cancelled todos    |
| `[finished]`   | Number of finished todos     |
| `[all]`        | Number of todos              |
| `[percentage]` | Percentage of finished todos |
| `[est]`        | Estimated time               |

## Demo

### [Example todo file](https://github.com/fabiospampinato/vscode-todo-plus/blob/master/resources/readme.todo)

![Syntax](resources/demo/syntax.png)

### Embedded todos

![Embedded](resources/demo/embedded.gif)

### Statistics

![Statistics](resources/demo/statistics.png)

![Project Statistics](resources/demo/project_statistics.png)

![Project Statistics Advanced](resources/demo/project_statistics_adv.gif)

## Hints:

- **Icons**: icons can be used in `todo.statistics.statusbar.text`. [Here](https://octicons.github.com/) you can browse a list of supported icons. If for instance you click the first icon, you'll get a page with `.octicon-alert` written in it, to get the string to use simply remove the `.octicon-` part, so in this case the icon name would be `alert`.

## Related:

- **[Highlight](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-highlight)**: I recommend using this extension for highlighting your embedded todos.

- **[Projects+ Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus-todo-plus)**: Bird's-eye view over your projects, view all your todo files aggregated into one.

- **[Noty](https://github.com/fabiospampinato/noty)**: Autosaving sticky note with support for multiple notes, find/replace, programmers shortcuts and more. It implements a subset of the functionalities provided by this extension.

## License

MIT © Fabio Spampinato
