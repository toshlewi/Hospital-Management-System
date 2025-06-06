import React from 'react';

const DataTable = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>John Doe</td>
          <td>30</td>
          <td>Male</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jane Smith</td>
          <td>25</td>
          <td>Female</td>
        </tr>
      </tbody>
    </table>
  );
};

export default DataTable; 