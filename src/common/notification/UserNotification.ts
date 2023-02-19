import { ITimestamp } from '@common/timestamp.interface';
import { Language } from '@config/multilanguage';
import mongoose, { Schema, Types } from 'mongoose';
import { keyBy, values } from 'lodash';
import { INotificationTemplate, NotificationType } from './notification.interface';
import moment from 'moment-timezone';

const HIGHLIGHT_TEMPLATE = /<b>([^<>]*)<\/b>/gi;
const HIGHLIGHT_TEMPLATE_LENGTH = 7;

const CHAR_LT = 17;
const CHAR_GT = 18;

function renderMessage(message: string): INotificationContent {
    let highlights = [];
    const text = message.replace(HIGHLIGHT_TEMPLATE, (match, p1, offset) => {
        highlights.push({ offset, length: p1.length });
        return p1;
    });
    highlights = highlights.map((highlight, index) => {
        highlight.offset -= HIGHLIGHT_TEMPLATE_LENGTH * index;
        return highlight;
    });

    return { text: unescape(text), highlights };
}

function escape(value) {
    if (typeof value === 'string') {
        return value.replace('<', String.fromCharCode(CHAR_LT)).replace('>', String.fromCharCode(CHAR_GT));
    }
    return value;
}

function unescape(value) {
    if (typeof value === 'string') {
        return value.replace(String.fromCharCode(CHAR_LT), '<').replace(String.fromCharCode(CHAR_GT), '>');
    }
    return value;
}

interface IHighlight {
    offset: number;
    length: number;
}

interface INotificationContent {
    text: string;
    highlights: IHighlight[];
}

interface ICompiledData {
    subs: INotificationMeta[];
    di_obj?: INotificationMeta;
    in_obj?: INotificationMeta;
    pr_obj?: INotificationMeta;
    ctx?: INotificationMeta;
}

export interface INotificationData {
    subs: string[];
    di_obj?: string;
    in_obj?: string;
    pr_obj?: string;
    ctx?: string;
}

export enum NotificationStatus {
    UNSEEN_AND_UNREAD = 0,
    SEEN_BUT_UNREAD = 1,
    SEEN_AND_READ = 2,
}

export interface INotificationMeta {
    _id: string;
    name?: string;
    image?: string;
    tz: Date;
}

export interface INotificationResponse {
    id: string;
    auth_id: number;
    type: NotificationType;
    image: string;
    icon: string;
    url: string;
    title: string;
    content: INotificationContent;
    received_at: number;
    read_at?: number;
    status: NotificationStatus;
}

export interface INotification extends Document, ITimestamp {
    _id: Types.ObjectId;
    auth_id: number;
    image: string;
    icon: string;
    url: string;
    title: string;
    content: INotificationContent;
    data?: INotificationData;
    meta: INotificationMeta[];
    max_meta_tz?: Date;
    compiled_at: Date;
    received_at: Date;
    last_received_at: Date;
    read_at?: Date;
    dirty?: boolean;
    type: NotificationType;
    key: Buffer;
    status: NotificationStatus;
    created_at: Date;
    updated_at: Date;

    getCompiledData(): unknown;
    compile(lang: Language, template: INotificationTemplate): void;
    transform(): INotificationResponse;
}

export const NotificationSchema: Schema<INotification> = new Schema(
    {
        auth_id: { type: Number, required: true },
        image: { type: String, default: '' },
        icon: { type: String, default: '' },
        url: { type: String, default: '' },
        title: { type: String, trim: true, default: '' },
        content: {
            type: new Schema({
                text: { type: String, trim: true, required: true },
                highlights: { type: Array, default: [] },
            }),
            required: true,
        },
        data: {
            type: new Schema({
                subs: { type: [String], default: [] },
                di_obj: { type: String, default: null },
                in_obj: { type: String, default: null },
                pr_obj: { type: String, default: null },
                ctx: { type: String, default: null },
            }),
            default: null,
        },
        meta: {
            type: [
                new Schema({
                    _id: { type: String, required: true },
                    name: { type: String, default: undefined },
                    image: { type: String, default: undefined },
                    tz: { type: Date, required: true },
                }),
            ],
            default: [],
        },
        max_meta_tz: { type: Date, default: null },
        compiled_at: { type: Date, required: true },
        received_at: { type: Date, required: true },
        last_received_at: { type: Date, default: null },
        read_at: { type: Date, default: null },
        dirty: { type: Boolean, default: undefined },

        type: { type: Number, enum: values(NotificationType), default: NotificationType.OTHER },
        key: { type: Buffer, default: null },
        status: { type: Number, enum: values(NotificationStatus), default: NotificationStatus.UNSEEN_AND_UNREAD },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

NotificationSchema.index(
    { key: 1 },
    {
        name: 'uq_key',
        unique: true,
        background: true,
    },
);

NotificationSchema.method({
    /**
     * Transform topic object to API response
     *
     * @returns
     */
    transform(): INotificationResponse {
        const transformed: INotificationResponse = {
            id: this._id.toHexString(),
            auth_id: this.auth_id,
            type: this.type,
            image: this.image,
            icon: this.icon,
            url: this.url,
            title: this.title,
            content: this.content,
            received_at: moment(this.received_at).unix(),
            read_at: this.read_at ? moment(this.read_at).unix() : null,
            status: this.status,
        };

        return transformed;
    },

    getCompiledData(): ICompiledData {
        const map = keyBy(this.meta, '_id');
        return {
            subs: this.data?.subs ? this.data.subs.map((sub) => map[sub]) : null,
            di_obj: this.data?.di_obj ? map[this.data.di_obj] : null,
            in_obj: this.data?.in_obj ? map[this.data.in_obj] : null,
            pr_obj: this.data?.pr_obj ? map[this.data.pr_obj] : null,
            ctx: this.data?.ctx ? map[this.data.ctx] : null,
        };
    },

    compile(lang: Language, template: INotificationTemplate): void {
        const compiledData = this.getCompiledData();
        this.icon = template.icon;
        this.title = unescape(template.title[lang](compiledData, { allowProtoPropertiesByDefault: true }));
        this.content = renderMessage(template.content[lang](compiledData, { allowProtoPropertiesByDefault: true }));
        this.compiled_at = new Date();
        this.dirty = false;
    },
});

export default mongoose.model<INotification>('UserNotification', NotificationSchema);
