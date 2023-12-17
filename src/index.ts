import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4, validate } from 'uuid';
import cors from 'cors';
import { User } from './types';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const users: User[] = [];

// Middleware to check if userId is a valid UUID

const validateUserId = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    
    // Check if userId is a valid UUID
    if (!validate(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    
    next();
  };

// Get all users

app.get('/api/users', (req: Request, res: Response) => {
  res.status(200).json(users);
});

// Get user by userId

app.get('/api/users/:userId', validateUserId, (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

// Create a new user
app.post('/api/users', (req: Request, res: Response) => {
  const { username, age, hobbies } = req.body;
  if (!username || !age) {
    return res.status(400).json({ error: 'Username and age are required fields' });
  }

  const newUser: User = {
    id: uuidv4(),
    username,
    age,
    hobbies: hobbies || [],
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

// Update an existing user
app.put('/api/users/:userId', validateUserId, (req: Request, res: Response) => {
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
app.delete('/api/users/:userId', validateUserId, (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);

  res.status(204).send();
});

// Handle non-existing endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Handle server errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
