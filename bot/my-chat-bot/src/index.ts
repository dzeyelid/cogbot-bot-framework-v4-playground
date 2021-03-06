// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from 'path';

import { config } from 'dotenv';
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { ApplicationInsightsTelemetryClient, ApplicationInsightsWebserverMiddleware, TelemetryInitializerMiddleware } from 'botbuilder-applicationinsights';
import { TelemetryLoggerMiddleware, NullTelemetryClient } from 'botbuilder-core';

// This bot's main dialog.
import { EchoBot } from './echoBot';
import { StateBot } from './stateBot';
import { DialogBot } from './dialogBot';
import { FavoriteFoodDialog } from './dialogs/favoriteFoodDialog';
import { LanguageGenerationBot } from './languageGenerationBot';


// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// --
// Application Insights へテレメトリ送信を実装
function getTelemetryClient(instrumentationKey: string) {
    if (instrumentationKey) {
        return new ApplicationInsightsTelemetryClient(instrumentationKey);
    }
    return new NullTelemetryClient();
}

const telemetryClient = getTelemetryClient(process.env.InstrumentationKey);
const telemetryLoggerMiddleware = new TelemetryLoggerMiddleware(telemetryClient);
const initializerMiddleware = new TelemetryInitializerMiddleware(telemetryLoggerMiddleware);
adapter.use(initializerMiddleware);
// --

// // 1. Echo bot
// // Create the main dialog.
// const myBot = new EchoBot();
// // 1. --

// // 2. Dialog bot
// // インメモリのストレージインスタンスを生成する
// const memoryStorage = new MemoryStorage();

// // Conversation state と User state インスタンスを生成する
// const conversationState = new ConversationState(memoryStorage);
// const userState = new UserState(memoryStorage);

// // bot のインスタンスを生成する
// const myBot = new StateBot(conversationState, userState);
// // 2. --

// 3. Favorite Food bot
// インメモリのストレージインスタンスを生成する
const memoryStorage = new MemoryStorage();

// User state インスタンスを生成する
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// ダイアログ インスタンスを生成する
const dialog = new FavoriteFoodDialog(userState);
dialog.telemetryClient = telemetryClient;           // Application Insights へのテレメトリ送信

// bot のインスタンスを生成する
const myBot = new DialogBot(conversationState, userState, dialog);
// 3. --

// // 4. Language Generation
// // bot のインスタンスを生成する
// const myBot = new LanguageGenerationBot();
// // 4. --

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.run(context);
    });
});

// すべてのアクティビティを取得するために、 Applciation Insights ミドルウェアを有効にする
server.use(restify.plugins.bodyParser());

// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    });
    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    streamingAdapter.useWebSocket(req, socket, head, async (context) => {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        await myBot.run(context);
    });
});
