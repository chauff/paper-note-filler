# Academic paper URL to Obsidian Note

<img align="right" width="250" height="250" src="img/logo.jpeg" alt="Logo">

This plugin solves a single annoyance for me when it comes to taking notes about ML/NLP/IR papers - 90% of which happen to be available on [arxiv.org](https://arxiv.org/): the constant copy and paste to fill in a note template (author, title, etc.).

Instead of manually creating one [Obsidian](https://obsidian.md/) note per paper for a [zettelkasten](https://beingpax.medium.com/zettelkasten-method-with-obsidian-how-to-take-smart-notes-with-examples-cdaf348febbd), simply provide the URL and the plugin extracts the important information and creates a new note automatically. 

*Update 10/204*: Basic OpenAI integration is available (but not required to be used) to generate tags and extract future work directions for (some) arXiv papers.

This (mostly) works for paper URLs from three domains:

- arxiv.org, e.g. https://arxiv.org/abs/2111.13057 
- aclanthology, e.g. https://aclanthology.org/2022.acl-long.3/
- semantischolar, e.g. https://www.semanticscholar.org/paper/Feature-Engineering-for-Second-Language-Acquisition-Chen-Hauff/75033c495638dcb2fb8ebc6211e5e5e0e8b93ea6

If it is an arXiv paper, the arXiv API is queried. The ACL Anthology isn't as simple to query, and since Semantic Scholar has most of the data ingested, the [Semantic Scholar API](https://www.semanticscholar.org/product/api) is queried with the respective aclanthology/semanticscholar identifier. 

_Why querying arXiv separately? Although Semantic Scholar also ingests papers posted on arXiv I have found the ingested data to be more noisy (especially when it comes to the abstract) than arXiv's version._

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
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.5/main.js
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.5/styles.css
    curl -LO https://github.com/chauff/paper-note-filler/releases/download/1.0.5/manifest.json
    ``` 

    Check with `ls -al` if the three files are now appearing in the `paper-note-filler` folder. Make sure they are not empty (`more manifest.json` should show a few lines of JSON). 
    
    If the files are empty (GitHub downloads are not always straightforward with `curl`), use the browser, head to [the release page](https://github.com/chauff/paper-note-filler/releases/latest), download those three files via the browser and then move them into the `paper-note-filler` directory. 

5. Restart Obsidian.

_Ideally, this is it and the plugin is now installed._ A simple way to check this is to now open the settings tab of Obsidian. Everything worked if the `Paper Note Filling` plugin listed under Community Plugins. If not, check the `community-plugins.json` file in the `/plugins` folder and add the plugin name manually if necessary and then restart Obsidian one more time.

## Using the plugin

### Five settings

Open the settings tab of Obsidian. There should be the `Paper Note Filling` plugin listed under Community Plugins. There are five settings, the first two of which are required; the remaining three are OpenAI related.

1. The folder in which to create all notes (any folder from inside the vault or the root folder itself).
2. The naming convention for each note (either using the respective identifier or the title of the paper).
3. An optional OpenAI key field. Here, some fields of the note are auto-generated using an OpenAI chat endpoint. This requires a positive credit balance as API requests are not covered by a chatGPT subscription. The OpenAI credit balance can be checked [here](https://platform.openai.com/settings/organization/billing/overview). If the provided OpenAI key is incorrect or does not have sufficient funds associated with it a short notice appears. To avoid these notices, simply fill in `N/A` in the OpenAI key field. 
4. The plugin isn't updated very often. To avoid issues when OpenAI models are updated, the model name is set manually. For now, `gpt-4o-mini` works.
5. The same goes for the chat completion endpoint. For now, `https://api.openai.com/v1/chat/completions` works.

<img src="img/settings.png" width="600" alt="Obsidian settings tab">

### OpenAIi integration

There is nothing fancy going on under the hood, the prompts are listed in [prompts.ts](prompts.ts):
- The tag selection prompt provides the LLM with an abstract and a list of all tags used in the vault and asks it to select up to five tags that fit the abstract.
- The future work extraction prompt provides the LLM with raw text (not LaTeX but HTML -> text) and asks it to summarize the future work directions. This is only possible for papers from arXiv that are availble in arXiv's experimental HTML format.

In both cases, it is possible that the LLM calls fail (either because the endpoint changed, insufficient funds, etc.). In this case nothing further happens, apart from a notice on the screen. Setting the OpenAI key in the Settings tab to `N/A` avoids these notices.

Anything generated/extracted with an LLM is prefixed by 💻.


### Creating a note

To create a note, open the command palette, and find the `Paper Note Filling:Create paper note from URL.`

<img src="img/command-palette.png" width="600" alt="Obsidian command palette">

Clicking the command brings up a dialogue in which to paste the URL:

<img src="img/input.png" width="600" alt="Obsidian URL input">

Press <kbd>Enter</kbd> and a note with the paper title, authors, url, abstract, etc. should be created. If the file already exists, it will not be overwritten. The end result (here with the [Blue Topaz Obsidian theme](https://github.com/whyt-byte/Blue-Topaz_Obsidian-css)) looks something like this:

<img src="img/output.png" width="600" alt="Obsidian created paper note">

## Developing the plugin further

If you are missing functionality in the plugin, continue developing it further (and make a PR if you feel up for it). The plugin is straightforward and just a few hundred lines of code. The [Obsidian Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) contain a lot of information about how to develp your own plugin or adapt existing ones.

In short:
1. This time we want to install the source and compile ourselves. If you already installed the plugin as described above, delete the `paper-note-filler` folder again. Clone the repository to the `plugins` directory of your Obsidian vault and `cd` into it:
    
    ```
    cd [my-obsidian-vault-folder]/.obsidian/plugins/
    rm -r paper-note-filler
    git clone https://github.com/chauff/paper-note-filler
    cd paper-note-filler
    ```
2. Run `npm install`. If you don't have `npm` yet, you will need to install it first. If you haven't used `npm` in a long time, update it: `npm install -g npm@latest`. If you are still getting an error, check your `Node` version (and update it if necessary via `nvm install node --reinstall-packages-from=node`) and then try again `npm install`.
3. Over time the packages listed in [package-lock.json](package-lock.json) and [package.json](package.json) To update them follow these steps:

    1. Run `npm outdated` to see outdated dependencies. Update each listed package.
    2. Clear node modules and cache:
        ```bash
        rm -rf node_modules
        rm package-lock.json
        npm cache clean --force
        ```
    3. Run `npx npm-check-updates -u` to update `package.json` to the latest versions.
    4. Run `npm install` to regenerate `node_modules` and a fresh `package-lock.json` file.

4. Run `npm run dev`. If all goes well, you now find a generated `main.js` file in your folder -- that is the compiled version of the plugin. That's it, the plugin is now compiled and ready to use. Updating the code will trigger a recompile.
5. To actually see the output of the `console.log()` statements littered throughout the code, open the developer tools of Obsidian by heading to `View >> Toggle Developer Tools`.
6. In [.github/workflows](.github/workflows/) a GitHub action is defined that triggers a new release after the following steps are taken (more details [here](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)):
   1. Update the code.
   2. Once happy, increment the version number in [manifest.json](manifest.json), let's assume the version number increases from `1.0.2` to `1.0.3`. Commit.
   3. Then create a tag that matches the new version number by running `git tag -a 1.0.3 -m "1.0.3"` and then `git push origin 1.0.3`
   4. Check the Actions tab on GitHub, it should now be running the "Release Obsidian plugin" action (this can take some time).
   5. If there are build issues, and it isn't an error in the plugin itself, it is probably about outdated package versions.
   6. If for some reason the build fails and you want to retrigger the build without updating the versioning do this:
      1. Delete the tag number locally `git tag -d 1.0.3`
      2. Recreate the tag `git tag 1.0.3`
      3. Force push to trigger the workflow `git push -f origin 1.0.3`