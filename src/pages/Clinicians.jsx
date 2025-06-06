import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const Clinicians = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clinicians
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Patient Records</Typography>
              <Typography variant="body2" color="text.secondary">
                Access patient records and manage treatments here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Clinicians; 