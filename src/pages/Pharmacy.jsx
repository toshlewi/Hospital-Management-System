import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const Pharmacy = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Pharmacy
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Prescriptions</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage prescriptions and inventory here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pharmacy; 