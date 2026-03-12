import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid, Chip, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable from '../../components/DataTable';

const accounts = [
  { id: 1, code: '1001', name: 'Cash', type: 'Asset', balance: '$125,400' },
  { id: 2, code: '2001', name: 'Accounts Payable', type: 'Liability', balance: '$34,200' },
  { id: 3, code: '3001', name: 'Retained Earnings', type: 'Equity', balance: '$287,000' },
  { id: 4, code: '4001', name: 'Revenue', type: 'Revenue', balance: '$540,000' },
  { id: 5, code: '5001', name: 'Operating Expenses', type: 'Expense', balance: '$198,700' },
];

const journals = [
  { id: 1, date: '2024-01-15', ref: 'JE-001', description: 'Payroll Processing', debit: '$45,200', credit: '$45,200', status: 'Posted' },
  { id: 2, date: '2024-01-18', ref: 'JE-002', description: 'Office Supplies', debit: '$1,200', credit: '$1,200', status: 'Posted' },
  { id: 3, date: '2024-01-22', ref: 'JE-003', description: 'Client Invoice', debit: '$12,000', credit: '$12,000', status: 'Draft' },
];

const invoices = [
  { id: 1, number: 'INV-2024-001', client: 'Acme Corp', amount: '$12,000', due: '2024-02-15', status: 'Pending' },
  { id: 2, number: 'INV-2024-002', client: 'TechStart Inc', amount: '$8,500', due: '2024-02-20', status: 'Paid' },
  { id: 3, number: 'INV-2024-003', client: 'Global Solutions', amount: '$22,000', due: '2024-01-30', status: 'Overdue' },
];

const statusColor = { Posted: 'success', Draft: 'warning', Pending: 'warning', Paid: 'success', Overdue: 'error' };

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function FinancialDashboard() {
  const [tab, setTab] = useState(0);

  const summaryCards = [
    { label: 'Total Assets', value: '$1.24M', color: '#1976d2' },
    { label: 'Total Liabilities', value: '$340K', color: '#d32f2f' },
    { label: 'Net Revenue', value: '$540K', color: '#2e7d32' },
    { label: 'Operating Expenses', value: '$198.7K', color: '#ed6c02' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Financial Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>New Transaction</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(({ label, value, color }) => (
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

      <Card elevation={2}>
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Chart of Accounts" />
            <Tab label="Journal Entries" />
            <Tab label="Invoices" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <DataTable
              columns={[
                { field: 'code', header: 'Code' },
                { field: 'name', header: 'Account Name' },
                { field: 'type', header: 'Type', render: (v) => <Chip label={v} size="small" /> },
                { field: 'balance', header: 'Balance' },
              ]}
              rows={accounts}
            />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <DataTable
              columns={[
                { field: 'date', header: 'Date' },
                { field: 'ref', header: 'Reference' },
                { field: 'description', header: 'Description' },
                { field: 'debit', header: 'Debit' },
                { field: 'credit', header: 'Credit' },
                { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
              ]}
              rows={journals}
            />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <DataTable
              columns={[
                { field: 'number', header: 'Invoice #' },
                { field: 'client', header: 'Client' },
                { field: 'amount', header: 'Amount' },
                { field: 'due', header: 'Due Date' },
                { field: 'status', header: 'Status', render: (v) => <Chip label={v} size="small" color={statusColor[v] || 'default'} /> },
              ]}
              rows={invoices}
            />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
