import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const records = [
  { id: 1, employee: 'Alice Johnson', type: 'Annual Checkup', date: '2024-01-10', doctor: 'Dr. Smith', result: 'Healthy', nextDue: '2025-01-10' },
  { id: 2, employee: 'Bob Smith', type: 'Injury Report', date: '2024-01-08', doctor: 'Dr. Johnson', result: 'Under Treatment', nextDue: '2024-02-08' },
  { id: 3, employee: 'Carol White', type: 'Vaccination', date: '2024-01-05', doctor: 'Dr. Davis', result: 'Completed', nextDue: '2025-01-05' },
];

const appointments = [
  { id: 1, employee: 'David Brown', type: 'Annual Checkup', scheduledDate: '2024-01-20', time: '10:00 AM', status: 'Scheduled' },
  { id: 2, employee: 'Emma Wilson', type: 'Follow-up', scheduledDate: '2024-01-22', time: '02:30 PM', status: 'Confirmed' },
];

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function MedicalRecordsDashboard() {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee: '', type: 'Annual Checkup', date: '', doctor: '' });
  const [snack, setSnack] = useState({ open: false, message: '' });

  const stats = [
    { label: 'Total Records', value: 312, color: '#1976d2' },
    { label: 'Healthy', value: 278, color: '#2e7d32' },
    { label: 'Under Treatment', value: 24, color: '#ed6c02' },
    { label: 'Upcoming Checkups', value: 18, color: '#9c27b0' },
  ];

  const resultColor = { Healthy: 'success', 'Under Treatment': 'warning', Completed: 'info' };
  const statusColor = { Scheduled: 'primary', Confirmed: 'success', Cancelled: 'error' };

  const handleAdd = () => {
    setSnack({ open: true, message: 'Medical record added' });
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Medical Records</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Add Record</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(({ label, value, color }) => (
          <Grid item xs={6} md={3} key={label}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={2}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Records" />
            <Tab label="Appointments" />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <DataTable
              columns={[
                { field: 'employee', header: 'Employee' },
                { field: 'type', header: 'Type' },
                { field: 'date', header: 'Date' },
                { field: 'doctor', header: 'Doctor' },
                { field: 'result', header: 'Result', render: (v) => <Chip label={v} size="small" color={resultColor[v] || 'default'} /> },
                { field: 'nextDue', header: 'Next Due' },
              ]}
              rows={records}
              title="Medical Records"
            />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <DataTable
              columns={[
                { field: 'employee', header: 'Employee' },
                { field: 'type', header: 'Appointment Type' },
                { field: 'scheduledDate', header: 'Date' },
                { field: 'time', header: 'Time' },
                { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
                {
                  field: 'id', header: 'Actions',
                  render: () => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small">Reschedule</Button>
                      <Button size="small" color="error">Cancel</Button>
                    </Box>
                  ),
                },
              ]}
              rows={appointments}
              title="Upcoming Appointments"
            />
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Medical Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Employee Name" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Record Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Annual Checkup', 'Injury Report', 'Vaccination', 'Follow-up'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={snack.open} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
