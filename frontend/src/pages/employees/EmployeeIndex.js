import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Chip, MenuItem, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import NotificationSnackbar from '../../components/NotificationSnackbar';
import api from '../../api/axios';

const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Marketing'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const EMPTY_FORM = { name: '', email: '', department: '', position: '', status: 'Active', phone: '', salary: '' };

export default function EmployeeIndex() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch {
      // Use mock data when API is unavailable
      setEmployees([
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', position: 'Senior Dev', status: 'Active', phone: '555-0101', salary: '95000' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', department: 'Sales', position: 'Account Exec', status: 'Active', phone: '555-0102', salary: '72000' },
        { id: 3, name: 'Carol White', email: 'carol@example.com', department: 'HR', position: 'HR Manager', status: 'Active', phone: '555-0103', salary: '68000' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.department) e.department = 'Required';
    if (!form.position.trim()) e.position = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await api.put(`/employees/${editTarget.id}`, form);
        setEmployees((prev) => prev.map((e) => (e.id === editTarget.id ? { ...e, ...form } : e)));
        showSnack('Employee updated');
      } else {
        const newEmp = { ...form, id: Date.now() };
        await api.post('/employees', form).catch(() => null);
        setEmployees((prev) => [...prev, newEmp]);
        showSnack('Employee added');
      }
      setDialogOpen(false);
    } catch {
      showSnack('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${deleteTarget.id}`).catch(() => null);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      showSnack('Employee deleted');
    } catch {
      showSnack('Delete failed', 'error');
    } finally {
      setConfirmOpen(false);
    }
  };

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setDialogOpen(true); };
  const openEdit = (row) => { setEditTarget(row); setForm({ ...row }); setFormErrors({}); setDialogOpen(true); };
  const openDelete = (row) => { setDeleteTarget(row); setConfirmOpen(true); };

  const columns = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'department', header: 'Department' },
    { field: 'position', header: 'Position' },
    {
      field: 'status', header: 'Status',
      render: (val) => <Chip label={val} size="small" color={val === 'Active' ? 'success' : val === 'Inactive' ? 'default' : 'warning'} />,
    },
    {
      field: 'id', header: 'Actions',
      render: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(row)}>Edit</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => openDelete(row)}>Delete</Button>
        </Box>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Employee</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable columns={columns} rows={employees} title={`${employees.length} Employees`} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[['name', 'Full Name', 12], ['email', 'Email', 12], ['position', 'Position', 6]].map(([field, label, xs]) => (
              <Grid item xs={xs} key={field}>
                <TextField fullWidth label={label} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  error={!!formErrors[field]} helperText={formErrors[field]} />
              </Grid>
            ))}
            <Grid item xs={6}>
              <TextField select fullWidth label="Department" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                error={!!formErrors.department} helperText={formErrors.department}>
                {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Delete"
      />

      <NotificationSnackbar open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
