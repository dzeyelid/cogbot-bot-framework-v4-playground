// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotState, ConversationState, StatePropertyAccessor, UserState, TurnContext } from 'botbuilder';
import { Dialog, DialogState, DialogSet, DialogTurnStatus } from 'botbuilder-dialogs';
import { FavoriteFoodDialog } from './dialogs/favoriteFoodDialog';

const DIALOG_STATE = 'dialogState';

export class DialogBot extends ActivityHandler {
    private conversationState: BotState;
    private userState: BotState;
    private dialog: Dialog;
    private dialogState: StatePropertyAccessor<DialogState>;

    constructor(conversationState: BotState, userState: BotState, dialog: Dialog) {
        super();

        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState as ConversationState;
        this.userState = userState as UserState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE);

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
            console.log('Running dialog with Message Activity.');

            // ダイアログを起動する
            const dialogSet = new DialogSet(this.dialogState);
            dialogSet.add(this.dialog);

            const dialogContext = await dialogSet.createContext(context);
            const results = await dialogContext.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dialogContext.beginDialog(this.dialog.id);
            }

            await next();
        });

        this.onDialog(async (context: TurnContext, next: () => Promise<void>) => {
            // 状態の変更を保存する
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}
