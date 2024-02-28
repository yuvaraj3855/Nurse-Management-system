import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Dropdown from 'react-bootstrap/Dropdown';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiPlusCircle } from "react-icons/fi";
import { LuDownload } from "react-icons/lu";
import { BiSolidEditAlt } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";

const App = () => {
  const [nurses, setNurses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState({});
  const [sortField, setSortField] = useState('id');
  const [isAscending, setIsAscending] = useState(true); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState(null);
  const [selectedDownloadClicked, setSelectedDownloadClicked] = useState(false);


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
      setShowAddModal(false);
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
          <Button className="add-button" onClick={() => setShowAddModal(true)}>
            <FiPlusCircle size={16} /> ADD
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
                <Button className='Edit-Bt' onClick={() => EditNurse(nurse)}>
                <BiSolidEditAlt size={16}/> EDIT
                </Button>
                <Button variant="danger" onClick={() => handleDeleteNurse(nurse.id)}>
                DELETE <MdDeleteForever size={16}/>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
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
    </Modal>
  </>
  );
};

export default App;
