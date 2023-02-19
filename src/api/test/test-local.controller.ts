import { UserType } from '@common/auth/auth.interface';
import { EventData, EventObjectType } from '@common/event-source/EventData';
import { NotificationType } from '@common/notification/notification.interface';
import { NotificationService } from '@common/notification/notification.service';
import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
export class TestLocalController {
    static async common(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventData = new EventData({
                event: 'like',
                topic: 'User',
                key: `post_id`,
                subject: {
                    // doi tuong gay ra hanh dong
                    type: UserType.USER,
                    id: `1`,
                    data: {
                        name: 'Lan Phuong',
                        avatar: 'this is his/her avatar',
                    },
                },
                di_obj: {
                    // doi tuong chiu tac dong cua hanh dong
                    type: EventObjectType.POST,
                    id: '63f20ce68d619df52aaddcd9',
                    data: {
                        _id: '63f20ce68d619df52aaddcd9',
                        title: 'ahihi',
                        image: 'http://localhost:3000',
                    },
                },

                // doi tuong phu chiu tac dong
                pr_obj: {
                    type: EventObjectType.USER,
                    id: `123`,
                    data: {
                        id: 123,
                        name: 'Phi Khanh',
                    },
                },
                context: {
                    req: {
                        like_count: 10,
                    },
                },
            });
            const userId = get(eventData.pr_obj, 'data.id', 0);
            await NotificationService.createNotification(userId, NotificationType.USER_LIKED_POST, eventData);
            res.send({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }
}
