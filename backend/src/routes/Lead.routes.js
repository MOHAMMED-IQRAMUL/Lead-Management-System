import express from 'express';
import { authMiddleware } from '../middlewares/Auth.middleware.js';
import {
  createLead,
  listLeads,
  getLead,
  updateLead,
  deleteLead
} from '../controllers/Lead.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createLead);        // 201
router.get('/', listLeads);          // 200 with pagination & filters
router.get('/:id', getLead);         // 200
router.put('/:id', updateLead);      // 200
router.delete('/:id', deleteLead);   // 204

export default router;
