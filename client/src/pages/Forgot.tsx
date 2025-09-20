import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Form = styled.form`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const Error = styled.div`
  color: #d32f2f;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
`;

const Success = styled.div`
  color: #388e3c;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #e8f5e8;
  border-radius: 4px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Description = styled.p`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const Forgot: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email is required.');
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Invalid email format.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/forgot', { email });
      setSuccess(response.data.message);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Forgot Password</Title>
      <Description>
        Enter your email address and we'll send you a link to reset your password.
      </Description>
      {error && <Error>{error}</Error>}
      {success && <Success>{success}</Success>}
      <Input
        name="email"
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      <LinkContainer>
        <Link to="/login">Back to Login</Link>
      </LinkContainer>
    </Form>
  );
};

export default Forgot;