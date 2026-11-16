import db from './db.js'

const getAllProjects = async() => {
    const query = `
         SELECT project.project_id, project.title,
             to_char(project.project_date, 'FMMonth FMDD, YYYY') AS formatted_date,
               organization.name AS organization_name
        FROM public.project
        JOIN public.organization USING (organization_id)
        ORDER BY project.project_date, project.title;
    `;

    const result = await db.query(query);

    return result.rows;
}

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          project_date AS date
        FROM project
        WHERE organization_id = $1
        ORDER BY date;
      `;
      
      const queryParams = [organizationId];
      const result = await db.query(query, queryParams);

      return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM project p
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.project_date >= CURRENT_DATE
        ORDER BY p.project_date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT
            p.project_id,
            p.title,
            p.description,
            p.project_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM project p
        JOIN organization o ON o.organization_id = p.organization_id
        WHERE p.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows[0];
};

const createProject = async (title, description, location, date, organizationId) => {
    const query = `
      INSERT INTO project (title, description, location, project_date, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
};

const assignCategoriesToProject = async (projectId, categoryIds) => {
    if (!projectId || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        return;
    }

    const values = categoryIds
        .filter(id => id !== '' && id !== undefined && id !== null)
        .map(categoryId => `(${projectId}, ${categoryId})`)
        .join(', ');

    if (!values) {
        return;
    }

    const query = `
        INSERT INTO project_category (project_id, category_id)
        VALUES ${values};
    `;

    await db.query(query);
};

const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
        UPDATE project
        SET title = $1,
            description = $2,
            location = $3,
            project_date = $4,
            organization_id = $5
        WHERE project_id = $6;
    `;

    await db.query(query, [title, description, location, date, organizationId, projectId]);
};

const replaceCategoriesForProject = async (projectId, categoryIds) => {
    await db.query('DELETE FROM project_category WHERE project_id = $1;', [projectId]);

    if (!categoryIds || categoryIds.length === 0) {
        return;
    }

    const values = categoryIds
        .filter(id => id !== '' && id !== undefined && id !== null)
        .map(categoryId => `(${projectId}, ${categoryId})`)
        .join(', ');

    if (!values) {
        return;
    }

    await db.query(`INSERT INTO project_category (project_id, category_id) VALUES ${values};`);
};

export { getAllProjects, getProjectsByOrganizationId, getUpcomingProjects, getProjectDetails, createProject, assignCategoriesToProject, updateProject, replaceCategoriesForProject };  