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

export {getAllProjects, getProjectsByOrganizationId};  