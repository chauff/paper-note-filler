import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import { stopwords } from "./english-stopwords";

const path = require("path");

const NAMING_TYPES: string[] = [
	"identifier",
	"first-3-title-terms",
	"first-3-title-terms-no-stopwords",
	"first-5-title-terms",
	"first-5-title-terms-no-stopwords",
	"all-title-terms",
];

const DEFAULT_SETTINGS: PaperNoteFillerPluginSettings = {
	folderLocation: "",
	fileNaming: NAMING_TYPES[0],
};

//create a string map for all the strings we need
const STRING_MAP: Map<string, string> = new Map([
	[
		"invaliArXivURL",
		"The URL is not valid for arXiv.org. You tried to enter: ",
	],
	[
		"fileAlreadyExists",
		"Unable to create note. File already exists. Opening existing file.",
	],
	["arXivCommandId", "arXiv-to-paper-note"],
	["arXivCommandName", "Create paper note from an arXiv.org URL."],
	["arXivInputLabel", "Enter an arXiv.org URL"],
	["arXivInputPlaceHolder", "https://arxiv.org/abs/0000.00000"],
	["arxivUrlPrefix", "https://arxiv.org/abs/"],
	["arXivRestAPI", "https://export.arxiv.org/api/query?id_list="],
	["settingHeader", "Settings to create paper notes."],
	["settingFolderName", "Folder"],
	["settingFolderDesc", "Folder to create paper notes in."],
	["settingFolderRoot", "(root of the vault)"],
	["settingNoteName", "Note naming"],
	["settingNoteDesc", "Method to name the note."],
]);

function trimString(str: string | null): string {
	if (str == null) return "";

	return str.replace(/\s+/g, " ").trim();
}

interface PaperNoteFillerPluginSettings {
	folderLocation: string;
	fileNaming: string;
}

export default class PaperNoteFillerPlugin extends Plugin {
	settings: PaperNoteFillerPluginSettings;

