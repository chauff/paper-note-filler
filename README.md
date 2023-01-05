# arXiv URL to Obsidian Note

<img align="right" width="250" height="250" src="img/logo.jpeg" alt="Logo">

This plugin solves a single annoyance for me when it comes to taking notes about ML/NLP/IR papers - 95% of which happen to be available on [arxiv.org](https://arxiv.org/): the constant copy and paste to fill in a note template (author, title, etc.).

So, instead of manually creating one [Obsidian](https://obsidian.md/) note per paper for a [zettelkasten](https://beingpax.medium.com/zettelkasten-method-with-obsidian-how-to-take-smart-notes-with-examples-cdaf348febbd), simply provide the URL and the plugin extracts the important information and creates a new note automatically.

> **Note**
> This plugin was created in one evening, it works but is naturally very brittle. Only created and tested for arxiv.org URLs in January 2023. Only tested on Desktop.

## TODOs

Expand this plugin beyond arXiv. [ACL Anthology](https://aclanthology.org/) and [neurIPS](https://papers.nips.cc/) are next.

## Installing the plugin manually

> **Note**
> The plugin is not available via the Obsidian Hub as it takes quite a long time to get through the PR queue and the review process. This plugin is so niche and simple that it is not really worth it. So, manual installation it is.

1. Head to the vault folder (the following command assumes it is in the home directory in the `obsidian-vault` directory) and traverse into the plugin directory: `~/obsidian-vault/.obsidian/plugins/`.
2. Create a new directory called `paper-note-filler`.
3. Copy `main.js`, `styles.css`, `manifest.json` [from the latest release](https://github.com/chauff/paper-note-filler/releases/latest) to the just created directory. _This is all, the remaining files are not necessary._
4. Restart Obsidian.

_Ideally, this is it and the plugin is now installed._ A simple way to check this is to now open the settings tab of Obsidian. Everything worked if the `Paper Note Filling` plugin listed under Community Plugins. If not, check the `community-plugins.json` file in the `/plugins` folder and add the plugin name manually if necessary and then restart Obsidian one more time.

## Using the plugin

### Two settings

Open the settings tab of Obsidian. There should be the `Paper Note Filling` plugin listed under Community Plugins. There are two settings:

1. The folder in which to create all notes (any folder from inside the vault or the root folder itself).
2. The naming convention for each note (either using the arxiv ID or the title of the paper).

<img src="img/settings.png" width="600" alt="Obsidian settings tab">

### Creating a note

To create a note based on an arXiv URL, open the command palette, and find the `Create paper note from an arXiv.org URL.`

<img src="img/command-palette.png" width="600" alt="Obsidian command palette">

Clicking the command brings up a dialogue in which to paste the arXiv URL:

<img src="img/input.png" width="600" alt="Obsidian arXiv URL input">

Press <kbd>Enter</kbd> and a note with the paper title, authors, url, abstract, etc. should be created. If the file already exists, it will not be overwritten. The end result (here with the [Blue Topaz Obsidian theme](https://github.com/whyt-byte/Blue-Topaz_Obsidian-css)) looks something like this:

<img src="img/output.png" width="600" alt="Obsidian created paper note">

## Developing it further

Not hard as the plugin is straightforward and just a few hundred lines of code. Check out the instructions of the [Obsidian Sample Plugin repo](https://github.com/obsidianmd/obsidian-sample-plugin) to get started.
