import {
	App,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	requestUrl
} from "obsidian";

import { stopwords } from "./english-stopwords";
import { prompts } from "./prompts";

//**********
//DEBUG flag: console.log non-error statements enabled
//**********
const DEBUG = true

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
	openAIKey: "N/A",
	openAIModel: "gpt-4o-mini",
	openAIEndpoint: "https://api.openai.com/v1/chat/completions"
};

//all strings ever needed can be found here
const STRING_MAP: Map<string, string> = new Map([
	[
		"error", "Something went wrong. Check the Obsidian console if the error persists."
	],
	[
		"openAIError", "Something went wrong when querying OpenAI. Check the Obsidian console if the error persists."
	],
	["unsupportedUrl", "This URL is not supported. You tried to enter: "],
	[
		"fileAlreadyExists",
		"Unable to create note. File already exists. Opening existing file.",
	],
	["semanticScholarError", "Error fetching data from Semantic Scholar"],
	["commandId", "url-to-paper-note"],
	["commandName", "Create paper note from URL."],
	["inputLabel1", "Enter a valid URL."],
	["inputLabel2", "Here are some examples: "],
	["arXivRestAPI", "https://export.arxiv.org/api/query?id_list="],
	["aclAnthologyUrlExample", "https://aclanthology.org/2022.acl-long.1/"],
	["arXivUrlExample", "https://arxiv.org/abs/0000.00000"],
	["semanticScholarUrlExample", "https://www.semanticscholar.org/paper/some-text/0000.00000"],
	["inputPlaceholder", "https://my-url.com"],
	["arxivUrlSuffix", "arXiv:"],
	["aclAnthologyUrlSuffix", "ACL:"],
	["semanticScholarFields", "fields=authors,title,abstract,url,venue,year,publicationDate,externalIds"],
	["semanticScholarAPI", "https://api.semanticscholar.org/graph/v1/paper/"],
	["settingHeader", "Settings to create paper notes."],
	["settingFolderName", "Folder"],
	["settingFolderDesc", "Folder to create paper notes in."],
	["settingFolderRoot", "(root of the vault)"],
	["settingNoteName", "Note naming"],
	["settingNoteDesc", "Method to name the note."],
	["settingOpenAIName", "OpenAI key"],
	["settingOpenAIDesc", `Provide a valid OpenAI key for LLM integration, otherwise use '${DEFAULT_SETTINGS.openAIKey}'.`],
	["settingOpenAIModelName", "OpenAI model name"],
	["settingOpenAIModelDesc", "Provide the name of an OpenAI model suitable for chat completion, e.g. gpt-4o-mini."],
	["settingOpenAIEndpointName", "OpenAI chat endpoint"],
	["settingOpenAIEndpointDesc", "Provide a valid OpenAI chat completion endpoint, e.g. https://api.openai.com/v1/chat/completions."],
	["noticeRetrievingArxiv", "Retrieving paper information from arXiv API."],
	["noticeRetrievingSS", "Retrieving paper information from Semantic Scholar API."],
	["llmMarker", "💻"]

]);

function trimString(str: string | null): string {
	if (str == null) return "";

	return str.replace(/\s+/g, " ").trim();
}

interface PaperNoteFillerPluginSettings {
	folderLocation: string;
	fileNaming: string;
	openAIKey: string;
	openAIModel: string;
	openAIEndpoint: string;
}

