import { ITimestamp } from '@common/timestamp.interface';
import mongoose, { Schema, Document, Types } from 'mongoose';

import { IEventContext, IEventData, IEventObject, IEventSubject, EventObjectType } from './EventData';
import { UserType } from '@common/auth/auth.interface';
import { values } from 'lodash';

export interface IEventLog extends IEventData, Document, ITimestamp {
    _id: Types.ObjectId;
    id: Types.ObjectId;

    topic: string;
    event: string;
    key?: string;
    subject?: IEventSubject;
    di_obj?: IEventObject;
    in_obj?: IEventObject;
    pr_obj?: IEventObject;
    context?: IEventContext;
    sent_at: Date;
    created_at: Date;
}

const EventObjectSchema = new Schema({
    type: { type: String },
    id: { type: String },
    data: { type: Object },
});

export const EventLogSchema: Schema<IEventLog> = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, required: true },
        topic: { type: String, required: true },
        event: { type: String, required: true },
        key: { type: String },
        subject: {
            type: new Schema({
                type: { type: String },
                id: { type: String },
                name: { type: String },
            }),
            default: null,
        },
        di_obj: {
            type: EventObjectSchema,
            default: null,
        },
        in_obj: {
            type: EventObjectSchema,
            default: null,
        },
        pr_obj: {
            type: EventObjectSchema,
            default: null,
        },
        context: {
            type: Object,
            default: null,
        },
        sent_at: { type: Date, required: true },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: false,
        },
    },
);

// Export the model and return your INotification interface
export default mongoose.model<IEventLog>('EventLog', EventLogSchema);
