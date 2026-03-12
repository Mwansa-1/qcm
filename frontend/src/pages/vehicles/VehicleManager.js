import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Truck', 'Van', 'Bus'];
const STATUSES = ['Active', 'In Maintenance', 'Out of Service'];

const mockVehicles = [
  { id: 1, plate: 'ABC-1234', make: 'Toyota', model: 'Camry', year: 2022, type: 'Sedan', driver: 'James Brown', status: 'Active', mileage: '24,500 km' },
  { id: 2, plate: 'XYZ-5678', make: 'Ford', model: 'F-150', year: 2021, type: 'Truck', driver: 'Sarah Lee', status: 'In Maintenance', mileage: '48,200 km' },
  { id: 3, plate: 'DEF-9012', make: 'Honda', model: 'CR-V', year: 2023, type: 'SUV', driver: 'Mike Chen', status: 'Active', mileage: '12,100 km' },
  { id: 4, plate: 'GHI-3456', make: 'Mercedes', model: 'Sprinter', year: 2020, type: 'Van', driver: 'Unassigned', status: 'Out of Service', mileage: '87,400 km' },
];

const EMPTY_FORM = { plate: '', make: '', model: '', year: new Date().getFullYear(), type: 'Sedan', driver: '', status: 'Active', mileage: '0 km' };
const statusColor = { Active: 'success', 'In Maintenance': 'warning', 'Out of Service': 'error' };

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const stats = [
    { label: 'Total Fleet', value: vehicles.length, color: '#1976d2' },
    { label: 'Active', value: vehicles.filter((v) => v.status === 'Active').length, color: '#2e7d32' },
    { label: 'In Maintenance', value: vehicles.filter((v) => v.status === 'In Maintenance').length, color: '#ed6c02' },
    { label: 'Out of Service', value: vehicles.filter((v) => v.status === 'Out of Service').length, color: '#d32f2f' },
  ];

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (row) => { setEditTarget(row); setForm({ ...row }); setDialogOpen(true); };
  const openDelete = (row) => { setDeleteTarget(row); setConfirmOpen(true); };

  const handleSave = () => {
    if (editTarget) {
      setVehicles((prev) => prev.map((v) => (v.id === editTarget.id ? { ...v, ...form } : v)));
      setSnack({ open: true, message: 'Vehicle updated', severity: 'success' });
    } else {
      setVehicles((prev) => [...prev, { ...form, id: Date.now() }]);
      setSnack({ open: true, message: 'Vehicle added', severity: 'success' });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    setSnack({ open: true, message: 'Vehicle removed', severity: 'success' });
    setConfirmOpen(false);
  };

  const columns = [
    { field: 'plate', header: 'Plate' },
    { field: 'make', header: 'Make' },
    { field: 'model', header: 'Model' },
    { field: 'year', header: 'Year' },
    { field: 'type', header: 'Type' },
    { field: 'driver', header: 'Driver' },
    { field: 'mileage', header: 'Mileage' },
    { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
    {
      field: 'id', header: 'Actions',
      render: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row)}>Remove</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCarIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Vehicle Fleet</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Vehicle</Button>
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

      <DataTable columns={columns} rows={vehicles} title="Fleet Overview" />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[['plate', 'License Plate', 6], ['make', 'Make', 6], ['model', 'Model', 6], ['year', 'Year', 6], ['driver', 'Assigned Driver', 12], ['mileage', 'Mileage', 12]].map(([field, label, xs]) => (
              <Grid item xs={xs} key={field}>
                <TextField fullWidth label={label} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </Grid>
            ))}
            <Grid item xs={6}>
              <TextField select fullWidth label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} title="Remove Vehicle" message={`Remove ${deleteTarget?.plate}?`} onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} confirmLabel="Remove" />
      <NotificationSnackbar open={snack.open} message={snack.message} severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
