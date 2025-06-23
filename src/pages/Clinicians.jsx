import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 80px; /* Avoid overlap with the header */
  background-color: #f5f9fc;
  min-height: 100vh;
`;

const Header = styled.h2`
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #3498db;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: #e6f2fa;
  }

  &.active {
    background-color: #3498db;
    color: white;
    border: 1px solid #2980b9;
  }
`;

const Clinicians = () => {
  return (
    <Container>
      <Header>Clinician Module</Header>
      <Nav>
        <NavLink to="/clinicians/outpatient">Outpatient</NavLink>
        <NavLink to="/clinicians/inpatient">Inpatient</NavLink>
      </Nav>
    </Container>
  );
};

export default Clinicians;