	async onload() {
		console.log("Loading Paper Note Filler plugin.");

		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: STRING_MAP.get("arXivCommandId")!,
			name: STRING_MAP.get("arXivCommandName")!,
			callback: () => {
				new arXivModal(this.app, this.settings).open();
			},
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class arXivModal extends Modal {
	settings: PaperNoteFillerPluginSettings;

	constructor(app: App, settings: PaperNoteFillerPluginSettings) {
		super(app);
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: STRING_MAP.get("arXivInputLabel") });
		let input = contentEl.createEl("input");
		input.type = "search"; //gets us neat looking CSS
		input.placeholder = STRING_MAP.get("arXivInputPlaceHolder")!;
		input.minLength = input.placeholder.length;
		input.style.width = "75%";

		contentEl.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;

			//we only want this event to trigger once
			event.preventDefault();

			//get the URL from the input field
			let url = input.value;
			console.log("HTTP request: " + url);

			//URL sanity check
			if (
				!url.toLowerCase().startsWith(STRING_MAP.get("arxivUrlPrefix")!)
			) {
				new Notice(STRING_MAP.get("invaliArXivURL") + url);
			} else {
				//paper id
				let id = url.split("/").slice(-1)[0]; //hardcoded separator ok ... it is a URL

				//retrieve from the arXiv API
				fetch(STRING_MAP.get("arXivRestAPI")! + id)
					.then((response) => response.text())
					.then(async (data) => {
						//parse the XML
						let parser = new DOMParser();
						let xmlDoc = parser.parseFromString(data, "text/xml");

						let title =
							xmlDoc.getElementsByTagName("title")[1].textContent;
						let abstract =
							xmlDoc.getElementsByTagName("summary")[0]
								.textContent;
						let authors = xmlDoc.getElementsByTagName("author");
						let authorString = "";
						for (let i = 0; i < authors.length; i++) {
							if (i > 0) {
								authorString += ", ";
							}
							authorString +=
								authors[i].getElementsByTagName("name")[0]
									.textContent;
						}
						let date =
							xmlDoc.getElementsByTagName("published")[0]
								.textContent;
						if (date) date = date.split("T")[0]; //make the date human-friendly

						let filename = id;
						if (
							this.settings.fileNaming !== "identifier" &&
							title != null
						) {
							let sliceEnd = undefined; //default to all terms
							if (
								this.settings.fileNaming.includes(
									"first-3-title-terms"
								)
							)
								sliceEnd = 3;
							else if (
								this.settings.fileNaming.includes(
									"first-5-title-terms"
								)
							)
								sliceEnd = 5;
							else;

							filename = title
								.split(" ")
								.filter(
									(word) =>
										!stopwords.has(word.toLowerCase()) ||
										!this.settings.fileNaming.includes(
											"no-stopwords"
										)
								)
								.slice(0, sliceEnd)
								.join(" ")
								.replace(/[^a-zA-Z0-9 ]/g, "");
						}

						//create a new paper note with the id as the name in the folderlocation folder
						//and the content being the title, authors, date, abstract and comment
						let pathToFile =
							this.settings.folderLocation +
							path.sep +
							filename +
							".md";

						//notification if the file already exists
						if (await this.app.vault.adapter.exists(pathToFile)) {
							new Notice(
								STRING_MAP.get("fileAlreadyExists") + ""
							);
							this.app.workspace.openLinkText(
								pathToFile,
								pathToFile
							);
						} else {
							await this.app.vault
								.create(
									pathToFile,
									"# Title" +
									"\n" +
									trimString(title) +
									"\n\n" +
									"# Authors" +
									"\n" +
									trimString(authorString) +
									"\n\n" +
									"# URL" +
									"\n" +
									trimString(url) +
									"\n\n" +
									"# Publication date" +
									"\n" +
									trimString(date) +
									"\n\n" +
									"# Abstract" +
									"\n" +
									trimString(abstract) +
									"\n\n" +
									"# Tags" +
									"\n\n" +
									"# Notes" +
									"\n\n"
								)
								.then(() => {
									this.app.workspace.openLinkText(
										pathToFile,
										pathToFile
									);
								});
						}

						//close the modal
						this.close();
					});
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: PaperNoteFillerPlugin;

	constructor(app: App, plugin: PaperNoteFillerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: STRING_MAP.get("settings"),
		});

		let folders = this.app.vault
			.getFiles()
			.map((file) =>
			//file.path.split(path.sep).slice(0, -1).join(path.sep);
			{
				let parts = file.path.split(path.sep);
				parts.pop(); //ignore the filename

				//now return all path combinations
				let res: string[] = [];
				for (let i = 0; i < parts.length; i++) {
					res.push(parts.slice(0, i + 1).join(path.sep));
				}
				return res;
			}
			)
			.flat()
			.filter((folder, index, self) => self.indexOf(folder) === index);

		let folderOptions: Record<string, string> = {};
		folders.forEach((record) => {
			folderOptions[record] = record;
		});

		//also add the root folder
		folderOptions[""] = STRING_MAP.get("settingFolderRoot")!;

		let namingOptions: Record<string, string> = {};
		NAMING_TYPES.forEach((record) => {
			namingOptions[record] = record;
		});

		new Setting(containerEl)
			.setName(STRING_MAP.get("settingFolderName")!)
			.setDesc(STRING_MAP.get("settingFolderDesc")!)
			/* create dropdown menu with all folders currently in the vault */
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(folderOptions)
					.setValue(this.plugin.settings.folderLocation)
					.onChange(async (value) => {
						this.plugin.settings.folderLocation = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName(STRING_MAP.get("settingNoteName")!)
			.setDesc(STRING_MAP.get("settingNoteDesc")!)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(namingOptions)
					.setValue(this.plugin.settings.fileNaming)
					.onChange(async (value) => {
						this.plugin.settings.fileNaming = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
