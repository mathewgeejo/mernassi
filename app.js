// Task1: initiate app and run server at 3000
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve React build files
app.use(express.static(path.join(__dirname, 'client/build')));
// Fallback to existing dist folder
app.use(express.static(path.join(__dirname, 'dist/FrontEnd')));
// Task2: create mongoDB connection 
const mongoURI = process.env.MONGO_URI;

// Handle MongoDB connection
if (mongoURI) {
    mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    }).catch((error) => {
        console.error('MongoDB connection error:', error.message);
        console.log('Server will continue without database connection...');
    });
} else {
    console.log('No MongoDB URI provided. Server will run without database connection.');
}

// Employee Schema
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    }
});

const Employee = mongoose.model('Employee', employeeSchema);


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

// Middleware to check database connection
const checkDatabaseConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            error: 'Database not connected', 
            message: 'Please check your MongoDB connection and try again' 
        });
    }
    next();
};

// Apply database check middleware to all API routes
app.use('/api', checkDatabaseConnection);







//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        
        if (!name || !location || !position || !salary) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const newEmployee = new Employee({
            name,
            location,
            position,
            salary
        });
        
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});






//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully', employee: deletedEmployee });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist/:id', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        
        if (!name || !location || !position || !salary) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );
        
        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//! dont delete this code. it connects the front end file.
// Serve React app for any non-API routes
app.get('/', function (req, res) {
    // Check if React build exists, otherwise fallback to dist folder
    const reactIndex = path.join(__dirname, 'client/build/index.html');
    const distIndex = path.join(__dirname, 'dist/Frontend/index.html');
    
    // Try to serve React build first
    if (fs.existsSync(reactIndex)) {
        res.sendFile(reactIndex);
    } else if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
    } else {
        res.send('<h1>Welcome to Employee Management System</h1><p>Please build the frontend or start the React development server.</p>');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


