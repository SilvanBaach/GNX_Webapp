const request = require('supertest');
const app = require('../server');

describe('Express app tests', () => {
    it('should return a 200 status for the root route', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    // Add more tests for different routes and scenarios
});
