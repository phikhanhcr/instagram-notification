import { pick } from 'lodash';
import { IEventData } from '@common/event-source/EventData';
import { Language } from '@config/multilanguage';
import { NotificationType } from './notification.interface';
import { UserNotificationFactory } from './transform/user-factory';
import UserNotification, { INotification, NotificationStatus } from './UserNotification';

export class NotificationService {
    static async createNotification(userId: number, type: NotificationType, data: IEventData): Promise<INotification> {
        // do something here
        const transformer = UserNotificationFactory.make(type, data);

        const key = transformer.getKey();
        const oldNotification = await UserNotification.findOne({ key }).exec();

        let notification: INotification =
            oldNotification ||
            new UserNotification({
                auth_id: userId,
                type,
                key,
            });
        notification.last_received_at = oldNotification ? oldNotification.received_at : null;
        notification.received_at = new Date();
        notification.status = NotificationStatus.UNSEEN_AND_UNREAD;
        notification = transformer.transform(Language.EN, notification);

        notification = await UserNotification.findOneAndUpdate(
            { key: notification.key },
            {
                $set: pick(notification, [
                    'status',
                    'received_at',
                    'updated_at',
                    'image',
                    'icon',
                    'url',
                    'title',
                    'content',
                    'data',
                    'meta',
                    'max_meta_tz',
                    'compiled_at',
                    'last_received_at',
                ]),
                $unset: { dirty: '' },
                $setOnInsert: pick(notification, ['type', 'auth_id', 'created_at']),
            },
            { new: true, upsert: true },
        );

        return notification;
    }
}
