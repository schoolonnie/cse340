import { body, validationResult } from 'express-validator';
import { getAllCategories, getCategoryById, getProjectsByCategoryId, createCategory, updateCategory } from '../models/categories.js';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
];

// Define any controller functions
const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Categories';

    res.render('categories', { title, categories });
};

const showCategoryDetailsPage = async (req, res) => {
    const categoryId = req.params.id;
    const category = await getCategoryById(categoryId);

    if (!category) {
        return res.status(404).render('errors/404', {
            title: 'Page Not Found',
            error: `Category ${categoryId} not found`,
            stack: null
        });
    }

    const projects = await getProjectsByCategoryId(categoryId);
    const title = `${category.name} Projects`;

    res.render('category', { title, category, projects });
};

const showNewCategoryForm = (req, res) => {
    res.render('new-category', { title: 'Add New Category', name: '' });
};

const processNewCategoryForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('new-category', {
            title: 'Add New Category',
            name: req.body.name || '',
            errors: errors.array()
        });
    }

    try {
        const categoryId = await createCategory(req.body.name.trim());
        req.flash('success', 'Category created successfully!');
        return res.redirect(`/category/${categoryId}`);
    } catch (error) {
        const message = error.code === '23505'
            ? 'A category with that name already exists.'
            : 'There was an error creating the category.';
        return res.status(400).render('new-category', {
            title: 'Add New Category',
            name: req.body.name,
            errors: [{ msg: message }]
        });
    }
};

const showEditCategoryForm = async (req, res) => {
    const category = await getCategoryById(req.params.id);
    if (!category) {
        return res.status(404).render('errors/404', {
            title: 'Page Not Found',
            error: `Category ${req.params.id} not found`,
            stack: null
        });
    }

    return res.render('edit-category', { title: 'Edit Category', category, name: category.name });
};

const processEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;
    const errors = validationResult(req);
    const category = await getCategoryById(categoryId);

    if (!category) {
        return res.status(404).render('errors/404', {
            title: 'Page Not Found',
            error: `Category ${categoryId} not found`,
            stack: null
        });
    }

    if (!errors.isEmpty()) {
        return res.status(400).render('edit-category', {
            title: 'Edit Category',
            category,
            name: req.body.name || '',
            errors: errors.array()
        });
    }

    try {
        const updatedCategory = await updateCategory(categoryId, req.body.name.trim());
        if (!updatedCategory) {
            return res.status(404).render('errors/404', {
                title: 'Page Not Found',
                error: `Category ${categoryId} not found`,
                stack: null
            });
        }

        req.flash('success', 'Category updated successfully!');
        return res.redirect(`/category/${categoryId}`);
    } catch (error) {
        const message = error.code === '23505'
            ? 'A category with that name already exists.'
            : 'There was an error updating the category.';
        return res.status(400).render('edit-category', {
            title: 'Edit Category',
            category,
            name: req.body.name,
            errors: [{ msg: message }]
        });
    }
};

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
};