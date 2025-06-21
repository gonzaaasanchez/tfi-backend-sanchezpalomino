import { Router } from 'express';
import Test from '../models/Test';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /test - Protegido con autenticación
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const tests = await Test.find();
  res.json({
    success: true,
    data: tests
  });
}));

// POST /test - Protegido con autenticación
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { name, value } = req.body;
  
  if (!name || !value) {
    res.status(400).json({
      success: false,
      message: 'Nombre y valor son requeridos'
    });
    return;
  }

  const newTest = new Test({ name, value });
  const savedTest = await newTest.save();
  
  res.status(201).json({
    success: true,
    data: savedTest
  });
}));

export default router; 