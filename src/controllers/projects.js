// Import any needed model functions
import { getAllProjects, getProjectDetails, getUpcomingProjects, createProject, assignCategoriesToProject, updateProject, replaceCategoriesForProject } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { getAllCategories, getCategoriesByProjectId } from '../models/categories.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_PROJECTS = 5;

const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

// Define any controller functions
const showProjectsPage = async (req, res) => {
    const projects = await getAllProjects();
    const title = 'Upcoming Service Projects';
    const upcomingProjects = await getUpcomingProjects(NUMBER_OF_PROJECTS); // Fetch the next 5 upcoming projects

    res.render('projects', { title, projects, upcomingProjects });
};

const showProjectDetailsPage = async (req, res) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        return res.status(404).render('errors/404', {
            title: 'Page Not Found',
            error: `Project ${projectId} not found`,
            stack: null
        });
    }

    const categories = await getCategoriesByProjectId(projectId);
    const title = `Project Details - ${projectDetails.title}`;
    res.render('project', { title, project: projectDetails, categories });
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const categories = await getAllCategories();
    const title = 'Add New Service Project';

    res.render('new-project', { title, organizations, categories });
};

const processNewProjectForm = async (req, res) => {
    const { title, description, location, date, organizationId } = req.body;
    const selectedCategories = Array.isArray(req.body.categoryId)
        ? req.body.categoryId
        : req.body.categoryId
            ? [req.body.categoryId]
            : [];

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const organizations = await getAllOrganizations();
        const categories = await getAllCategories();
        const title = 'Add New Service Project';

        res.render('new-project', { title, organizations, categories, errors: errors.array() });
        return;
    }

    try {
        const newProjectId = await createProject(title, description, location, date, organizationId);
        await assignCategoriesToProject(newProjectId, selectedCategories);

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

const showEditProjectForm = async (req, res) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);

    if (!projectDetails) {
        return res.status(404).render('errors/404', {
            title: 'Page Not Found',
            error: `Project ${projectId} not found`,
            stack: null
        });
    }

    const organizations = await getAllOrganizations();
    const categories = await getAllCategories();
    const selectedCategories = await getCategoriesByProjectId(projectId);
    const title = 'Edit Service Project';

    res.render('edit-project', {
        title,
        projectDetails,
        organizations,
        categories,
        selectedCategories
    });
};

const processEditProjectForm = async (req, res) => {
    const projectId = req.params.id;
    const { title, description, location, date, organizationId } = req.body;
    const selectedCategories = Array.isArray(req.body.categoryId)
        ? req.body.categoryId
        : req.body.categoryId
            ? [req.body.categoryId]
            : [];

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const organizations = await getAllOrganizations();
        const categories = await getAllCategories();
        const projectDetails = await getProjectDetails(projectId);
        const selectedCategoriesFromDb = await getCategoriesByProjectId(projectId);

        return res.render('edit-project', {
            title: 'Edit Service Project',
            projectDetails,
            organizations,
            categories,
            selectedCategories: selectedCategoriesFromDb,
            errors: errors.array()
        });
    }

    try {
        await updateProject(projectId, title, description, location, date, organizationId);
        await replaceCategoriesForProject(projectId, selectedCategories);

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating project:', error);
        req.flash('error', 'There was an error updating the service project.');
        res.redirect(`/edit-project/${projectId}`);
    }
};

// Export any controller functions
export { showProjectsPage, showProjectDetailsPage, showNewProjectForm, processNewProjectForm, showEditProjectForm, processEditProjectForm, projectValidation };
