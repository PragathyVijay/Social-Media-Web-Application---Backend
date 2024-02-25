const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');

// Enable CORS middleware
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password :'root123',
    database :'SocialMedia'
});

// Create the users table if not exists
db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dob DATE NOT NULL
)`, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log("User table created successfully");
    }
});

// Route for user registration
app.post('/register', (req, res) => {
    const { username, password, fullName, email, dob } = req.body;

    db.query(
        'INSERT INTO users (username, password, fullName, email, dob) VALUES (?, ?, ?, ?, ?)',
        [username, password, fullName, email, dob],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error registering user');
            } else {
                console.log('User registered successfully');
                res.status(201).send('User registered successfully');
            }
        }
    );
});

// Route for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length > 0) {
                    const userId = result[0].id; 
                    res.status(200).json({ message: 'Login Successful', userId: userId });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        }
    );
});

// Route for creating a new post
app.post('/posts', (req, res) => {
    const { userId, content } = req.body;
    if (!userId || !content) {
        return res.status(400).send('Missing userId or content');
    }
    const query = 'INSERT INTO posts (userId, content) VALUES (?, ?)';
    db.query(query, [userId, content], (err, result) => {
      if (err) {
        console.error('Error creating post:', err);
        res.status(500).send('Error creating post');
      } else {
        console.log('Post created successfully');
        res.status(201).send('Post created successfully');
      }
    });
});
  
// Route for fetching all posts
app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
      } else {
        res.status(200).json(result);
      }
    });
});

// Route for fetching friends
// Route for fetching friends
app.get('/friends/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT u.id, u.fullName AS name 
        FROM users u 
        LEFT JOIN friends f ON u.id = f.friendId AND f.userId = ?
        WHERE f.friendId IS NULL AND u.id != ?
    `;
    db.query(query, [userId, userId], (err, result) => {
        if (err) {
            console.error('Error fetching non-friend users:', err);
            res.status(500).send('Error fetching non-friend users');
        } else {
            res.status(200).json(result);
        }
    });
});


// Route for deleting a post
app.delete('/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    const query = 'DELETE FROM posts WHERE id = ?';
    db.query(query, [postId], (err, result) => {
        if (err) {
            console.error('Error deleting post:', err);
            res.status(500).send('Error deleting post');
        } else {
            console.log('Post deleted successfully');
            res.status(200).send('Post deleted successfully');
        }
    });
});


// Start the backend server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
