import { IEventData } from '@common/event-source/EventData';
import {
    INotificationTransformer,
    INotificationTransformerConstructor,
    NotificationType,
} from '../notification.interface';
import { UserLikedPostTransformer } from './like.tranformer';
const Transformers = new Map<NotificationType, INotificationTransformerConstructor>();

Transformers.set(NotificationType.USER_LIKED_POST, UserLikedPostTransformer);

export class UserNotificationFactory {
    static make(type: NotificationType, data: IEventData): INotificationTransformer {
        return Transformers.get(type).make(data);
    }
}
