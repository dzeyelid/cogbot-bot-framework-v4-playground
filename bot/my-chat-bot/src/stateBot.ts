// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotState, ConversationState, StatePropertyAccessor, UserState, TurnContext } from 'botbuilder';

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class StateBot extends ActivityHandler {
    private conversationState: BotState;
    private userState: BotState;
    private conversationDataAccessor: StatePropertyAccessor;
    private userDataAccessor: StatePropertyAccessor;

    constructor(conversationState: BotState, userState: BotState) {
        super();

        if (!conversationState) throw new Error('[StateBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[StateBot]: Missing parameter. userState is required');

        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userDataAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        this.conversationState = conversationState as ConversationState;
        this.userState = userState as UserState;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            const userData = await this.userDataAccessor.get(context, {});
            const conversationData = await this.conversationDataAccessor.get(context, { promptedForUserName: false, messages: [] });
            console.log(userData);
            console.log(conversationData);

            if (!userData.name) {
                // 初回は名前を尋ねる
                if (!conversationData.promptedForUserName) {
                    await context.sendActivity('名前を教えてください');
                    conversationData.promptedForUserName = true;
                } else {
                    // 入力された名前を保持する
                    userData.name = context.activity.text;
                    await context.sendActivity(`こんにちは、${userData.name}. conversation data を見るには何か入力してください。`);
                    conversationData.promptedForUserName = false;
                }
            } else {
                // 会話のデータを保持する
                conversationData.messages.push({
                    text: context.activity.text,
                    timestamp: context.activity.timestamp.toLocaleString(),
                    channelId: context.activity.channelId,
                });

                const lastIndex = conversationData.messages.length - 1;
                await context.sendActivity(`${userData.name} は ${conversationData.messages[lastIndex].text} と入力しました`);
                await context.sendActivity(`メッセージ受信時刻: ${ conversationData.messages[lastIndex].timestamp }`);
                await context.sendActivity(`メッセージの送信元チャンネル: ${ conversationData.messages[lastIndex].channelId }`);
                await context.sendActivity(`会話の回数 ${conversationData.messages.length}`);
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
