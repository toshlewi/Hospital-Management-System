import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const Reception = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reception
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Patient Check-ins</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage patient check-ins and appointments here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reception; 