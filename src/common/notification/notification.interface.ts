import Handlebars, { TemplateDelegate } from 'handlebars';
import { INotification } from '@common/notification/UserNotification';
import { IEventData } from '@common/event-source/EventData';
import { Language } from '@config/multilanguage';

export enum NotificationType {
    // Other
    OTHER = 0,
    USER_LIKED_POST = 1,
    USER_COMMENTED_POST = 2,
}

export interface ITemplateLanguage {
    [Language.VI]: TemplateDelegate;
    [Language.EN]: TemplateDelegate;
}

export interface INotificationTemplate {
    icon: string;
    title: ITemplateLanguage;
    content: ITemplateLanguage;
}

export const NotificationTemplates = new Map<NotificationType, INotificationTemplate>();

NotificationTemplates.set(NotificationType.USER_LIKED_POST, {
    icon: '',
    title: {
        vi: Handlebars.compile('Instagram'),
        en: Handlebars.compile('Instagram'),
    },
    content: {
        vi: Handlebars.compile(`
        {{#if ctx.name}}
            {{{ subs.0.name }}} va {{{ ctx.name }}} nguoi khac thich bai viet cua ban
        {{~else}}
            {{{ subs.0.name }}} vua like bai viet cua ban
        {{/if}}

        `),
        en: Handlebars.compile(`
        {{#if ctx.name}}
            {{{ subs.0.name }}} and {{{ ctx.name }}} people like your post
        {{~else}}
            {{{ subs.0.name }}} vua like bai viet cua ban
        {{/if}}

        `),
    },
});

export interface INotificationTransformerConstructor {
    getType(): NotificationType;
    make(data: IEventData): INotificationTransformer;
}

export interface INotificationTransformer {
    getKey(): Buffer;
    transform(lang: Language, notification: INotification): INotification;
}
