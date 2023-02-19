import { EventObjectType, EventObjectTypeCode, IEventData } from '@common/event-source/EventData';
import { Language } from '@config/multilanguage';
import { INotificationTransformer, NotificationTemplates, NotificationType } from '../notification.interface';
import { INotification, INotificationData, INotificationMeta } from '../UserNotification';
import { get } from 'lodash';

export class UserLikedPostTransformer implements INotificationTransformer {
    private data: IEventData;

    constructor(data: IEventData) {
        this.data = data;
    }

    public static getType(): NotificationType {
        return NotificationType.USER_LIKED_POST;
    }

    public static make(data: IEventData): INotificationTransformer {
        return new UserLikedPostTransformer(data);
    }

    public getKey(): Buffer {
        const sep = Buffer.allocUnsafe(1);
        sep.write('\x00', 'binary');

        const objectId = Buffer.allocUnsafe(13);
        objectId.writeUInt8(EventObjectTypeCode.get(EventObjectType.POST), 0);
        objectId.write(this.data.di_obj.id, 1, 'hex');

        const ownerId = Buffer.allocUnsafe(5);
        ownerId.writeUInt8(EventObjectTypeCode.get(EventObjectType.USER), 0);
        ownerId.writeInt32BE(+get(this.data.pr_obj, 'id', ''), 1);

        const typeKey = Buffer.allocUnsafe(1);
        typeKey.writeUInt8(UserLikedPostTransformer.getType());
        return Buffer.concat([objectId, sep, typeKey, sep, ownerId]);
    }

    public transform(lang: Language, notification: INotification): INotification {
        const template = NotificationTemplates.get(UserLikedPostTransformer.getType());

        const data: INotificationData = {
            subs: [get(this.data.subject, 'id', '')],
            pr_obj: get(this.data.pr_obj, 'id', ''),
            di_obj: get(this.data.di_obj, 'id', ''),
            ctx: 'like_count',
        };

        const meta: INotificationMeta[] = [
            {
                _id: get(this.data.subject, 'id', ''),
                name: get(this.data.subject, 'data.name', ''),
                tz: new Date(),
            },
            {
                _id: get(this.data.di_obj, 'id', ''),
                tz: new Date(),
            },
            {
                _id: get(this.data.pr_obj, 'id', ''),
                name: get(this.data.pr_obj, 'data.name', ''),
                tz: new Date(),
            },
            {
                _id: 'like_count',
                name: get(this.data.context, 'req.like_count', ''),
                tz: new Date(),
            },
        ];

        notification.url = `link redirect to post`;
        notification.icon = template.icon;
        notification.data = data;
        notification.meta = meta;
        notification.image = get(this.data.subject, 'data.avatar', '');
        notification.compile(lang, template);
        return notification;
    }
}
