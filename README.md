# arXiv URL to Obsidian Note

Instead of manually copying and pasting paper title, abstract, etc. from arxiv.org into an Obsidian note, just copy the URL and the plugin extracts the important information automatically and creates a new Obsidian note.

## Warning

This plugin was created in one evening, it works but is brittle. Only created and tested for arxiv.org URLs. Only tested on Desktop.

## Manually installing the plugin

1. Head to your vault folder and traverse into the plugin directory: `~obsidian-vault/.obsidian/plugins/`.
2. Create a new directory called `paper-note-filler`.
3. Copy over `main.js`, `styles.css`, `manifest.json` to the just created directory.
4. Restart Obsidian.

## Using the plugin

1. Open the settings tab of Obsidian. You should see the `Paper Note Filling Plugin` listed under Community Plugins. There are two settings to consider: the folder in which to create the notes and the naming convention for each note.
2. Now whenever you want to create a note based on an arXiv URL, open the command palette, find the `Create paper note from an arXiv.org URL.` and then paste the arXiv URL into the input field. Press <kbd>Enter</kbd> and a note with the paper title, authors, url, abstract, etc. should be created. If the file already exists, it will not be overwritten.

## Develop it further yourself

Check out the instructions of the [Obsidian Sample Plugin repo](https://github.com/obsidianmd/obsidian-sample-plugin).
