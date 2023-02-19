export enum TopicName {
    USER = 'user',
    POST = 'post',
}

export enum EventKey {}

export enum EventName {
    USER__LIKED_POST = 'liked_post',
}

export interface IEventTopic {
    event: string;
    topic: TopicName;
}

export const EventTopics: Map<EventKey, IEventTopic> = new Map();
