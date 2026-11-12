// Import any needed model functions
import { getAllProjects, getProjectDetails, getUpcomingProjects } from '../models/projects.js';

const NUMBER_OF_PROJECTS = 5;

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
        return res.status(404).send('Project not found');
    }

    const title = `Project Details - ${projectDetails.title}`;
    res.render('project', { title, project: projectDetails });
};

// Export any controller functions
export { showProjectsPage, showProjectDetailsPage };
