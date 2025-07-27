import { api } from './api.js';

const pharmacyService = {
  getAllDrugs: async () => {
    const res = await api.get('/pharmacy/stock');
    return res.data;
  },
  addDrug: async (drug) => {
    const res = await api.post('/pharmacy/stock', drug);
    return res.data;
  },
  restockDrug: async (drug_id, quantity_added) => {
    const res = await api.put(`/pharmacy/stock/${drug_id}/restock`, { quantity_added });
    return res.data;
  },
  dispenseDrug: async (drug_id, quantity_dispensed, prescription_id) => {
    const res = await api.post(`/pharmacy/stock/${drug_id}/dispense`, { quantity_dispensed, prescription_id });
    return res.data;
  },
  getActivePrescriptions: async () => {
    const res = await api.get('/pharmacy/prescriptions/active');
    return res.data;
  }
};

export default pharmacyService; 