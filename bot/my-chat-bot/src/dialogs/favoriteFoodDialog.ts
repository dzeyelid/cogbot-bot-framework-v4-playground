import { UserState, StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, TextPrompt, ChoicePrompt, WaterfallDialog, WaterfallStepContext, ChoiceFactory } from 'botbuilder-dialogs';
import { UserProfile } from '../stateData/userProfile';

const FAVORITE_FOOD_DIALOG = 'favoriteFoodDialog';
const USER_PROFILE = 'USER_PROFILE';
const NAME_PROMPT = 'NAME_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

export class FavoriteFoodDialog extends ComponentDialog {
    private userProfile: StatePropertyAccessor<UserProfile>;

    constructor(userState: UserState) {
        super(FAVORITE_FOOD_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);

        // 使用するダイアログを登録する
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.showUserProfileStep.bind(this),
            this.nameStep.bind(this),
            this.favoriteFoodStep.bind(this),
            this.summaryStep.bind(this),
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    private async showUserProfileStep(stepContext: WaterfallStepContext<UserProfile>) {
        // もしすでにユーザ情報を持っていれば、それを表示し、ダイアログを終了する
        const userProfile = await this.userProfile.get(stepContext.context, new UserProfile());
        if (userProfile.name && userProfile.favoriteFood) {
            const msg = this.createMessage(userProfile.name, userProfile.favoriteFood);
            await stepContext.context.sendActivity(msg);
            return await stepContext.endDialog();
        }

        // ユーザ情報がない場合は、次のステップへ
        return await stepContext.next();
    }

    private async nameStep(stepContext: WaterfallStepContext<UserProfile>) {
        // テキスト型の Prompt dialog を使用してユーザに質問する
        return await stepContext.prompt(NAME_PROMPT, '名前を教えてください');
    }

    private async favoriteFoodStep(stepContext: WaterfallStepContext<UserProfile>) {
        // ひとつ前のステップに対する返答を、一時保存する
        stepContext.options.name = stepContext.result;

        // 選択肢型の Prompt dialog を使用してユーザに質問する
        return await stepContext.prompt(CHOICE_PROMPT, {
            choices: ChoiceFactory.toChoices(['ラーメン', 'カレー']),
            prompt: 'どちらが好きですか？',
        });
    }

    private async summaryStep(stepContext: WaterfallStepContext<UserProfile>) {
        // ひとつ前のステップに対する返答を、一時保存する
        stepContext.options.favoriteFood = stepContext.result.value;

        // これまでの入力を userState に保存する
        const userProfile = await this.userProfile.get(stepContext.context, new UserProfile());
        const stepContextOptions = stepContext.options;
        userProfile.name = stepContextOptions.name;
        userProfile.favoriteFood = stepContextOptions.favoriteFood;

        // これまでの入力を出力する
        const msg = this.createMessage(userProfile.name, userProfile.favoriteFood);
        await stepContext.context.sendActivity(msg);

        // ダイアログを終える
        return await stepContext.endDialog();
    }

    private createMessage(name: string, favoriteFood: string) {
        return `${name} さんの好きな食べ物は ${favoriteFood} です。`;
    }
}