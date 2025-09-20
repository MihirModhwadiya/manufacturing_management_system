import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
`;

const Message = styled.div<{ type: 'success' | 'error' | 'loading' }>`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  
  ${props => props.type === 'success' && `
    color: #388e3c;
    background: #e8f5e8;
  `}
  
  ${props => props.type === 'error' && `
    color: #d32f2f;
    background: #ffebee;
  `}
  
  ${props => props.type === 'loading' && `
    color: #1976d2;
    background: #e3f2fd;
  `}
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Verify: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [message, setMessage] = useState<string>('Verifying your account...');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'loading'>('loading');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link.');
      setMessageType('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(`/api/auth/verify/${token}`);
        setMessage('Account verified successfully! You can now login.');
        setMessageType('success');
      } catch (err: any) {
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        setMessageType('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Container>
      <Title>Email Verification</Title>
      <Message type={messageType}>
        {message}
      </Message>
      {messageType === 'success' && (
        <StyledLink to="/login">Go to Login</StyledLink>
      )}
      {messageType === 'error' && (
        <StyledLink to="/signup">Back to Signup</StyledLink>
      )}
    </Container>
  );
};

export default Verify;