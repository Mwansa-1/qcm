import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress, Link, Grid,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { register } from '../../store/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...payload } = form;
    const result = await dispatch(register(payload));
    if (!result.error) navigate('/');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <PersonAddIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight={700}>Create Account</Typography>
        <Typography variant="body2" color="text.secondary">Employee Management System</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth margin="normal" label="Full Name" autoComplete="name"
        value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} required
      />
      <TextField
        fullWidth margin="normal" label="Email Address" type="email" autoComplete="email"
        value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} required
      />
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth label="Password" type="password" autoComplete="new-password"
            value={form.password} onChange={set('password')} error={!!errors.password} helperText={errors.password} required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth label="Confirm Password" type="password"
            value={form.confirmPassword} onChange={set('confirmPassword')}
            error={!!errors.confirmPassword} helperText={errors.confirmPassword} required
          />
        </Grid>
      </Grid>

      <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">Sign In</Link>
        </Typography>
      </Box>
    </Box>
  );
}
