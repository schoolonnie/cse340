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

export {getAllProjects}  