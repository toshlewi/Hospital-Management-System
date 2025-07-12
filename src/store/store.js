import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import patientReducer from './reducers/patientReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientReducer
  }
});

export default store; 