import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert,
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const backups = [
  { id: 1, name: 'Full Backup - Jan 15', type: 'Full', size: '4.2 GB', duration: '45 min', status: 'Success', createdAt: '2024-01-15 02:00', retention: '30 days' },
  { id: 2, name: 'Incremental - Jan 16', type: 'Incremental', size: '312 MB', duration: '5 min', status: 'Success', createdAt: '2024-01-16 02:00', retention: '7 days' },
  { id: 3, name: 'Full Backup - Jan 08', type: 'Full', size: '4.0 GB', duration: '43 min', status: 'Success', createdAt: '2024-01-08 02:00', retention: '30 days' },
  { id: 4, name: 'Incremental - Jan 12', type: 'Incremental', size: '0 MB', duration: '0 min', status: 'Failed', createdAt: '2024-01-12 02:00', retention: '-' },
];

const schedules = [
  { id: 1, name: 'Nightly Incremental', type: 'Incremental', frequency: 'Daily at 02:00', nextRun: '2024-01-17 02:00', retention: '7 days', enabled: true },
  { id: 2, name: 'Weekly Full', type: 'Full', frequency: 'Every Monday at 01:00', nextRun: '2024-01-22 01:00', retention: '30 days', enabled: true },
  { id: 3, name: 'Monthly Archive', type: 'Full', frequency: '1st of month at 00:00', nextRun: '2024-02-01 00:00', retention: '1 year', enabled: false },
];

export default function BackupManagementDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Full', target: '/backups' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [running, setRunning] = useState(false);

  const stats = [
    { label: 'Total Backups', value: backups.length, color: '#1976d2' },
    { label: 'Success Rate', value: '92%', color: '#2e7d32' },
    { label: 'Storage Used', value: '18.4 GB', color: '#ed6c02' },
    { label: 'Last Backup', value: '14h ago', color: '#9c27b0' },
  ];

  const storageItems = [
    { label: 'Database Backups', used: 12.4, total: 30 },
    { label: 'File Backups', used: 4.2, total: 20 },
    { label: 'Config Backups', used: 1.8, total: 10 },
  ];

  const handleRunNow = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setSnack({ open: true, message: 'Backup completed successfully', severity: 'success' });
    }, 2000);
  };

  const handleSchedule = () => {
    setSnack({ open: true, message: 'Backup scheduled', severity: 'success' });
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BackupIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Backup Management</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleRunNow} disabled={running}>
            {running ? 'Running...' : 'Run Now'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Schedule</Button>
        </Box>
      </Box>

      {running && <Alert severity="info" sx={{ mb: 2 }}>Backup in progress...</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(({ label, value, color }) => (
          <Grid item xs={6} md={3} key={label}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Backup History</Typography>
              <DataTable
                columns={[
                  { field: 'name', header: 'Backup Name' },
                  { field: 'type', header: 'Type', render: (v) => <Chip label={v} size="small" variant="outlined" /> },
                  { field: 'size', header: 'Size' },
                  { field: 'duration', header: 'Duration' },
                  { field: 'createdAt', header: 'Created' },
                  { field: 'retention', header: 'Retention' },
                  {
                    field: 'status', header: 'Status',
                    render: (v) => <Chip label={v} size="small" color={v === 'Success' ? 'success' : 'error'}
                      icon={v === 'Success' ? <CheckCircleIcon /> : <ErrorIcon />} />,
                  },
                  {
                    field: 'id', header: 'Actions',
                    render: (_, row) => row.status === 'Success' ? <Button size="small">Restore</Button> : null,
                  },
                ]}
                rows={backups}
              />
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Scheduled Backups</Typography>
              <DataTable
                columns={[
                  { field: 'name', header: 'Schedule Name' },
                  { field: 'type', header: 'Type' },
                  { field: 'frequency', header: 'Frequency' },
                  { field: 'nextRun', header: 'Next Run' },
                  { field: 'retention', header: 'Retention' },
                  { field: 'enabled', header: 'Status', render: (v) => <Chip label={v ? 'Enabled' : 'Disabled'} size="small" color={v ? 'success' : 'default'} /> },
                ]}
                rows={schedules}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StorageIcon color="primary" />
                <Typography variant="h6">Storage Usage</Typography>
              </Box>
              <List>
                {storageItems.map(({ label, used, total }) => (
                  <ListItem key={label} disablePadding sx={{ mb: 2, display: 'block' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="body2" color="text.secondary">{used} / {total} GB</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(used / total) * 100}
                      color={(used / total) > 0.8 ? 'error' : (used / total) > 0.6 ? 'warning' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Backup</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Schedule Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Backup Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Full', 'Incremental', 'Differential'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Target Path" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSchedule}>Schedule</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
