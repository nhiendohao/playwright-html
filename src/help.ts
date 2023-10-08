import ansi2html from 'ansi-to-html';
import { TestStep } from '@playwright/test/reporter';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import { ExecOptions } from './types/execOptions.types';
import UglifyJS from "uglify-js";
import { minify } from 'csso';
import portfinder from 'portfinder';

class Help {
	private execOptions: ExecOptions;
	private ansiRegex = new RegExp(
		"[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))",
		"g"
	);
	private ansiColors = {
		0: "#000",
		1: "#C00",
		2: "#0C0",
		3: "#C50",
		4: "#00C",
		5: "#C0C",
		6: "#0CC",
		7: "#CCC",
		8: "#555",
		9: "#F55",
		10: "#5F5",
		11: "#FF5",
		12: "#55F",
		13: "#F5F",
		14: "#5FF",
		15: "#FFF",
	};
	private errorCodeLinesToPrint = 4;
	private stepCodeLinesToPrint = 1;
	private freePort = 0;

	constructor(execOptions: ExecOptions) {
		this.execOptions = execOptions;
	}

	convertMsToTime(duration: number) {
		let milliseconds = duration;
		let seconds = Math.floor(milliseconds / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);

		milliseconds = milliseconds % 1000;
		seconds = seconds % 60;
		minutes = minutes % 60;
		hours = hours % 24;

		let out = "";

		out += hours.toString() !== "0" ? hours.toString() + "h " : "";
		out += minutes.toString() !== "0" ? minutes.toString() + "m " : "";
		out += seconds.toString() !== "0" ? seconds.toString() + "s " : "";
		out += milliseconds.toString() !== "0" ? milliseconds.toString() + "ms " : "";

		return out;
	}

	getRandomColor() {
		var length = 6;
		var chars = "0123456789ABCDEF";
		var hex = "#";
		while (length--) hex += chars[(Math.random() * 16) | 0];
		return hex;
	}

	stripAnsi(str: string): string {
		return str.replace(this.ansiRegex, "");
	}

