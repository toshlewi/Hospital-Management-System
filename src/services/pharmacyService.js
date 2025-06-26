import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/pharmacy';

const pharmacyService = {
  getAllDrugs: async () => {
    const res = await axios.get(`${API_BASE_URL}/stock`);
    return res.data;
  },
  addDrug: async (drug) => {
    const res = await axios.post(`${API_BASE_URL}/stock`, drug);
    return res.data;
  },
  restockDrug: async (drug_id, quantity_added) => {
    const res = await axios.put(`${API_BASE_URL}/stock/${drug_id}/restock`, { quantity_added });
    return res.data;
  },
  dispenseDrug: async (drug_id, quantity_dispensed, prescription_id) => {
    const res = await axios.post(`${API_BASE_URL}/stock/${drug_id}/dispense`, { quantity_dispensed, prescription_id });
    return res.data;
  },
  getActivePrescriptions: async () => {
    const res = await axios.get(`${API_BASE_URL}/prescriptions/active`);
    return res.data;
  }
};

export default pharmacyService; 