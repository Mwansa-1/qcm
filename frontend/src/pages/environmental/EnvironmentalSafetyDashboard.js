import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NatureIcon from '@mui/icons-material/Nature';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const incidents = [
  { id: 1, title: 'Chemical Spill - Lab B', type: 'Chemical', severity: 'High', date: '2024-01-10', reporter: 'Tom Wilson', status: 'Resolved' },
  { id: 2, title: 'Air Quality Alert', type: 'Air', severity: 'Medium', date: '2024-01-12', reporter: 'Sarah Kim', status: 'Open' },
  { id: 3, title: 'Waste Disposal Issue', type: 'Waste', severity: 'Low', date: '2024-01-14', reporter: 'John Davis', status: 'In Progress' },
];

const complianceItems = [
  { label: 'ISO 14001 Compliance', value: 94 },
  { label: 'Waste Management', value: 88 },
  { label: 'Emissions Control', value: 76 },
  { label: 'Water Usage', value: 91 },
  { label: 'Energy Efficiency', value: 83 },
];

const alerts = [
  { text: 'CO2 levels above threshold in Zone C', critical: true },
  { text: 'Monthly environmental report due in 3 days', critical: false },
  { text: 'All waste disposal permits up to date', critical: false },
];

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null;
}

export default function EnvironmentalSafetyDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Chemical', severity: 'Low', reporter: '' });
  const [snack, setSnack] = useState({ open: false, message: '' });

  const severityColor = { High: 'error', Medium: 'warning', Low: 'success' };
  const statusColor = { Resolved: 'success', Open: 'error', 'In Progress': 'warning' };

  const stats = [
    { label: 'Open Incidents', value: 2, color: '#d32f2f' },
    { label: 'Resolved This Month', value: 8, color: '#2e7d32' },
    { label: 'Compliance Score', value: '87%', color: '#1976d2' },
    { label: 'Active Alerts', value: 1, color: '#ed6c02' },
  ];

  const handleReport = () => {
    setSnack({ open: true, message: 'Incident reported successfully' });
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NatureIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Environmental Safety</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Report Incident</Button>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Environmental Incidents</Typography>
              <DataTable
                columns={[
                  { field: 'title', header: 'Title' },
                  { field: 'type', header: 'Type' },
                  { field: 'severity', header: 'Severity', render: (v) => <Chip label={v} size="small" color={severityColor[v] || 'default'} /> },
                  { field: 'date', header: 'Date' },
                  { field: 'reporter', header: 'Reporter' },
                  { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
                ]}
                rows={incidents}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Compliance Metrics</Typography>
              {complianceItems.map(({ label, value }) => (
                <Box key={label} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{value}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={value} color={value >= 90 ? 'success' : value >= 75 ? 'warning' : 'error'} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Alerts</Typography>
              <List dense>
                {alerts.map((a, i) => (
                  <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {a.critical ? <WarningIcon color="error" fontSize="small" /> : <CheckCircleIcon color="success" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary={a.text} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Report Environmental Incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Incident Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Chemical', 'Air', 'Water', 'Waste', 'Noise', 'Other'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {['Low', 'Medium', 'High', 'Critical'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Reporter Name" value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReport}>Report</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={snack.open} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