export default class PaperNoteFillerPlugin extends Plugin {
	settings: PaperNoteFillerPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: STRING_MAP.get("commandId")!,
			name: STRING_MAP.get("commandName")!,
			callback: () => {
				new urlModal(this.app, this.settings).open();
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

class urlModal extends Modal {
	settings: PaperNoteFillerPluginSettings;

	constructor(app: App, settings: PaperNoteFillerPluginSettings) {
		super(app);
		this.settings = settings;
	}

	addTextElementToModal(type: keyof HTMLElementTagNameMap, value: string): void {
		const { contentEl } = this;
		contentEl.createEl(type, { text: value });
	}

	addInputElementToModal(type: keyof HTMLElementTagNameMap): any {
		const { contentEl } = this;
		let input = contentEl.createEl(type);
		return input;
	}

	addPropertyToElement(element: HTMLElement, property: string, value: string): void {
		element.setAttribute(property, value);
	}

	getIdentifierFromUrl(url: string): string {
		//if url ends in / remove it
		if (url.endsWith("/"))
			url = url.slice(0, -1);
		return url.split("/").slice(-1)[0];
	}

	//generic prompting of OpenAI model(s)
	async fetchOpenAICompletion(prompt: string, context: string): Promise<string> {
		// Show a notice with the context of the call
		new Notice(`Querying OpenAI for ${context}... This may take a few seconds.`);

		const payload = {
			model: this.settings.openAIModel,
			messages: [{ role: "user", content: prompt }],
		};

		const response = await fetch(this.settings.openAIEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.settings.openAIKey}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.log("ERROR RESPONSE FROM OPENAI:");
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}

	query_llm(): boolean {
		if (this.settings.openAIKey == DEFAULT_SETTINGS.openAIKey) {
			return false;
		}
		return true;
	}

	extractFutureWork(paper: string): Promise<string> {
		if (this.query_llm() == false) {
			return Promise.resolve("");
		}

		const future_prompt = `${prompts.get('futureWork')}\n\nPaper: ${paper}`
		return this.fetchOpenAICompletion(future_prompt, "future work")
			.catch(error => {
				new Notice(STRING_MAP.get("openAIError")!);
				console.log(error);
				return "";
			});
	}

	generateTagsFromAbstract(abstract: string): Promise<string> {
		if (this.query_llm() == false) {
			return Promise.resolve("");
		}

		const availableTags = (this.app.metadataCache as any).getTags();
		const tagsString = Object.keys(availableTags).join(' ');

		const tag_prompt = `${prompts.get('generateTags')}\n\nAbstract: ${abstract}\n\nAvailable hashtags: ${tagsString}`;

		return this.fetchOpenAICompletion(tag_prompt, "tags generation")
			.catch(error => {
				new Notice(STRING_MAP.get("openAIError")!);
				console.log(error);
				return "";
			});
	}

	extractFileNameFromUrl(url: string, title: string): string {

		let filename = this.getIdentifierFromUrl(url);

		if (this.settings.fileNaming !== "identifier" &&
			title != null) {
			let sliceEnd = undefined; //default to all terms
			if (this.settings.fileNaming.includes(
				"first-3-title-terms"
			))
				sliceEnd = 3;
			else if (this.settings.fileNaming.includes(
				"first-5-title-terms"
			))
				sliceEnd = 5;
			else
				;

			filename = title
				.split(" ")
				.filter(
					(word) => !stopwords.has(word.toLowerCase()) ||
						!this.settings.fileNaming.includes(
							"no-stopwords"
						)
				)
				.slice(0, sliceEnd)
				.join(" ")
				.replace(/[^a-zA-Z0-9 ]/g, "");
		}
		return filename;
	}

	async generateNoteContent(
		pathToFile: string,
		title: string,
		authorString: string,
		url: string,
		htmlData: string,
		venue: string,
		publicationDate: string,
		abstract: string
	): Promise<void> {
		// Check if the file already exists
		if (await this.app.vault.adapter.exists(pathToFile)) {
			new Notice(STRING_MAP.get("fileAlreadyExists")!);
			this.app.workspace.openLinkText(pathToFile, pathToFile);
			return;
		}

		let tags = await this.generateTagsFromAbstract(abstract);
		if (tags.length >= 3) {
			tags = `${STRING_MAP.get("llmMarker")} ${tags}`
		}

		let futureWork = "";
		if (htmlData.length > 50) {
			futureWork = await this.extractFutureWork(htmlData);
		}

		if (futureWork.length >= 10) {
			futureWork = `${STRING_MAP.get("llmMarker")} ${futureWork}`;
		}

		// Create the file and open it
		await this.app.vault.create(
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
			url +
			"\n\n" +
			"# Venue" +
			"\n" +
			trimString(venue) +
			"\n\n" +
			"# Publication date" +
			"\n" +
			trimString(publicationDate) +
			"\n\n" +
			"# Abstract" +
			"\n" +
			trimString(abstract) +
			"\n\n" +
			"# Tags" +
			"\n" +
			tags +
			"\n\n" +
			"# Notes" +
			"\n" +
			"- " + futureWork
		)
		await this.app.workspace.openLinkText(pathToFile, pathToFile);
	}

	parseMetadataFromSemanticScholar(data: string): { title: string; authorString: string; venue: string; publicationDate: string; abstract: string; url: string } {
		const json = JSON.parse(data);

		if (json.error) {
			throw new Error(STRING_MAP.get("semanticScholarError"));
		}

		const title = json.title || "undefined";
		const abstract = json.abstract || "";
		const authors = json.authors.map((author: { name: string }) => author.name).join(", ");
		const venue = json.venue ? `${json.venue} ${json.year}` : "";
		const publicationDate = json.publicationDate || "";
		const url = json.url;

		return { title, authorString: authors, venue, publicationDate, abstract, url };
	}

	extractFromSemanticScholar(url: string) {
		const id = this.getIdentifierFromUrl(url);
		const suffix = url.includes("arxiv") ? STRING_MAP.get("arxivUrlSuffix")! :
			url.includes("aclanthology") ? STRING_MAP.get("aclAnthologyUrlSuffix")! : "";

		if (suffix === "") {
			new Notice(STRING_MAP.get("unsupportedUrl")! + url);
			return;
		}

		const htmlData = ""; //does not exist for semanticscholar

		fetch(`${STRING_MAP.get("semanticScholarAPI")!}${suffix}${id}?${STRING_MAP.get("semanticScholarFields")!}`)
			.then((response) => response.text())
			.then((data) => {
				const { title, authorString, venue, publicationDate, abstract, url } = this.parseMetadataFromSemanticScholar(data);
				const filename = this.extractFileNameFromUrl(url, title);
				const pathToFile = `${this.settings.folderLocation}${path.sep}${filename}.md`;
				this.generateNoteContent(pathToFile, title, authorString, url, htmlData, venue, publicationDate, abstract);
			})
			.catch((error) => {
				new Notice(STRING_MAP.get("error")!);
				console.error(error);
			})
			.finally(() => {
				this.close();
			});
	}

	extractFromArxiv(url: string) {
		const id = this.getIdentifierFromUrl(url);

		// fetch(STRING_MAP.get("arXivRestAPI")! + id)
		// 	.then((response) => response.text())
		// 	.then((data) => {
		requestUrl({ url: STRING_MAP.get("arXivRestAPI")! + id })
			.then((response) => {
				const data = response.text;
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(data, "text/xml");

				const title = xmlDoc.getElementsByTagName("title")[1]?.textContent || "undefined";
				const abstract = xmlDoc.getElementsByTagName("summary")[0]?.textContent || "";
				const authors = Array.from(xmlDoc.getElementsByTagName("author")).map(
					(author) => author.getElementsByTagName("name")[0]?.textContent || ""
				).join(", ");
				const publicationDate = xmlDoc.getElementsByTagName("published")[0]?.textContent?.split("T")[0] || "";

				const filename = this.extractFileNameFromUrl(url, title);
				const pathToFile = `${this.settings.folderLocation}${path.sep}${filename}.md`;

				const venue = ""; //arxiv has no venue field

				const urlHtmlVersion = url.replace("/abs/", "/html/") + "v1";
				let htmlData = "";

				return requestUrl(urlHtmlVersion)
					.then((htmlResponse) => {
						const buffer = htmlResponse.arrayBuffer;
						const decoder = new TextDecoder("utf-8");
						htmlData = decoder.decode(buffer);

						const htmlParser = new DOMParser();
						const htmlDoc = htmlParser.parseFromString(htmlData, "text/html");
						htmlData = htmlDoc.body.textContent || "";

						if (DEBUG == true) {
							console.log(htmlData)
						}
					})
					.catch((htmlError) => {
						console.log(htmlError);
						htmlData = "";
					})
					.finally(() => {
						this.generateNoteContent(pathToFile, title, authors, url, htmlData, venue, publicationDate, abstract);
						this.close();
					});
			})
			.catch((error) => {
				console.error("Error fetching arXiv metadata:", error);
			});
	}


	onOpen() {
		const { contentEl } = this;

		this.addTextElementToModal("h2", STRING_MAP.get("inputLabel1")!);
		this.addTextElementToModal("p", STRING_MAP.get("inputLabel2")!);
		this.addTextElementToModal("p", STRING_MAP.get("aclAnthologyUrlExample")!);
		this.addTextElementToModal("p", STRING_MAP.get("arXivUrlExample")!);
		this.addTextElementToModal("p", STRING_MAP.get("semanticScholarUrlExample")!);

		let input = this.addInputElementToModal("input");
		this.addPropertyToElement(input, "type", "search");
		this.addPropertyToElement(input, "placeholder", STRING_MAP.get("inputPlaceholder")!);
		this.addPropertyToElement(input, "minLength", STRING_MAP.get("inputPlaceholder")!);
		this.addPropertyToElement(input, "style", "width: 75%;");

		let extracting = false;

		contentEl.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;

			//get the URL from the input field
			let url = input.value.trim().toLowerCase();

			if (!extracting) {
				extracting = true;

				if (DEBUG == true) {
					console.log("HTTP request: " + url);
				}

				if (url.includes("arxiv.org")) {
					new Notice(STRING_MAP.get("noticeRetrievingArxiv")!);
					this.extractFromArxiv(url);
				}
				else {
					new Notice(STRING_MAP.get("noticeRetrievingSS")!);
					this.extractFromSemanticScholar(url);
				}
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
			.map((file) => {
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

		//1. Setting: Folder in which to store the papers in (1 file per paper)
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

		let namingOptions: Record<string, string> = {};
		NAMING_TYPES.forEach((record) => {
			namingOptions[record] = record;
		});

		//2. Setting: File naming based on the title of the paper
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

		//3. OpenAI key (optional)
		new Setting(containerEl)
			.setName(STRING_MAP.get("settingOpenAIName")!)
			.setDesc(STRING_MAP.get("settingOpenAIDesc")!)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.openAIKey)
					.onChange(async (value) => {
						this.plugin.settings.openAIKey = value;
						await this.plugin.saveSettings()
					})
			);

		//4. OpenAI model name (optional)
		new Setting(containerEl)
			.setName(STRING_MAP.get("settingOpenAIModelName")!)
			.setDesc(STRING_MAP.get("settingOpenAIModelDesc")!)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.openAIModel)
					.onChange(async (value) => {
						this.plugin.settings.openAIModel = value;
						await this.plugin.saveSettings()
					})
			);

		//5. OpenAI chat completions url (optional)
		new Setting(containerEl)
			.setName(STRING_MAP.get("settingOpenAIEndpointName")!)
			.setDesc(STRING_MAP.get("settingOpenAIEndpointDesc")!)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.openAIEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.openAIEndpoint = value;
						await this.plugin.saveSettings()
					})
			);
	}
}
