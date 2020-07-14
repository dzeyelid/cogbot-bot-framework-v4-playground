// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, TurnContext } from 'botbuilder';
import { Templates } from 'botbuilder-lg';
import * as path from 'path';

const USER_PROFILE_PROPERTY = 'user';

export class LanguageGenerationBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
            // lg ファイルを読み込む
            const lgTemplates = Templates.parseFile(path.join(__dirname, '../languageTemplates', 'greetings.lg'));

            // greetingTemplate という名前のテンプレートを読み込み、出力する
            const lgOutput = lgTemplates.evaluate('greetingTemplate', { user: { name: 'かづみ' } });
            await context.sendActivity(lgOutput);

            await next();
        });
    }
}
