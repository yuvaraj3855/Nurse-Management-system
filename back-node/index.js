const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const port = 3001;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Chennai!43',
  database: 'nurses_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

const nurseSchema = Joi.object({
  name: Joi.string().required(),
  licenseNumber: Joi.string().required(),
  dob: Joi.date().required(),
});
app.get('/api/nurses', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Nurses');
    res.json(rows);
    // console.log(rows)
  } catch (error) {
    console.error('Error fetching nurses:', error);
    res.status(500).send('Internal Server Error');
  }
});
function calculateAge(dob) {
  if (!isValidDate(dob)) {
    throw new Error('Invalid date format. Please use DD/MM/YYYY format.');
  }
  console.log(dob)
  const [month, day, year] = dob.split('/');
  const dateOfBirth = new Date(`${year}-${month}-${day}`);
  console.log(dateOfBirth)
  const today = new Date();
  const ageDiffInMs = today.getTime() - dateOfBirth.getTime();
  const ageInYears = Math.floor(ageDiffInMs / (1000 * 60 * 60 * 24 * 365.25));
  return ageInYears;
}

function isValidDate(dateString) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(dateString);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
app.post('/api/nurses', async (req, res) => {
  try {
    const validationResult = nurseSchema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error.details[0].message);
    }
    const { name, licenseNumber, dob } = req.body;
    const age = calculateAge(dob);
    const formattedDob = formatDate(new Date(dob));
    console.log(`Age: ${age}`);
    console.log(`Formatted DOB: ${formattedDob}`);
    await pool.execute('INSERT INTO Nurses (name, licenseNumber, dob, age) VALUES (?, ?, ?, ?)', [name, licenseNumber, formattedDob, age]);
    res.send('Success');
  } catch (error) {
    console.error('Error adding/editing nurse:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/api/nurses/edit/:id', async (req, res) => {
  try {
    const { name, licenseNumber, dob } = req.body;
    const age = calculateAge(dob);
    const formattedDob = formatDate(new Date(dob));
    console.log(`Age: ${age}`);
    console.log(`Formatted DOB: ${formattedDob}`);
    await pool.execute('UPDATE Nurses SET name=?, licenseNumber=?, dob=?, age=? WHERE id=?', [name, licenseNumber, formattedDob, age, req.params.id]);

    res.send('Success');
  } catch (error) {
    console.error('Error adding/editing nurse:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.delete('/api/nurses/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    await pool.execute('DELETE FROM Nurses WHERE ID=?', [req.params.id]);
    res.send('Success');
  } catch (error) {
    console.error('Error deleting nurse:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
