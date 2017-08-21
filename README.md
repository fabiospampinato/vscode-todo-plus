# VSC Todo+

<p align="center">
	<img src="https://raw.githubusercontent.com/fabiospampinato/vscode-todo-plus/master/resources/logo-128x128.png" alt="Logo">
</p>

Manage todo lists with ease. Powerful, easy to use and customizable.

## Features

- **Easy to use**: you're just a couple of shortcuts away from becoming a master
- **Portable**: being a plain text format you can read and edit it using any editor
- **Custom symbols**: you can replace the default symbols with any of the supported ones
  - **Box**: - ❍ ❑ ■ □ ☐ ▪ ▫ – — ≡ → › [ ]
  - **Done**: ✔ ✓ ☑ + [x] [+]
  - **Cancel**: ✘ x [-]
- **Custom colors**: all colors can be customized
- **Custom special tags**: special tags' names and colors can be customized

## Install

Run the following in the command palette:

```shell
ext install vscode-todo-plus
```

## Usage

It adds 1 command to the command palette:

```js
Todo: Open // Open or create your project's todo file
```

It adds 3 shortcuts when editing a Todo file:

```js
Cmd/Ctrl+Enter // Toggle todo's box symbol
Alt+D // Toggle todo's done symbol
Alt+C // Toggle todo's cancel symbol
```

## Settings

```js
{
  "todo.file": "TODO", // Todo file name
  "todo.defaultContent": "\nTodo:\n  ☐ Item\n", // New todo files default content
  "todo.symbols.box": "☐", // Todo box string
  "todo.symbols.done": "✔", // Todo done string
  "todo.symbols.cancel": "✘", // Todo cancel string
  "todo.colors.cancel": "#f92672", // Cancelled todo color
  "todo.colors.done": "#a6e22e", // Done todo color
  "todo.colors.comment": "#75715e", // Comment color
  "todo.colors.project": "#66d9ef", // Project color
  "todo.colors.tag": "#e6db74", // Tag color
  "todo.tags.names": ["critical", "high", "low", "today"], // Special tags' names
  "todo.tags.backgroundColors": ["#e54545", "#e59f45", "#e5d145", "#ae81ff"], // Special tags' background colors
  "todo.tags.foregroundColors": ["#000000", "#000000", "#000000", "#000000"] // Special tags' foreground colors
}
```

## Demo

![Demo](resources/demo.png)

## Related:

- **[Projects+ Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus-todo-plus)**: Bird's-eye view over your projects, view all your todo files aggregated into one.

- **[Noty](https://github.com/fabiospampinato/noty)**: Autosaving sticky note with support for multiple notes, find/replace, programmers shortcuts and more. It implements a subset of the functionalities provided by this extension.

## License

MIT © Fabio Spampinato
