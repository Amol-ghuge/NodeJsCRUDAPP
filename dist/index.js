"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const users = [];
// Middleware to check if userId is a valid UUID
const validateUserId = (req, res, next) => {
    const userId = req.params.userId;
    // Check if userId is a valid UUID
    if (!(0, uuid_1.validate)(userId)) {
        return res.status(400).json({ error: 'Invalid userId format' });
    }
    next();
};
// Get all users
app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});
// Get user by userId
app.get('/api/users/:userId', validateUserId, (req, res) => {
    const userId = req.params.userId;
    const user = users.find((u) => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
});
// Create a new user
app.post('/api/users', (req, res) => {
    const { username, age, hobbies } = req.body;
    if (!username || !age) {
        return res.status(400).json({ error: 'Username and age are required fields' });
    }
    const newUser = {
        id: (0, uuid_1.v4)(),
        username,
        age,
        hobbies: hobbies || [],
    };
    users.push(newUser);
    res.status(201).json(newUser);
});
// Update an existing user
app.put('/api/users/:userId', validateUserId, (req, res) => {
    const userId = req.params.userId;
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    const { username, age, hobbies } = req.body;
    if (!username || !age) {
        return res.status(400).json({ error: 'Username and age are required fields' });
    }
    users[userIndex] = {
        ...users[userIndex],
        username,
        age,
        hobbies: hobbies || [],
    };
    res.status(200).json(users[userIndex]);
});
// Delete an existing user
app.delete('/api/users/:userId', validateUserId, (req, res) => {
    const userId = req.params.userId;
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    users.splice(userIndex, 1);
    res.status(204).send();
});
// Handle non-existing endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Handle server errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
