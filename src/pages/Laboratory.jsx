import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const Laboratory = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Laboratory
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Lab Tests</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage lab tests and results here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Laboratory; 