import { Router } from 'express';
import {
  createCandidateHandler,
  getCandidateHandler,
  updateCandidateHandler,
  deleteCandidateHandler,
  listCandidatesHandler,
} from '../controllers/candidateController';
import { validate } from '../middleware/validation';
import { createCandidateSchema, candidateIdSchema } from '../validators/candidateValidator';

const router = Router();

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 maxLength: 500
 *               education:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Education'
 *               workExperience:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WorkExperience'
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createCandidateSchema), createCandidateHandler);

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: List candidates with pagination and filters
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     candidates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Candidate'
 *                     pagination:
 *                       type: object
 */
router.get('/', listCandidatesHandler);

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidate details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 */
router.get('/:id', validate(candidateIdSchema, 'params'), getCandidateHandler);

/**
 * @swagger
 * /api/candidates/{id}:
 *   patch:
 *     summary: Update candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       404:
 *         description: Candidate not found
 */
router.patch('/:id', validate(candidateIdSchema, 'params'), updateCandidateHandler);

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Delete candidate (soft delete)
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 */
router.delete('/:id', validate(candidateIdSchema, 'params'), deleteCandidateHandler);

export default router;

