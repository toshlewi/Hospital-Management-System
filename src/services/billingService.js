import { api } from './api';

export const billingService = {
  // Billing Items
  getBillingItems: async () => {
    const response = await api.get('/billing/items');
    return response.data;
  },

  getBillingItemsByCategory: async (category) => {
    const response = await api.get(`/billing/items/category/${category}`);
    return response.data;
  },

  getPopularBillingItems: async () => {
    const response = await api.get('/billing/items/popular');
    return response.data;
  },

  // Bills
  getBills: async () => {
    const response = await api.get('/billing/bills');
    return response.data;
  },

  getBillById: async (billId) => {
    const response = await api.get(`/billing/bills/${billId}`);
    return response.data;
  },

  getBillsByPatient: async (patientId) => {
    const response = await api.get(`/billing/bills/patient/${patientId}`);
    return response.data;
  },

  createBill: async (billData) => {
    const response = await api.post('/billing/bills', billData);
    return response.data;
  },

  updateBillStatus: async (billId, status) => {
    const response = await api.patch(`/billing/bills/${billId}/status`, { status });
    return response.data;
  },

  searchBills: async (query, filters = {}) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/billing/bills/search?${params.toString()}`);
    return response.data;
  },

  generateBillPDF: async (billId) => {
    const response = await api.get(`/billing/bills/${billId}/pdf`);
    return response.data;
  },

  // Payments
  getPayments: async () => {
    const response = await api.get('/billing/payments');
    return response.data;
  },

  getPaymentsByBill: async (billId) => {
    const response = await api.get(`/billing/payments/bill/${billId}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post('/billing/payments', paymentData);
    return response.data;
  },

  // Dashboard
  getBillingSummary: async (period = 'today') => {
    const response = await api.get(`/billing/summary?period=${period}`);
    return response.data;
  },

  // Utility functions
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString();
  },

  getStatusColor: (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  }
}; 