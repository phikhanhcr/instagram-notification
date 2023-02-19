import { EventData } from '@common/event-source/EventData';
import EventLog, { IEventLog } from '@common/event-source/EventLog';

export class EventLogService {
    static async createEventLog(event: EventData): Promise<IEventLog> {
        return EventLog.create({
            _id: event.id,
            topic: event.topic,
            event: event.event,
            key: event.key,
            subject: event.subject,
            di_obj: event.di_obj,
            in_obj: event.in_obj,
            pr_obj: event.pr_obj,
            context: event.context,
            sent_at: event.sent_at,
        });
    }
}
