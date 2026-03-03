import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SecurityIcon from '@mui/icons-material/Security';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const securityIDs = [
  { id: 1, employeeName: 'Alice Johnson', idNumber: 'SEC-2024-001', level: 'Level 3', issuedDate: '2024-01-01', expiryDate: '2025-01-01', status: 'Active' },
  { id: 2, employeeName: 'Bob Smith', idNumber: 'SEC-2024-002', level: 'Level 1', issuedDate: '2024-01-05', expiryDate: '2025-01-05', status: 'Active' },
  { id: 3, employeeName: 'Carol White', idNumber: 'SEC-2023-045', level: 'Level 2', issuedDate: '2023-03-15', expiryDate: '2024-03-15', status: 'Expired' },
];

const accessLogs = [
  { id: 1, employee: 'Alice Johnson', location: 'Server Room', action: 'Entry', timestamp: '2024-01-15 09:23:14', result: 'Granted' },
  { id: 2, employee: 'Bob Smith', location: 'Finance Office', action: 'Entry', timestamp: '2024-01-15 09:45:02', result: 'Denied' },
  { id: 3, employee: 'Carol White', location: 'Main Entrance', action: 'Entry', timestamp: '2024-01-15 08:55:30', result: 'Granted' },
];

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function SecurityIDManager() {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employeeName: '', level: 'Level 1', expiryDate: '' });
  const [snack, setSnack] = useState({ open: false, message: '' });

  const stats = [
    { label: 'Total IDs', value: 156, color: '#1976d2' },
    { label: 'Active', value: 142, color: '#2e7d32' },
    { label: 'Expired', value: 10, color: '#d32f2f' },
    { label: 'Expiring Soon', value: 4, color: '#ed6c02' },
  ];

  const handleIssue = () => {
    setSnack({ open: true, message: 'Security ID issued successfully' });
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Security ID Manager</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Issue ID</Button>
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
            <Tab label="Security IDs" />
            <Tab label="Access Logs" />
          </Tabs>
          <TabPanel value={tab} index={0}>
            <DataTable
              columns={[
                { field: 'employeeName', header: 'Employee' },
                { field: 'idNumber', header: 'ID Number' },
                { field: 'level', header: 'Access Level', render: (v) => <Chip label={v} size="small" /> },
                { field: 'issuedDate', header: 'Issued' },
                { field: 'expiryDate', header: 'Expires' },
                { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={v === 'Active' ? 'success' : 'error'} /> },
                {
                  field: 'id', header: 'Actions',
                  render: () => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small">Renew</Button>
                      <Button size="small" color="error">Revoke</Button>
                    </Box>
                  ),
                },
              ]}
              rows={securityIDs}
            />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <DataTable
              columns={[
                { field: 'timestamp', header: 'Timestamp' },
                { field: 'employee', header: 'Employee' },
                { field: 'location', header: 'Location' },
                { field: 'action', header: 'Action' },
                { field: 'result', header: 'Result', render: (v) => <Chip label={v} size="small" color={v === 'Granted' ? 'success' : 'error'} /> },
              ]}
              rows={accessLogs}
            />
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Issue Security ID</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Employee Name" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Access Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} SelectProps={{ native: true }}>
                {['Level 1', 'Level 2', 'Level 3', 'Level 4'].map((l) => <option key={l} value={l}>{l}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleIssue}>Issue</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={snack.open} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
