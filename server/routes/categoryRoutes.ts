import express from 'express';
import { Category } from '../models/Category';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const categories = await Category.find({
      $or: [
        { userId },
        // Could also match teamId if needed
      ]
    });
    const mapped = categories.map(c => ({ ...c.toObject(), id: c._id.toString() }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const newCategory = new Category({ ...req.body, userId });
    await newCategory.save();
    res.status(201).json({ ...newCategory.toObject(), id: newCategory._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ ...category.toObject(), id: category._id.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', verifyToken, async (req: any, res: any) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
