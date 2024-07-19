// src/components/AbsenceList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';

const AbsenceList = () => {
  const [absences, setAbsences] = useState([]);
  const [conflicts, setConflicts] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'ascending' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  //Fetching the first set of data
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('https://front-end-kata.brighthr.workers.dev/api/absences');
      setAbsences(result.data);
    };

    fetchData();
  }, []);

  //useEffect fetches conflict data for each absence once absences are loaded.
  useEffect(() => {
    const fetchConflicts = async () => {
      const conflictPromises = absences.map(absence =>
        axios.get(`https://front-end-kata.brighthr.workers.dev/api/conflict/${absence.id}`)
      );

      const conflictResults = await Promise.all(conflictPromises);

      const conflictsData = conflictResults.reduce((acc, conflict, index) => {
        acc[absences[index].id] = conflict.data.conflict;
        return acc;
      }, {});

      setConflicts(conflictsData);
    };

    if (absences.length > 0) {
      fetchConflicts();
    }
  }, [absences]);

  //sorting the data using key values and Manages the sorting configuration.
  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  //array sorts the absences based on the sortConfig.

  const sortedAbsences = [...absences].sort((a, b) => {
    if (sortConfig.key === 'employeeName') {
      const nameA = `${a.employee.firstName} ${a.employee.lastName}`;
      const nameB = `${b.employee.firstName} ${b.employee.lastName}`;
      if (nameA < nameB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (nameA > nameB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      if (dateA < dateB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (dateA > dateB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });

  //Tracks the currently selected employee for filtering.
  //filteredAbsences filters absences based on the selected employee.
  const filteredAbsences = selectedEmployee
    ? sortedAbsences.filter(absence => absence.employee.id === selectedEmployee.id)
    : sortedAbsences;

    //handleEmployeeClick sets the selected employee for filtering.
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  //handleBackClick resets the selected employee to show all absences.
  const handleBackClick = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="container mt-4">
      <h2>Absence List</h2>
      {selectedEmployee && (
        <div className="mb-3">
          <Button variant="secondary" onClick={handleBackClick}>
            Back to All Absences
          </Button>
        </div>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => sortData('startDate')}>Start Date</th>
            <th onClick={() => sortData('endDate')}>End Date</th>
            <th onClick={() => sortData('employeeName')}>Employee Name</th>
            <th onClick={() => sortData('approved')}>Status</th>
            <th onClick={() => sortData('absenceType')}>Absence Type</th>
            <th>Conflict</th>
          </tr>
        </thead>
        <tbody>
          {filteredAbsences.map((absence) => (
            <tr key={absence.id} className={conflicts[absence.id] ? 'table-danger' : ''}>
              <td>{new Date(absence.startDate).toLocaleDateString()}</td>
              <td>{new Date(new Date(absence.startDate).getTime() + absence.days * 86400000).toLocaleDateString()}</td>
              <td>
                <Button variant="link" onClick={() => handleEmployeeClick(absence.employee)}>
                  {absence.employee.firstName} {absence.employee.lastName}
                </Button>
              </td>
              <td>{absence.approved ? 'Approved' : 'Pending Approval'}</td>
              <td>{absence.absenceType}</td>
              <td>{conflicts[absence.id] ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AbsenceList;
