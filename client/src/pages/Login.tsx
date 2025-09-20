import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const Form = styled.form`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: ${props => props.type === 'password' ? '3rem' : '0.75rem'};
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const ShowPasswordButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    color: #007bff;
  }
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
    margin: 0 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam === 'invalid-link') {
      setError('Invalid verification link.');
    } else if (errorParam === 'expired-link') {
      setError('Verification link has expired.');
    } else if (messageParam === 'verified') {
      setSuccess('Email verified successfully! You can now login.');
    } else if (messageParam === 'already-verified') {
      setSuccess('Account already verified. You can login.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (): string => {
    if (!form.email || !form.password) {
      return 'All fields are required.';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return 'Invalid email format.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Login</Title>
      {error && <Error>{error}</Error>}
      {success && <Success>{success}</Success>}
      <InputContainer>
        <Input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />
      </InputContainer>
      <InputContainer>
        <Input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <ShowPasswordButton
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </ShowPasswordButton>
      </InputContainer>
      <Button type="submit">Login</Button>
      <LinkContainer>
        <Link to="/forgot">Forgot Password?</Link>
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </LinkContainer>
    </Form>
  );
};

export default Login;