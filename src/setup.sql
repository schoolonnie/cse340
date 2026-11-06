-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Service Project Table
-- ========================================
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    project_date DATE NOT NULL
);

-- ========================================
-- Insert sample data: Service Projects
-- ========================================
INSERT INTO project (organization_id, title, description, location, project_date)
SELECT organization.organization_id, project_data.title, project_data.description,
       project_data.location, project_data.project_date
FROM (VALUES
    ('BrightFuture Builders', 'Neighborhood Park Renewal', 'Repair walking paths and install durable benches in a neighborhood park.', 'Rexburg Community Park', DATE '2026-11-21'),
    ('BrightFuture Builders', 'Accessible Community Garden', 'Build raised garden beds and accessible paths for community gardeners.', 'Rexburg Community Garden', DATE '2026-12-05'),
    ('BrightFuture Builders', 'Warm Homes Weatherization', 'Add basic weatherproofing to homes for residents preparing for winter.', 'Rexburg, Idaho', DATE '2026-12-12'),
    ('BrightFuture Builders', 'Little Library Build', 'Construct and install weather-resistant neighborhood book-sharing boxes.', 'Porter Park, Rexburg', DATE '2027-01-16'),
    ('BrightFuture Builders', 'Community Center Refresh', 'Paint shared rooms and repair fixtures at a local community center.', 'Madison County Community Center', DATE '2027-02-06'),
    ('GreenHarvest Growers', 'Winter Seedling Workshop', 'Start vegetable seedlings and teach participants how to care for them indoors.', 'GreenHarvest Urban Farm', DATE '2026-11-28'),
    ('GreenHarvest Growers', 'Community Compost Day', 'Set up compost bins and show neighbors how to divert food scraps from landfill.', 'Rexburg Community Garden', DATE '2026-12-06'),
    ('GreenHarvest Growers', 'Food Pantry Harvest', 'Harvest and sort fresh produce for distribution through local food pantries.', 'GreenHarvest Urban Farm', DATE '2026-12-19'),
    ('GreenHarvest Growers', 'School Garden Planning', 'Prepare garden beds and learning materials for a school-based growing season.', 'Madison Middle School', DATE '2027-01-23'),
    ('GreenHarvest Growers', 'Spring Garden Workday', 'Prepare community plots, repair tools, and distribute seeds to local growers.', 'Rexburg Community Garden', DATE '2027-03-20'),
    ('UnityServe Volunteers', 'Senior Home Visit Day', 'Prepare care packages and spend time with residents at a local senior center.', 'Rexburg Senior Center', DATE '2026-11-22'),
    ('UnityServe Volunteers', 'Winter Clothing Sort', 'Sort donated coats and winter clothing for distribution to families in need.', 'Community Resource Center, Rexburg', DATE '2026-12-13'),
    ('UnityServe Volunteers', 'Holiday Meal Delivery', 'Pack and deliver holiday meals to community members who cannot travel.', 'Rexburg, Idaho', DATE '2026-12-24'),
    ('UnityServe Volunteers', 'Youth Reading Partners', 'Read with elementary students and help them practice literacy skills.', 'Lincoln Elementary School', DATE '2027-01-30'),
    ('UnityServe Volunteers', 'Community Health Fair', 'Help local providers welcome visitors and organize health information booths.', 'Madison County Fairgrounds', DATE '2027-02-20')
) AS project_data(organization_name, title, description, location, project_date)
JOIN organization ON organization.name = project_data.organization_name;

-- ========================================
-- Service Project Category Tables
-- ========================================
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE project_category (
    project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(category_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- Insert sample data: Categories
-- ========================================
INSERT INTO category (name)
VALUES
    ('Community Improvement'),
    ('Food & Sustainability'),
    ('Education & Outreach'),
    ('Health & Support');

-- ========================================
-- Associate each service project with a category
-- ========================================
INSERT INTO project_category (project_id, category_id)
SELECT project.project_id, category.category_id
FROM (VALUES
    ('Neighborhood Park Renewal', 'Community Improvement'),
    ('Accessible Community Garden', 'Community Improvement'),
    ('Warm Homes Weatherization', 'Community Improvement'),
    ('Little Library Build', 'Community Improvement'),
    ('Community Center Refresh', 'Community Improvement'),
    ('Winter Seedling Workshop', 'Food & Sustainability'),
    ('Community Compost Day', 'Food & Sustainability'),
    ('Food Pantry Harvest', 'Food & Sustainability'),
    ('School Garden Planning', 'Education & Outreach'),
    ('Spring Garden Workday', 'Food & Sustainability'),
    ('Senior Home Visit Day', 'Health & Support'),
    ('Winter Clothing Sort', 'Health & Support'),
    ('Holiday Meal Delivery', 'Health & Support'),
    ('Youth Reading Partners', 'Education & Outreach'),
    ('Community Health Fair', 'Health & Support')
) AS project_category_data(project_title, category_name)
JOIN project ON project.title = project_category_data.project_title
JOIN category ON category.name = project_category_data.category_name;
