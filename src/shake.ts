import * as vscode from "vscode";
import * as os from "os";
import * as ncp  from "copy-paste";
var endOfLine = require('os').EOL;
let windows = os.platform() === "win32";

export class Shake {

    staticBarItem: vscode.StatusBarItem;
    watcher: vscode.FileSystemWatcher;

    constructor() {
        this.initialize();
        this.register();
    }

    private register() {
        vscode.commands.registerCommand("shake.showTasks", () => {
            this.showTasks();
        });

        vscode.commands.registerCommand("shake.runTask", (arg) => {
            var command = this.createBuildCommand(arg);
            this.runCommand(command);
        });        
    }

    private createBuildCommand(taskName) {
        if (windows) {
            return `stack build.hs \"${taskName}\"`;
        } else {
            return `stack build.hs \"${taskName}\"`;
        }
    }

    private getTasksFromText(text: string): string[] {
        let lines = text.split("\n");
        let taskLines = lines.filter(x => x.indexOf("phony") !== -1);
        let tasks = taskLines.map(x => x.match(/"(.*?)"/)[1]);
        return tasks;
    }

    async getTasksFromFile(file: vscode.Uri) {
        let doc = await vscode.workspace.openTextDocument(file.fsPath);
        let text = doc.getText()
        let tasks = this.getTasksFromText(text)
        var items = new Array<vscode.QuickPickItem>();
        tasks.forEach(x => {
            let task = { label: x, description: "" };
            items.push(task);
        });
        return items;
    }

    private async extractTasks(fileName) {
        let files = await vscode.workspace.findFiles(fileName, "**/node_modules/**", 1);
        if (files.length > 0)
            return await this.getTasksFromFile(files[0]);
        else 
            return [];
    }

    private showTerminal() {
        vscode.commands.executeCommand("workbench.action.terminal.focus");
    }

    private runCommand(command)  {
        let editor = vscode.window.activeTextEditor;
        ncp.copy(command + endOfLine, function () {
            vscode.commands.executeCommand("workbench.action.terminal.focus").then(() => {
                vscode.commands.executeCommand("workbench.action.terminal.paste"); 
                var editor = vscode.window.activeTextEditor;
                if(editor) {
                    editor.show();
                }
            });
		});
    }

    private initialize() {
        if (!this.staticBarItem) {
            this.staticBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            this.staticBarItem.text = "$(terminal) Shake";
            this.staticBarItem.command = "shake.showTasks";
            this.staticBarItem.show();
        }
    }

    public async showTasks() {
        let options = { placeholder: "Enter task name" };
        var tasks = await this.extractTasks("build.hs");
        let quickPick = vscode.window.showQuickPick(tasks, options);
        quickPick.then(result => {
            var task = result.label;
            var command = this.createBuildCommand(task);
            this.runCommand(command);
        });
    }

    dispose() {
        this.watcher.dispose();
        this.staticBarItem.dispose();
    }
}