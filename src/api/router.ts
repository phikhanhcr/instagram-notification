import express, { Request, Response } from 'express';
import { NODE_ENV } from '@config/environment';
import testRoutes from './test/test-local.router';
const router = express.Router();

if (NODE_ENV === 'development') {
    router.use('/local', testRoutes);
}

export default router;
