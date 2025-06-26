import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    fetchPatientsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPatientsSuccess: (state, action) => {
      state.loading = false;
      state.patients = action.payload;
    },
    fetchPatientsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    addPatient: (state, action) => {
      state.patients.push(action.payload);
    },
    updatePatient: (state, action) => {
      const index = state.patients.findIndex(p => p.patient_id === action.payload.patient_id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    deletePatient: (state, action) => {
      state.patients = state.patients.filter(p => p.patient_id !== action.payload);
    }
  }
});

export const {
  fetchPatientsStart,
  fetchPatientsSuccess,
  fetchPatientsFailure,
  selectPatient,
  addPatient,
  updatePatient,
  deletePatient
} = patientSlice.actions;

export default patientSlice.reducer; 