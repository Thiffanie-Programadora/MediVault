import { Router } from 'express';
import {
  create,
  list,
  getOneNote,
  update,
  remove
} from '../controllers/notes.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { noteCreateSchema, noteUpdateSchema } from '../middlewares/schemas.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(noteCreateSchema), create);
router.get('/', list);
router.get('/:id', getOneNote);
router.put('/:id', validate(noteUpdateSchema), update);
router.delete('/:id', remove);

export default router;
