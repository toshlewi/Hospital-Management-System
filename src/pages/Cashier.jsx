import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const Cashier = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cashier
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Billing</Typography>
              <Typography variant="body2" color="text.secondary">
                Handle billing and payments here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cashier; 