import logger from '@common/logger';
import { KAFKA_BROKERS, LOG_LEVEL, APP_NAME } from '@config/environment';
import { Consumer, Kafka, logLevel, Producer } from 'kafkajs';
import uuid from 'uuid-random';

let level: logLevel;
switch (LOG_LEVEL) {
    case 'debug':
        level = logLevel.INFO;
        break;
    case 'warn':
        level = logLevel.WARN;
        break;
    case 'error':
        level = logLevel.ERROR;
        break;
    default:
        level = logLevel.INFO;
        break;
}

const kafka = new Kafka({
    clientId: uuid(),
    brokers: KAFKA_BROKERS,
    logLevel: level,
});

export class KafkaAdapter {
    private static producer: Producer;
    private static consumer: Consumer;

    static async getProducer(): Promise<Producer> {
        if (!KafkaAdapter.producer) {
            try {
                KafkaAdapter.producer = await KafkaAdapter.connectProducer();
            } catch (error) {
                logger.error('Cannot connect kafka as producer', { error });
            }
        }
        return KafkaAdapter.producer;
    }

    static async getConsumer(): Promise<Consumer> {
        if (!KafkaAdapter.consumer) {
            try {
                KafkaAdapter.consumer = await KafkaAdapter.connectConsumer();
            } catch (error) {
                logger.error('Cannot connect kafka as consumer', { error });
            }
        }
        return KafkaAdapter.consumer;
    }

    static async connectProducer(): Promise<Producer> {
        logger.info('Connecting to kafka producer');
        const producer = kafka.producer({ allowAutoTopicCreation: false });
        await producer.connect();
        logger.info('Connected to kafka producer');
        return producer;
    }

    static async connectConsumer(): Promise<Consumer> {
        logger.info('Connecting to kafka consumer');
        const consumer = kafka.consumer({ groupId: APP_NAME, allowAutoTopicCreation: false });
        await consumer.connect();
        logger.info('Connected to kafka consumer');
        return consumer;
    }

    static async disconnect(): Promise<void> {
        logger.info('Disconnecting from kafka');
        if (KafkaAdapter.producer) {
            await KafkaAdapter.producer.disconnect();
        }
        if (KafkaAdapter.consumer) {
            await KafkaAdapter.consumer.disconnect();
        }
    }

    static async publish(eventData: any): Promise<void> {
        try {
            const producer = await KafkaAdapter.getProducer();
            await producer.send({
                topic: eventData.topic,
                messages: [
                    {
                        key: eventData.key,
                        value: JSON.stringify(eventData.transform()),
                        headers: {
                            event: eventData.event,
                            id: eventData.id.toHexString(),
                        },
                    },
                ],
            });
        } catch (error) {
            logger.error('Cannot publish kafka message', { eventData, error });
        }
    }
}