	escapeHTML(text: string): string {
		return text.replace(
			/[&"<>]/g,
			(c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" }[c]!)
		);
	}

	ansi2htmlMarkup(text: string) {
		const config: any = {
			bg: "var(--vscode-panel-background)",
			fg: "var(--vscode-foreground)",
			colors: this.ansiColors,
		};
		return new ansi2html(config).toHtml(this.escapeHTML(text));
	}

	printStep(id: string, count: number, testStep: TestStep, space: number): string{
		let icon = "";
		let statusClass = "";
		let title = "";
		let body = "";
		if(testStep.error !== undefined){
			icon = `<span class="material-icons step-error">clear</span>`;
			statusClass = "step-error-hover";
		} else {
			icon = `<span class="material-icons step-ok">check</span>`;
			statusClass = "step-ok-hover";
		}

		if(testStep.location !== undefined){
			title = `<p class="stepLine" style="padding-left: ${space}px">${icon + " " + testStep.title + " | <span class='fst-italic'>" + testStep.location.file.replace(path.resolve('./')+"/", "") + ":" + testStep.location.line}</span><label class="stepLineDuration">${this.convertMsToTime(testStep.duration)}</label></p>`;

			let code = this.printCode(testStep.location.file, testStep.location.line, this.stepCodeLinesToPrint);

			let startLine = (testStep.location.line-this.stepCodeLinesToPrint <= 0 ? 1 : testStep.location.line-this.stepCodeLinesToPrint);
			body += `<pre style="margin-left: ${space+20}px;" class="line-numbers" data-start="${startLine}" >${code}</pre>`;
		} else {
			title = `<p class="stepLine" style="padding-left: ${space}px">${icon + " " + testStep.title}<label class="stepLineDuration">${this.convertMsToTime(testStep.duration)}</label></p>`;
		}

		if(testStep.steps !== undefined){
			testStep.steps.forEach((step, index) => {
				body += this.printStep(id, count+10000+index, step, space + 40);
			});
		}
		
		if(body !== ""){
			return `<div class="accordion accordion-flush " id="${id}-${count}-accordionFlush">
						<div class="accordion-item">
							<h2 class="accordion-header ${statusClass}">
								<button class="accordion-button accordion-steps collapsed ${statusClass}" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse-${id}-${count}" aria-expanded="false" aria-controls="flush-collapse-${id}-${count}">
								${title}
								</button>
							</h2>
							<div id="flush-collapse-${id}-${count}" class="accordion-collapse collapse" data-bs-parent="#${id}-${count}-accordionFlush">			
								<div class="accordion-body accordion-body-steps">
								${body}
								</div>
							</div>
						</div>
					</div>`;
		} else {
			return `<div class="accordion accordion-flush " id="${id}-${count}-accordionFlush">
						<div class="accordion-item">
							<h2 class="accordion-header ${statusClass}">
								<button class="accordion-steps-no-link ${statusClass}" type="button" >
								${title}
								</button>
							</h2>
						</div>
					</div>`;
		}

	}

	processLineByLine(filename: string, lineNumber: number, lines: number): string {
		let result = "";
		try {
			fs.readFileSync(filename, "utf-8")
				.split(/\r?\n/)
				.forEach((line, index) => {
					let indx = index+1;
					if(indx >= lineNumber-lines && indx <= lineNumber+lines){
							result += line + "\n";
					}
				});
			return result;				
		} catch (error) {
			return ""
		}
	  }

	  printErrors(errors: string, errorCode: string, modalId: string): string{
		return `<div class="accordion accordion-flush mt-3 mb-3 rb-card" id="accordionPanelsErros">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-errors-${modalId}" aria-expanded="true" aria-controls="panel-collapse-errors-${modalId}">
		Errors
		</button>
		</h2>
		<div id="panel-collapse-errors-${modalId}" class="accordion-collapse collapse show">
		<div class="accordion-body">
		<pre class="container-fluid text-left">${this.ansi2htmlMarkup(errors)}</pre>
		${errorCode}
		</div>
		</div>
		</div>
		</div>`;	
	  }

	  printErrorCode(errorFile: string): string{
		let errorFilename = errorFile.split(":")[0];
		let errorFileLine = errorFile.split(":")[1];
		let startLine = (Number(errorFileLine)-this.errorCodeLinesToPrint <= 0 ? 1 : Number(errorFileLine)-this.errorCodeLinesToPrint);
		return `<pre class="line-numbers" data-start="${startLine}" >${this.printCode(errorFilename, Number(errorFileLine), this.errorCodeLinesToPrint)}</pre>`;	
	  }

	  printCode(filename: string, fileLine: number, lines: number): string{
		return `<code class="language-typescript">`+this.ansi2htmlMarkup(this.processLineByLine(filename, fileLine, lines))+`</code>`;	
	  }

	  printScreenshotComparison(id: string, attachmentExpectedPath: string, attachmentActualPath: string, attachmentDiffPath: string): string{
		let output = "";
		let base64ExpectedImage = this.convertBase64(attachmentExpectedPath);
		let base64ActualImage = this.convertBase64(attachmentActualPath);
		let base64DiffImage = this.convertBase64(attachmentDiffPath);
		let expectedFilename = attachmentExpectedPath.split("/").pop();
		let expectedFileType = expectedFilename?.split(".").pop();
		let actualFilename = attachmentActualPath.split("/").pop();
		let actualFileType = actualFilename?.split(".").pop();
		let diffFilename = attachmentDiffPath.split("/").pop();
		let diffFileType = diffFilename?.split(".").pop();

		if(base64ExpectedImage !== "" && base64ActualImage !== "" && base64DiffImage !== ""){
			if(this.execOptions.embedAttachments === true){		
				output = `
					<div class="row ps-3 pe-3"><div class="col text-center">			 
					<img-comparison-slider tabindex="0" class="rendered">
					<figure slot="first" class="before">
					<img src="data:image/${expectedFileType};base64,${base64ExpectedImage}" width="100%">
					<figcaption>Expected</figcaption>
					</figure>
					<figure slot="second" class="after">
					<img src="data:image/${actualFileType};base64,${base64ActualImage}" width="100%">
					<figcaption>Actual</figcaption>
					</figure>
					</img-comparison-slider>	 
					</div></div>
					<div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card-special">
					<a class="download-btn" target="_Blank" download="${expectedFilename}" href="data:image/${expectedFileType};base64,${base64ExpectedImage}">Expected <span 	class="material-icons">file_download</span></a>
					<a class="download-btn" target="_Blank" download="${actualFilename}" href="data:image/${actualFileType};base64,${base64ActualImage}">Actual <span 	class="material-icons">file_download</span></a>
					<a class="download-btn" target="_Blank" download="${diffFilename}" href="data:image/${diffFileType};base64,${base64DiffImage}">Diff <span 	class="material-icons">file_download</span></a>
					</div></div>`;
			} else {		
				this.base64ToFile(base64ExpectedImage, this.execOptions.outputFolder+"/screenshots/"+id+"-"+expectedFilename);
				this.base64ToFile(base64ActualImage, this.execOptions.outputFolder+"/screenshots/"+id+"-"+actualFilename);
				this.base64ToFile(base64DiffImage, this.execOptions.outputFolder+"/screenshots/"+id+"-"+diffFilename);
				output = `
					<div class="row ps-3 pe-3"><div class="col text-center">			 
					<img-comparison-slider tabindex="0" class="rendered">
					<figure slot="first" class="before">
					<img src="screenshots/${id+"-"+expectedFilename}" width="100%">
					<figcaption>Expected</figcaption>
					</figure>
					<figure slot="second" class="after">
					<img src="screenshots/${id+"-"+actualFilename}" width="100%">
					<figcaption>Actual</figcaption>
					</figure>
					</img-comparison-slider>	 
					</div></div>
					<div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card-special">
					<a class="download-btn" target="_Blank" download="${expectedFilename}" href="screenshots/${id+"-"+expectedFilename}">Expected <span 	class="material-icons">open_in_new</span></a>
					<a class="download-btn" target="_Blank" download="${actualFilename}" href="screenshots/${id+"-"+actualFilename}">Actual <span 	class="material-icons">open_in_new</span></a>
					<a class="download-btn" target="_Blank" download="${diffFilename}" href="screenshots/${id+"-"+diffFilename}">Diff <span 	class="material-icons">open_in_new</span></a>
					</div></div>`;
			}
		}
		
		return output;
	  }

	  printScreenshot(id:string, attachmentPath: string): string{
		let output = "";
		let base64Image = this.convertBase64(attachmentPath);
		let filename = attachmentPath.split("/").pop();
		let fileType = filename?.split(".").pop();

		if(base64Image !== ""){	
			if(this.execOptions.embedAttachments === true){					
				output = `
					<div class="row ps-3 pe-3"><div class="col text-center"><img src="data:image/${fileType};base64,${base64Image}" class="img-fluid mt-3" alt="Screenshot"></div></div><div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${filename}" href="data:image/${fileType};base64,${base64Image}">Download <span class="material-icons">file_download</span></a></div></div>`;
				
			} else {
				this.base64ToFile(base64Image, this.execOptions.outputFolder+"/screenshots/"+id+"-"+filename);
				output = `
				<div class="row ps-3 pe-3"><div class="col text-center"><img src="screenshots/${id+"-"+filename}" class="img-fluid mt-3" alt="Screenshot"></div></div><div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card"><a class="download-btn" target="_Blank" download="${filename}" href="screenshots/${id+"-"+filename}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}
		
		return output;
	  }

	  printScreenshots(screenshots: string, modalId: string): string{
		return `
		<div class="accordion accordion-flush mt-3 mb-3" id="accordionPanelsScreenshots">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-screenshots-${modalId}"  aria-expanded="true" aria-controls="panel-collapse-screenshots-${modalId}">
		Screenshots
		</button>
		</h2>
		<div id="panel-collapse-screenshots-${modalId}" class="accordion-collapse collapse show">
		<div class="accordion-body rb-attachment-body">
		${screenshots}
		</div>
		</div>
		</div>
		</div>`;
	  }

	  printVideo(id:string, attachmentPath: string): string{
		let output = "";
		let base64Video = this.convertBase64(attachmentPath);
		let filename = attachmentPath.split("/").pop();
		let fileType = filename?.split(".").pop();
		if(base64Video !== ""){
			if(this.execOptions.embedAttachments === true){	
				output = `
					<div class="row ps-3 pe-3"><div class="col text-center"><video controls style="max-width: 100%" src="data:video/${fileType};base64,${base64Video}" class="object-fit-contain mt-3" autoplay></video></div></div><div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card-special"><a class="download-btn" target="_Blank" download="${filename}" href="data:video/${fileType};base64,${base64Video}">Download <span class="material-icons">file_download</span></a></div></div>`;
			} else {
				this.base64ToFile(base64Video, this.execOptions.outputFolder+"/videos/"+id+"-"+filename);
				output = `
					<div class="row ps-3 pe-3"><div class="col text-center"><video controls style="max-width: 100%" src="videos/${id+"-"+filename}" class="object-fit-contain mt-3" autoplay></video></div></div><div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card-special"><a class="download-btn" target="_Blank" download="${filename}" href="videos/${id+"-"+filename}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}
		
		return output;
	  }

	  printVideos(videos: string, modalId: string): string{
		return `
		<div class="accordion accordion-flush mt-3 mb-3" id="accordionPanelsVideos">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-videos-${modalId}"  aria-expanded="true" aria-controls="panel-collapse-videos-${modalId}">
		Videos
		</button>
		</h2>
		<div id="panel-collapse-videos-${modalId}" class="accordion-collapse collapse show">
		<div class="accordion-body rb-attachment-body">
		${videos}
		</div>
		</div>
		</div>
		</div>`;
	  }

	  printStdout(id:string, stdout: string): string{
		return `
		<div class="accordion accordion-flush mt-3 mb-3" id="accordionPanelsStdout">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-stdout-${id}"  aria-expanded="true" aria-controls="panel-collapse-stdout-${id}">
		Stdout
		</button>
		</h2>
		<div id="panel-collapse-stdout-${id}" class="accordion-collapse collapse show">
		<div class="accordion-body rb-attachment-body">
		<div class="row ps-3 pe-3"><div class="col">${stdout}</div></div><div class="row ms-3 me-3"><div class="col text-center rb-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="stdout.txt" href="data:text/html,${stdout}">Download <span class="material-icons">file_download</span></a></div></div>
		</div>
		</div>
		</div>
		</div>`;
	  }

	  printStderr(id:string, stderr: string): string{
		return `
		<div class="accordion accordion-flush mt-3 mb-3" id="accordionPanelsStderr">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-stderr-${id}"  aria-expanded="true" aria-controls="panel-collapse-stderr-${id}">
		Stderr
		</button>
		</h2>
		<div id="panel-collapse-stderr-${id}" class="accordion-collapse collapse show">
		<div class="accordion-body rb-attachment-body">
		<div class="row ps-3 pe-3"><div class="col">${stderr}</div></div><div class="row ms-3 me-3"><div class="col text-center rb-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="stderr.txt" href="data:text/html,${stderr}">Download <span class="material-icons">file_download</span></a></div></div>
		</div>
		</div>
		</div>
		</div>`;
	  }

	  printTrace(id:string, attachmentPath: string): string{
		let output = "";
		let base64trace = this.convertBase64(attachmentPath);
		let filename = attachmentPath.split("/").pop();
		let fileType = filename?.split(".").pop();
		
		if(base64trace !== ""){
			if(this.execOptions.embedAttachments === true){	
				output = `
					<div class="row ms-3 me-3 mb-4"><div class="col text-center rb-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="${filename}" href="data:application/${fileType};base64,${base64trace}">Download <span class="material-icons">file_download</span></a></div></div>`;
			} else {	
				this.base64ToFile(base64trace, this.execOptions.outputFolder+"/traces/"+id+"-"+filename);
				output = `
					<div class="row ms-3 me-3 mb-1"><div class="col text-center rb-attachments-buttons-card-no-bottom"><a class="download-btn" target="_Blank" download="${filename}" href="traces/${id+"-"+filename}">Download <span class="material-icons">file_download</span></a></div></div>`;
			}
		}

		return `
		<div class="accordion accordion-flush mt-3 mb-3" id="accordionPanelsTrace">
		<div class="accordion-item">
		<h2 class="accordion-header">
		<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panel-collapse-trace-${id}"  aria-expanded="true" aria-controls="panel-collapse-trace-${id}">
		Trace
		</button>
		</h2>
		<div id="panel-collapse-trace-${id}" class="accordion-collapse collapse show">
		<div class="accordion-body rb-attachment-body">
		${output}
		</div>
		</div>
		</div>
		</div>`;;
	  }

	  convertBase64(fileToConvert: string): string{
		try {
			return fs.readFileSync(fileToConvert, {encoding: 'base64'});
		} catch (err) {
			return "";
		}
	  }

	  getShortFilePath(filepath: string, testFolder: string): string{		
		if(filepath.includes("/"+testFolder+"/")){
			return filepath.split("/"+testFolder+"/")[1];
		} else if(filepath.includes("\\"+testFolder+"\\")){
			return filepath.split("\\"+testFolder+"\\")[1];
		} else {
			return filepath;
		}
	  }

	  createFile(filepath: string, content: string){
		try {
			fse.outputFileSync(filepath, content);
		} catch (err) {
			console.log("Error creating file: "+filepath);
		}
	  }

	  updateHtml(html: string, tag: string, content: string, contentType: string, filename: string): string{
		content = this.compressFileContent(content, contentType);
		let output = "";
		if(this.execOptions.embedAssets === true){
			if(contentType === "css"){
				output = html.replace(tag, "<style>"+content+"</style>");
			}else if(contentType === "js"){
				output = html.replace(tag, "<script type='text/javascript'>"+content+"</script>");
			}
		} else {
			if(contentType === "css"){
				this.createFile(this.execOptions.outputFolder+"/css/"+filename, content);
				output = html.replace(tag, "<link rel='stylesheet' href='css/"+filename+"' >");
			} else if(contentType === "js"){
				this.createFile(this.execOptions.outputFolder+"/js/"+filename, content);
				output = html.replace(tag, "<script type='text/javascript' src='js/"+filename+"' ></script>");
			}
		}

		return output;
	  }

	  base64ToFile(base64data: string, filename: string) {
		let buf = Buffer.from(base64data, 'base64');
		fse.outputFileSync(filename, buf);	  
	  }

	  compressFileContent(content: string, type: string): string {
		if(this.execOptions.minifyAssets === true){
			if(type === "js"){
				return UglifyJS.minify(content).code;
			} else if(type === "css"){
				return minify(content).css;
			} else {
				return content;
			}
		} else {
			return content;
		}		
	  }

	 async getPortFree() {
		await portfinder.getPortPromise()
			.then((port) => {
				this.freePort = port;
			})
			.catch((err) => {
				throw err;
			});
		return this.freePort.toString();
	}
}

export default Help;
