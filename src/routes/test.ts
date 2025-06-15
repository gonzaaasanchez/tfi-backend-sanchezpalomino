import { Router } from 'express';
import Test from '../models/Test';

const router = Router();

// GET /test
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tests' });
  }
});

// POST /test
router.post('/', async (req, res) => {
  try {
    const { name, value } = req.body;
    const newTest = new Test({ name, value });
    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    res.status(400).json({ error: 'Error creating test' });
  }
});

export default router; 