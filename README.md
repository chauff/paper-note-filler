# arXiv URL to Obsidian Note

Instead of manually copying and pasting paper title, abstract, etc. from [arxiv.org](https://arxiv.org/) into an Obsidian note, just copy the URL and the plugin extracts the important information automatically and creates a new Obsidian note. The location and naming of the note can be changed as desired.

## Warning

This plugin was created in one evening, it works but is naturally very brittle. Only created and tested for arxiv.org URLs in January 2023. Only tested on Desktop.

## TODOs

Expand this plugin beyond arXiv. [ACL Anthology](https://aclanthology.org/) and [neurIPS](https://papers.nips.cc/) are high on the list.

## Manually installing the plugin

1. Head to the vault folder (the following command assumes it is in the home directory in the `obsidian-vault` directory) and traverse into the plugin directory: `~/obsidian-vault/.obsidian/plugins/`.
2. Create a new directory called `paper-note-filler`.
3. Copy over `main.js`, `styles.css`, `manifest.json` to the just created directory.
4. Restart Obsidian.

_Ideally, this is it and the plugin is now installed._ A simple way to check this is to now open the settings tab of Obsidian. Everything worked if the `Paper Note Filling` plugin listed under Community Plugins. If not, check the `community-plugins.json` file in the `/plugins` folder and add the plugin name manually if necessary and then restart Obsidian one more time.

## Using the plugin

### Two settings

Open the settings tab of Obsidian. There should be the `Paper Note Filling` plugin listed under Community Plugins. There are two settings:

1. The folder in which to create all notes (any folder from inside the vault or the root folder itself).
2. The naming convention for each note (either using the arxiv ID or the title of the paper).

<img src="img/settings.png" width="400" alt="Obsidian settings tab">

### Creating a note

To create a note based on an arXiv URL, open the command palette, and find the `Create paper note from an arXiv.org URL.`

<img src="img/command-palette.png" width="400" alt="Obsidian command palette">

Clicking the command brings up a dialogue in which to paste the arXiv URL:

<img src="img/input.png" width="400" alt="Obsidian arXiv URL input">

Press <kbd>Enter</kbd> and a note with the paper title, authors, url, abstract, etc. should be created. If the file already exists, it will not be overwritten. The end result (here with the [Blue Topaz Obsidian theme](https://github.com/whyt-byte/Blue-Topaz_Obsidian-css)) looks something like this:

<img src="img/output.png" width="400" alt="Obsidian created paper note">

## Developing it further

Not hard as the plugin is straightforward and just a few hundred lines of code. Check out the instructions of the [Obsidian Sample Plugin repo](https://github.com/obsidianmd/obsidian-sample-plugin) to get started.
