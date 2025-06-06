import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';

const PatientForm = ({ patient, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: patient || {
      firstName: '',
      lastName: '',
      dob: '',
      gender: '',
      address: '',
      phone: '',
      email: '',
      insurance: ''
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {patient ? 'Edit Patient' : 'Add New Patient'}
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('dob', { required: 'Date of birth is required' })}
              error={!!errors.dob}
              helperText={errors.dob?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gender"
              select
              SelectProps={{ native: true }}
              {...register('gender', { required: 'Gender is required' })}
              error={!!errors.gender}
              helperText={errors.gender?.message}
            >
              <option value=""></option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              {...register('address')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              {...register('phone')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Insurance Information"
              {...register('insurance')}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              {patient ? 'Update' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PatientForm;