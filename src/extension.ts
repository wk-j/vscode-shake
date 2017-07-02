'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Shake } from "./shake";

export function activate(context: vscode.ExtensionContext) {

    //let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
    //    vscode.window.showInformationMessage('Hello World!');
    //});
    let shake = new Shake()
    context.subscriptions.push(shake);


    //context.subscriptions.push(disposable);
}

export function deactivate() {

}