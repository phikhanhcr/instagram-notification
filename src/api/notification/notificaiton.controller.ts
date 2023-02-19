import { NextFunction, Request, Response } from 'express';

export class NotificationController {
    static async common(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.send({
                message: 'Operation executed successfully!',
                data: {},
            });
        } catch (error) {
            next(error);
        }
    }
}
