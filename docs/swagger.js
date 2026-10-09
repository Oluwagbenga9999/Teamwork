const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Teamwork API',
        version: '1.0.0',
        description: 'Internal social network for employees',
    },
    servers: [{ url: '/api/v1' }],
    components: {
        securitySchemes: {
            tokenAuth: { type: 'apiKey', in: 'header', name: 'token' },
        },
    },
    paths: {
        '/auth/create-user': {
            post: {
                summary: 'Create an employee user account (admin only)',
                tags: ['Auth'],
                security: [{ tokenAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['firstName', 'email', 'password'],
                                properties: {
                                    firstName: { type: 'string', example: 'Ada' },
                                    email: { type: 'string', example: 'ada@test.com' },
                                    password: { type: 'string', example: 'secret123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'User account successfully created' },
                    400: { description: 'Missing required fields' },
                    401: { description: 'Missing or invalid token' },
                    403: { description: 'Only an admin can perform this action' },
                    409: { description: 'Email already exists' },
                },
            },
        },
        '/auth/signin': {
            post: {
                summary: 'Sign in and receive a token',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'ada@test.com' },
                                    password: { type: 'string', example: 'secret123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Returns a token and userId' },
                    401: { description: 'Invalid email or password' },
                },
            },
        },
        '/articles': {
            post: {
                summary: 'Create an article',
                tags: ['Articles'],
                security: [{ tokenAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'article'],
                                properties: {
                                    title: { type: 'string', example: 'My first article' },
                                    article: { type: 'string', example: 'Hello team' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Article successfully posted' },
                    400: { description: 'title and article are required' },
                    401: { description: 'Missing or invalid token' },
                },
            },
        },
        '/articles/{articleId}': {
            get: {
                summary: 'View a specific article',
                tags: ['Articles'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'articleId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'The article with its comments' },
                    400: { description: 'Invalid article id' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Article not found' },
                },
            },
            patch: {
                summary: 'Update a specific article',
                tags: ['Articles'],
                security: [{ tokenAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'article'],
                                properties: {
                                    title: { type: 'string', example: 'My first article' },
                                    article: { type: 'string', example: 'Hello team' },
                                },
                            },
                        },
                    },
                },
                parameters: [
                    { name: 'articleId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Article successfully updated' },
                    400: { description: 'Invalid id, or title and article are required' },
                    401: { description: 'Missing or invalid token' },
                    403: { description: 'You can only edit your own articles' },
                    404: { description: 'Article not found' },
                },
            },
            delete: {
                summary: 'Delete a specific article',
                tags: ['Articles'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'articleId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Article successfully deleted' },
                    400: { description: 'Invalid  article id' },
                    401: { description: 'Missing or invalid token' },
                    403: { description: 'You can only delete your own articles' },
                    404: { description: 'Article not found' },
                },
            }
        },
        '/articles/{articleId}/comment': {
            post: {
                summary: 'Comment on an article',
                tags: ['Articles'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'articleId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['comment'],
                                properties: {
                                    comment: { type: 'string', example: 'Great post!' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Comment successfully created' },
                    400: { description: 'Invalid id, or comment is required' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Article not found' },
                },
            },
        },
        '/gifs': {
            post: {
                summary: 'Upload a gif',
                tags: ['Gifs'],
                security: [{ tokenAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['title', 'image'],
                                properties: {
                                    title: { type: 'string', example: 'Funny gif' },
                                    image: { type: 'string', format: 'binary' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'GIF image successfully posted' },
                    400: { description: 'Missing title or image, or the file is not a GIF' },
                    401: { description: 'Missing or invalid token' },
                },
            },
        },
        '/gifs/{gifId}': {
            get: {
                summary: 'View a specific gif',
                tags: ['Gifs'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'gifId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'The gif with its comments' },
                    400: { description: 'Invalid gif id' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Gif not found' },
                },
            },
            delete: {
                summary: 'Delete a specific gif',
                tags: ['Gifs'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'gifId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Gif post successfully deleted' },
                    400: { description: 'Invalid gif id' },
                    401: { description: 'Missing or invalid token' },
                    403: { description: 'You can only delete your own gifs' },
                    404: { description: 'Gif not found' },
                },
            },
        },

        '/gifs/{gifId}/comment': {
            post: {
                summary: 'Comment on a gif',
                tags: ['Gifs'],
                security: [{ tokenAuth: [] }],
                parameters: [
                    { name: 'gifId', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['comment'],
                                properties: {
                                    comment: { type: 'string', example: 'Haha!' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Comment successfully created' },
                    400: { description: 'Invalid id, or comment is required' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Gif not found' },
                },
            },
        },

        '/feed': {
            get: {
                summary: 'View all articles and gifs, newest first',
                tags: ['Feed'],
                security: [{ tokenAuth: [] }],
                responses: {
                    200: { description: 'A list of articles and gifs, most recent first' },
                    401: { description: 'Missing or invalid token' },
                },
            },
        },
    },
};

export default swaggerSpec;