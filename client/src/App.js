import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Dropdown from 'react-bootstrap/Dropdown';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiPlusCircle } from "react-icons/fi";
import { LuDownload } from "react-icons/lu";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';

import Menu from '@mui/material/Menu';
import InputLabel from '@mui/material/InputLabel';
import { FormControl, useFormControlContext } from '@mui/base/FormControl';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 400,
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  mb: 2,
  gap: 4,
  borderRadius: 4,
  '& .MuiTextField-root': { mb: 2, width: '100%' }
};

const App = () => {
  const [nurses, setNurses] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState({});
  const [sortField, setSortField] = useState('id');
  const [isAscending, setIsAscending] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState(null);
  const [selectedDownloadClicked, setSelectedDownloadClicked] = useState(false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  useEffect(() => {
    fetchAndFilterData();
  }, [searchQuery, sortField, isAscending]);

  const fetchAndFilterData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/nurses');
      const filteredData = response.data.filter((nurse) => {
        return (
          nurse.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      const sortedData = sortData(filteredData, sortField, isAscending);
      setNurses(sortedData);
    } catch (error) {
      console.error('Error fetching nurses:', error);
    }
  };
  const handleSearchChange = () => {
    fetchAndFilterData();
  };

  const handleAddNurse = async (newNurse) => {
    try {
      console.log(newNurse)
      const response = await axios.post('http://localhost:3001/api/nurses', newNurse);
      setNurses([...nurses, response.data]);
      // setShowAddModal(false);
      handleClose()
      fetchAndFilterData();
    } catch (error) {
      console.error('Error adding nurse:', error);
    }
  };
  const EditNurse = async (nurse) => {
    setShowEditModal(true);
    setSelectedNurse(nurse);
  }
  const handleEditNurse = async (editedNurse) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/nurses/edit/${editedNurse.id}`, editedNurse);
      const updatedNurses = nurses.map((nurse) => (nurse.id === editedNurse.id ? response.data : nurse));
      setNurses(updatedNurses);
      setShowEditModal(false);
      fetchAndFilterData();
    } catch (error) {
      console.error('Error editing nurse:', error);
    }
  };

  const handleDeleteNurse = async (id) => {
    if (window.confirm('Are you sure you want to delete this nurse?')) {
      try {
        await axios.delete(`http://localhost:3001/api/nurses/${id}`);
        setNurses(nurses.filter((nurse) => nurse.id !== id));
        fetchAndFilterData();
      } catch (error) {
        console.error('Error deleting nurse:', error);
      }
    }
  };

  const handleSort = (field) => {
    setSortField(field);
    setIsAscending(!isAscending);
  };
  const prepareDataForExport = (data) => {
    const formattedData = data.map((nurse) => ({
      ID: nurse.id,
      Name: nurse.name,
      LicenseNumber: nurse.licenseNumber,
      DOB: nurse.dob,
      Age: nurse.age,
    }));

    return formattedData;
  };
  const handleFormatSelection = (selectedFormat) => {
    setSelectedDownloadFormat(selectedFormat);
    handleDownload(selectedFormat);
  };
  const handleDownload = (selectedDownloadFormat) => {
    const formattedData = prepareDataForExport(nurses);
    setSelectedDownloadClicked(true);
    console.log(formattedData)
    if (selectedDownloadFormat === 'csv') {
      const headerRow = ['S.No', 'Name', 'LicenseNumber', 'Date Of Birth', 'Age'];
      const csvData = [headerRow, ...formattedData.map((row) => Object.values(row).join(','))].join('\n');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'nurses.csv');
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else if (selectedDownloadFormat === 'excel') {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Nurse Data');
      XLSX.writeFile(workbook, 'nurses.xlsx');
    }
  };

  const sortData = (data, field, isAscending) => {
    return data.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      if (typeof valueA === 'string') {
        return isAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return isAscending ? valueA - valueB : valueB - valueA;
      }
    });
  };

  return (<>

    <div className="App-container">
      <h1 class="nurse-list">Nurse List</h1>
      <div className="search-bar row">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="col-md-2 d-flex justify-content-start align-items-center">
          <Button sx={{ color: 'green', bgcolor: '#dee2e6', fontWeight: '600' }} startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
            ADD
          </Button>
        </div>
        <div className="col-md-2 d-flex justify-content-end align-items-center">
          <Dropdown onClick={handleDownload}>
            <Dropdown.Toggle className='download-bt' variant="success" id="dropdown-basic">
              <LuDownload size={16} /> Download
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleFormatSelection('csv')}>Download as CSV</Dropdown.Item>
              <Dropdown.Item onClick={() => handleFormatSelection('excel')}>Download as Excel</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>S.No</th>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('licenseNumber')}>License Number</th>
            <th onClick={() => handleSort('dob')}>Date Of Birth</th>
            <th onClick={() => handleSort('age')}>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {nurses.map((nurse) => (
            <tr key={nurse.id}>
              <td>{nurse.id}</td>
              <td>{nurse.name}</td>
              <td>{nurse.licenseNumber}</td>
              <td>{nurse.dob}</td>
              <td>{nurse.age}</td>
              <td>
                <ButtonGroup
                  variant="text"
                >
                  <Button sx={{ color: '#ffc107', bgcolor: '#dee2e6', fontWeight: '600' }} startIcon={<BorderColorIcon />} onClick={() => EditNurse(nurse)}>
                    EDIT
                  </Button>
                  <Button sx={{ color: 'red', bgcolor: '#dee2e6', fontWeight: '600' }} endIcon={<DeleteForeverIcon />} onClick={() => handleDeleteNurse(nurse.id)}>
                    Delete
                  </Button>
                </ButtonGroup>
                {/* <Button className='Delete-Bt' onClick={() => handleDeleteNurse(nurse.id)}>
                  DELETE <MdDeleteForever size={16} />
                </Button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        handleAddNurse({
          name: e.target.name.value,
          licenseNumber: e.target.licenseNumber.value,
          dob: e.target.dob.value,
        });
      }} sx={style}>
        <FormControl >
          <h4 class="nurse-list">Add New</h4>
          <Grid>
            <TextField label="Name" name='name' size="large" id="outlined-size-normal" />
          </Grid>
          <Grid>
            <TextField label="License Number" name='licenseNumber' size="large" id="outlined-size-normal" />
          </Grid>
          <Grid>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker name="dob" />
              </DemoContainer>
            </LocalizationProvider>
          </Grid>
          <Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
          </Grid>
        </FormControl>
      </Box>
    </Modal>
    {/* <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add Nurse</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          handleAddNurse({
            name: e.target.name.value,
            licenseNumber: e.target.licenseNumber.value,
            dob: e.target.dob.value,
          });
        }}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" placeholder="Enter name" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>License Number</Form.Label>
            <Form.Control type="text" name="licenseNumber" placeholder="Enter license number" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date Of Birth</Form.Label>
            <Form.Control type="date" name="dob" placeholder="Enter date of birth" required />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Nurse</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => {
          e.preventDefault();
          console.log(selectedNurse)
          handleEditNurse({
            id: selectedNurse.id,
            name: e.target.name.value,
            licenseNumber: e.target.licenseNumber.value,
            dob: e.target.dob.value,
          });
        }}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" defaultValue={selectedNurse.name} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>License Number</Form.Label>
            <Form.Control
              type="text"
              name="licenseNumber"
              defaultValue={selectedNurse.licenseNumber}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date Of Birth</Form.Label>
            <Form.Control type="date" name="dob" defaultValue={selectedNurse.dob} required />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal> */}
  </>
  );
};

export default App;
