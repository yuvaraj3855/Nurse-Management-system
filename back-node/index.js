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
  
  const [day, month, year] = dob.split('-');
  const dateOfBirth = new Date(`${year}-${month}-${day}`);
  
  const today = new Date();
  const ageDiffInMs = today.getTime() - dateOfBirth.getTime();
  const ageInYears = Math.floor(ageDiffInMs / (1000 * 60 * 60 * 24 * 365.25));
  
  return ageInYears;
}



function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
app.post('/api/nurses', async (req, res) => {
  try {
    const { name, licenseNumber, dob } = req.body;
    const age = calculateAge(dob);
    // const formattedDob = formatDate(new Date(dob));
    console.log(`Age: ${age}`);
    // console.log(`Formatted DOB: ${formattedDob}`);
    await pool.execute('INSERT INTO Nurses (name, licenseNumber, dob, age) VALUES (?, ?, ?, ?)', [name, licenseNumber, dob, age]);
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
    // const formattedDob = formatDate(new Date(dob));
    console.log(`Age: ${age}`);
    // console.log(`Formatted DOB: ${formattedDob}`);
    await pool.execute('UPDATE Nurses SET name=?, licenseNumber=?, dob=?, age=? WHERE id=?', [name, licenseNumber, dob, age, req.params.id]);

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
