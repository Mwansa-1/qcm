import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import DataTable from '../../components/DataTable';
import NotificationSnackbar from '../../components/NotificationSnackbar';

const templates = [
  { id: 1, name: 'Employment Contract', category: 'HR', version: 'v2.1', lastUpdated: '2024-01-10' },
  { id: 2, name: 'NDA Agreement', category: 'Legal', version: 'v1.3', lastUpdated: '2024-01-05' },
  { id: 3, name: 'Service Agreement', category: 'Operations', version: 'v3.0', lastUpdated: '2023-12-20' },
];

const documents = [
  { id: 1, title: 'Q4 2023 Employment Contracts', template: 'Employment Contract', status: 'Signed', createdAt: '2023-10-15', signatories: 3 },
  { id: 2, title: 'Vendor NDA - TechCorp', template: 'NDA Agreement', status: 'Pending Signature', createdAt: '2024-01-08', signatories: 1 },
  { id: 3, title: 'IT Services Agreement', template: 'Service Agreement', status: 'Draft', createdAt: '2024-01-12', signatories: 0 },
];

const statusColor = { Signed: 'success', 'Pending Signature': 'warning', Draft: 'default' };

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function LegalDocumentManager() {
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', template: '', notes: '' });
  const [snack, setSnack] = useState({ open: false, message: '' });

  const handleCreate = () => {
    setSnack({ open: true, message: 'Document created successfully' });
    setDialogOpen(false);
    setForm({ title: '', template: '', notes: '' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GavelIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Legal Documents</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>New Document</Button>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Templates" />
            <Tab label="Documents" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <DataTable
              columns={[
                { field: 'name', header: 'Template Name' },
                { field: 'category', header: 'Category', render: (v) => <Chip label={v} size="small" /> },
                { field: 'version', header: 'Version' },
                { field: 'lastUpdated', header: 'Last Updated' },
                {
                  field: 'id', header: 'Actions',
                  render: () => <Button size="small" variant="outlined">Use Template</Button>,
                },
              ]}
              rows={templates}
              title="Document Templates"
            />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <DataTable
              columns={[
                { field: 'title', header: 'Document Title' },
                { field: 'template', header: 'Template' },
                { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
                { field: 'createdAt', header: 'Created' },
                { field: 'signatories', header: 'Signatories' },
                {
                  field: 'id', header: 'Actions',
                  render: (_, row) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small">View</Button>
                      {row.status !== 'Signed' && <Button size="small" color="primary">Sign</Button>}
                    </Box>
                  ),
                },
              ]}
              rows={documents}
              title="All Documents"
            />
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Document Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Template" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} SelectProps={{ native: true }}>
                <option value="">Select template...</option>
                {templates.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Notes" multiline rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      <NotificationSnackbar open={snack.open} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
