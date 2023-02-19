import express from 'express';
import { TestLocalController } from '@api/test/test-local.controller';

const router = express.Router();

router.get('/common', TestLocalController.common);

export default router;
