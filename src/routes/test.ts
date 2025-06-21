import { Router, RequestHandler } from 'express';
import Test from '../models/Test';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const getTests: RequestHandler = async (req, res, next) => {
  try {
    const tests = await Test.find();
    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

const createTest: RequestHandler = async (req, res, next) => {
  try {
    const { name, value } = req.body;

    if (!name || !value) {
      res.status(400).json({
        success: false,
        message: 'Nombre y valor son requeridos',
      });
      return;
    }

    const newTest = new Test({ name, value });
    const savedTest = await newTest.save();

    res.status(201).json({
      success: true,
      data: savedTest,
    });
  } catch (error) {
    next(error);
  }
};

// @ts-ignore - Express 5.1.0 type compatibility issue
router.get('/', authMiddleware, getTests);
// @ts-ignore - Express 5.1.0 type compatibility issue
router.post('/', authMiddleware, createTest);

export default router;
