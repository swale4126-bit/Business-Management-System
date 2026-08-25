const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

exports.getCategories = async (req, res) => {
    const { search } = req.query;
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};

    const categories = await prisma.category.findMany({
        where,
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    sendSuccess(res, categories);
};

exports.getCategoryById = async (req, res) => {
    const category = await prisma.category.findUnique({
        where: { id: req.params.id },
        include: { products: true }
    });

    if (!category) return sendError(res, 'Category not found', 404);
    sendSuccess(res, category);
};

exports.createCategory = async (req, res) => {
    const category = await prisma.category.create({
        data: req.body
    });
    sendSuccess(res, category, 'Category created successfully', 201);
};

exports.updateCategory = async (req, res) => {
    const category = await prisma.category.update({
        where: { id: req.params.id },
        data: req.body
    });
    sendSuccess(res, category, 'Category updated successfully');
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    
    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
        return sendError(res, 'Cannot delete category with associated products', 400);
    }

    await prisma.category.delete({ where: { id: categoryId } });
    sendSuccess(res, null, 'Category deleted successfully');
};
