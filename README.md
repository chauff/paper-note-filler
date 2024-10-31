# Academic paper URL to Obsidian Note

<img align="right" width="250" height="250" src="img/logo.jpeg" alt="Logo">

This plugin solves a single annoyance for me when it comes to taking notes about ML/NLP/IR papers - 90% of which happen to be available on [arxiv.org](https://arxiv.org/): the constant copy and paste to fill in a note template (author, title, etc.).

Instead of manually creating one [Obsidian](https://obsidian.md/) note per paper for a [zettelkasten](https://beingpax.medium.com/zettelkasten-method-with-obsidian-how-to-take-smart-notes-with-examples-cdaf348febbd), simply provide the URL and the plugin extracts the important information and creates a new note automatically.

This (mostly) works for paper URLs from three domains:

- arxiv.org, e.g. https://arxiv.org/abs/2111.13057 
- aclanthology, e.g. https://aclanthology.org/2022.acl-long.3/
- semantischolar, e.g. https://www.semanticscholar.org/paper/Feature-Engineering-for-Second-Language-Acquisition-Chen-Hauff/75033c495638dcb2fb8ebc6211e5e5e0e8b93ea6

If it is an arxiv paper, the ArXiv API is queried. The ACL Anthology isn't as simple to query, and since Semantic Scholar has most of the data ingested, the [Semantic Scholar API](https://www.semanticscholar.org/product/api) is queried with the respective aclanthology/semanticscholar identifier. 

_Why querying ArXiv separately? Although Semantic Scholar also ingests papers posted on ArXiv I have found the ingested data to be more noisy (especially when it comes to the abstract) than ArXiv's version._

> **Note**
> This plugin was created in two evenings, it works but is brittle. Only tested on Desktop.

## Installing the plugin manually

> **Note**
> The plugin is not available via the Obsidian Hub as it takes quite a long time to get through the PR queue and the review process. This plugin is so niche and simple that it is not really worth it. So, manual installation it is.

1. Locate your vault folder and note down the path. You can find the folder name at the bottom left of your Obsidian window. If you click on the name, and then `Manage vaults` you see the full path to the vault folder.

2. Open the terminal and `cd` into the `.plugin` directory inside your vault folder. For example, if your vault folder is inside your home directory and is called `my-obsidian-notes`, you do:

    ```bash
    cd ~/my-obsidian-notes/.obsidian/plugins/
    ```

3. Create a new directory called `paper-note-filler` inside the `plugins` directory and `cd` into it:

    ```bash
    mkdir paper-note-filler
    cd paper-note-filler
    ```

4. Download `main.js`, `styles.css`, `manifest.json` [from the latest release](https://github.com/chauff/paper-note-filler/releases/latest) (not the cloned github repo!) to the just created directory.

    ```bash
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.1/main.js
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.1/styles.css
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.1/manifest.json
    ``` 

    Check with `ls -al` if the three files are now appearing in the `paper-note-filler` folder. Make sure they are not empty (`more manifest.json` should show a few lines of JSON). 
    
    If the files are empty (GitHub downloads are not always straightforward with `curl`), use the browser, head to [the release page](https://github.com/chauff/paper-note-filler/releases/latest), download those three files via the browser and then move them into the `paper-note-filler` directory. 

5. Restart Obsidian.

_Ideally, this is it and the plugin is now installed._ A simple way to check this is to now open the settings tab of Obsidian. Everything worked if the `Paper Note Filling` plugin listed under Community Plugins. If not, check the `community-plugins.json` file in the `/plugins` folder and add the plugin name manually if necessary and then restart Obsidian one more time.

## Using the plugin

### Two settings

Open the settings tab of Obsidian. There should be the `Paper Note Filling` plugin listed under Community Plugins. There are two settings:

1. The folder in which to create all notes (any folder from inside the vault or the root folder itself).
2. The naming convention for each note (either using the respective identifier or the title of the paper).

<img src="img/settings.png" width="600" alt="Obsidian settings tab">

### Creating a note

To create a note, open the command palette, and find the `Paper Note Filling:Create paper note from URL.`

<img src="img/command-palette.png" width="600" alt="Obsidian command palette">

Clicking the command brings up a dialogue in which to paste the URL:

<img src="img/input.png" width="600" alt="Obsidian URL input">

Press <kbd>Enter</kbd> and a note with the paper title, authors, url, abstract, etc. should be created. If the file already exists, it will not be overwritten. The end result (here with the [Blue Topaz Obsidian theme](https://github.com/whyt-byte/Blue-Topaz_Obsidian-css)) looks something like this:

<img src="img/output.png" width="600" alt="Obsidian created paper note">

## Developing it further

Not hard as the plugin is straightforward and just a few hundred lines of code. Check out the instructions of the [Obsidian Sample Plugin repo](https://github.com/obsidianmd/obsidian-sample-plugin) to get started.
