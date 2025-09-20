import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

const Welcome = styled.div`
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #388e3c;
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  
  h3 {
    margin-top: 0;
    color: #333;
  }
  
  p {
    margin: 0.5rem 0;
    color: #666;
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
        <Button onClick={handleLogout}>Logout</Button>
      </Header>
      
      <Welcome>
        Welcome to your dashboard! You have successfully logged in.
      </Welcome>
      
      <UserInfo>
        <h3>Your Account Information</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </UserInfo>
    </Container>
  );
};

export default Dashboard;