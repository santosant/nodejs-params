const express = require('express');
const { v4: uuidv4 } = require('uuid'); //id unico universal
const { v4: isUuid } = require('uuid');

const app = express();

app.use(express.json());

const projects = [];

function logRequests(request, response, next) {
    const { method, url } = request;

    /**
     * O método "toUppercase" precisa ser chamado sem os parênteses para que não 
     * apresente erro no insomnia, por exemplo
     * 
     * Antes:
     * const logLabel = `[${method.toUppercase()} ${url}]`;
     * 
     * Depois:
     * const logLabel = `[${method.toUppercase} ${url}]`;
     */

    const logLabel = `[${method.toUppercase} ${url}]`;

    console.time(logLabel);

    next(); // Próximo middleware

    console.timeEnd(logLabel);
}

function validateProjectId(request, response, next) {
    const { id } = request.params;

    if (!isUuid(id)) {
        return response.status(400).json({ error: 'Invalid project ID.' });
    }

    return next();
}

app.use(logRequests);
app.use('/projects/:id', validateProjectId);

app.get('/projects', (request, response) => {
    const { title } = request.query;

    const results = title ? projects.filter(project => project.title.includes(title)) : projects;

    return response.json(results);
});

app.post('/projects', (request, response) => {
    const { title, owner } = request.body;

    const project = { id: uuidv4(), title, owner };

    projects.push(project);

    return response.json(project);
});

app.put('/projects/:id', (request, response) => {
    const { id } = request.params;
    const { title, owner } = request.body;

    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: "Project not found." })
    }

    const project = {
        id,
        title,
        owner
    };

    projects[projectIndex] = project;

    return response.json(project);
});

app.delete('/projects/:id', (request, response) => {
    const { id } = request.params;

    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) {
        return response.status(400).json({ error: "Project not found." })
    }

    projects.splice(projectIndex, 1);

    return response.status(204).send();
});

app.listen(3333, () => {
    console.log('Back-end started!')
});