const dbService = require('../services/database.js');

// Get all billing items (pricing catalog)
exports.getBillingItems = async (req, res) => {
    try {
        const items = await dbService.getBillingItems();
        res.json(items);
    } catch (error) {
        console.error('Error fetching billing items:', error);
        res.status(500).json({ message: 'Error fetching billing items', error: error.message });
    }
};

// Get billing items by category
exports.getBillingItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { data, error } = await dbService.supabase
            .from('billing_items')
            .select('*')
            .eq('category', category)
            .eq('is_active', true)
            .order('name', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching billing items by category:', error);
        res.status(500).json({ message: 'Error fetching billing items', error: error.message });
    }
};

// Create a new bill
exports.createBill = async (req, res) => {
    try {
        const {
            patient_id,
            bill_items,
            due_date,
            notes,
            tax_amount = 0,
            discount_amount = 0
        } = req.body;

        // Validate required fields
        if (!patient_id || !bill_items || bill_items.length === 0) {
            return res.status(400).json({ message: 'Patient ID and bill items are required' });
        }

        // Create the bill
        const billData = {
            patient_id,
            due_date: due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            tax_amount,
            discount_amount,
            notes,
            status: 'pending'
        };

        const bill = await dbService.createBill(billData);

        // Add bill items
        for (const item of bill_items) {
            const billItemData = {
                bill_id: bill.bill_id,
                item_id: item.item_id,
                item_name: item.name,
                quantity: item.quantity || 1,
                unit_price: item.price,
                total_price: (item.price * (item.quantity || 1)),
                notes: item.notes
            };
            await dbService.createBillItem(billItemData);
        }

        // Get the complete bill with items
        const completeBill = await dbService.getBillById(bill.bill_id);
        res.status(201).json(completeBill);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: 'Error creating bill', error: error.message });
    }
};

// Get all bills
exports.getBills = async (req, res) => {
    try {
        const bills = await dbService.getBills();
        res.json(bills);
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ message: 'Error fetching bills', error: error.message });
    }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
    try {
        const { billId } = req.params;
        const bill = await dbService.getBillById(billId);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        
        res.json(bill);
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
};

// Get bills by patient ID
exports.getBillsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { data, error } = await dbService.supabase
            .from('bills')
            .select(`
                *,
                patients(first_name, last_name, patient_id),
                bill_items(*)
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching patient bills:', error);
        res.status(500).json({ message: 'Error fetching patient bills', error: error.message });
    }
};

// Update bill status
exports.updateBillStatus = async (req, res) => {
    try {
        const { billId } = req.params;
        const { status } = req.body;

        if (!['pending', 'partial', 'paid', 'cancelled', 'refunded'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedBill = await dbService.updateBillStatus(billId, status);
        res.json(updatedBill);
    } catch (error) {
        console.error('Error updating bill status:', error);
        res.status(500).json({ message: 'Error updating bill status', error: error.message });
    }
};

// Create payment
exports.createPayment = async (req, res) => {
    try {
        const {
            bill_id,
            patient_id,
            payment_amount,
            payment_method,
            reference_number,
            notes
        } = req.body;

        // Validate required fields
        if (!bill_id || !payment_amount || !payment_method) {
            return res.status(400).json({ message: 'Bill ID, payment amount, and payment method are required' });
        }

        // Validate payment amount
        if (payment_amount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than 0' });
        }

        const paymentData = {
            bill_id,
            patient_id,
            payment_amount,
            payment_method,
            reference_number,
            notes,
            status: 'completed'
        };

        const payment = await dbService.createPayment(paymentData);
        res.status(201).json(payment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

// Get all payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await dbService.getPayments();
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

// Get payments by bill ID
exports.getPaymentsByBill = async (req, res) => {
    try {
        const { billId } = req.params;
        const { data, error } = await dbService.supabase
            .from('payments')
            .select('*')
            .eq('bill_id', billId)
            .order('payment_date', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching bill payments:', error);
        res.status(500).json({ message: 'Error fetching bill payments', error: error.message });
    }
};

// Get billing summary (dashboard data)
exports.getBillingSummary = async (req, res) => {
    try {
        const { period = 'today' } = req.query;
        let dateFilter = '';
        
        switch (period) {
            case 'today':
                dateFilter = `created_at >= CURRENT_DATE`;
                break;
            case 'week':
                dateFilter = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
                break;
            case 'month':
                dateFilter = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
                break;
            default:
                dateFilter = `created_at >= CURRENT_DATE`;
        }

        // Get total bills and amounts
        const { data: billsData, error: billsError } = await dbService.supabase
            .from('bills')
            .select('total_amount, status')
            .filter('created_at', 'gte', new Date(Date.now() - (period === 'today' ? 24*60*60*1000 : period === 'week' ? 7*24*60*60*1000 : 30*24*60*60*1000)).toISOString());

        if (billsError) throw billsError;

        // Get total payments
        const { data: paymentsData, error: paymentsError } = await dbService.supabase
            .from('payments')
            .select('payment_amount')
            .filter('payment_date', 'gte', new Date(Date.now() - (period === 'today' ? 24*60*60*1000 : period === 'week' ? 7*24*60*60*1000 : 30*24*60*60*1000)).toISOString());

        if (paymentsError) throw paymentsError;

        // Calculate summary
        const totalBills = billsData.length;
        const totalBilled = billsData.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);
        const totalPaid = paymentsData.reduce((sum, payment) => sum + parseFloat(payment.payment_amount || 0), 0);
        const pendingAmount = totalBilled - totalPaid;
        
        const statusCounts = billsData.reduce((acc, bill) => {
            acc[bill.status] = (acc[bill.status] || 0) + 1;
            return acc;
        }, {});

        const summary = {
            period,
            totalBills,
            totalBilled: parseFloat(totalBilled.toFixed(2)),
            totalPaid: parseFloat(totalPaid.toFixed(2)),
            pendingAmount: parseFloat(pendingAmount.toFixed(2)),
            statusCounts,
            paymentRate: totalBilled > 0 ? parseFloat(((totalPaid / totalBilled) * 100).toFixed(2)) : 0
        };

        res.json(summary);
    } catch (error) {
        console.error('Error fetching billing summary:', error);
        res.status(500).json({ message: 'Error fetching billing summary', error: error.message });
    }
};

// Search bills
exports.searchBills = async (req, res) => {
    try {
        const { query, status, startDate, endDate } = req.query;
        
        let supabaseQuery = dbService.supabase
            .from('bills')
            .select(`
                *,
                patients(first_name, last_name, patient_id)
            `);

        // Add filters
        if (query) {
            supabaseQuery = supabaseQuery.or(`bill_number.ilike.%${query}%,patients.first_name.ilike.%${query}%,patients.last_name.ilike.%${query}%`);
        }
        
        if (status) {
            supabaseQuery = supabaseQuery.eq('status', status);
        }
        
        if (startDate) {
            supabaseQuery = supabaseQuery.gte('bill_date', startDate);
        }
        
        if (endDate) {
            supabaseQuery = supabaseQuery.lte('bill_date', endDate);
        }

        const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error searching bills:', error);
        res.status(500).json({ message: 'Error searching bills', error: error.message });
    }
};

// Generate bill PDF (placeholder for future implementation)
exports.generateBillPDF = async (req, res) => {
    try {
        const { billId } = req.params;
        const bill = await dbService.getBillById(billId);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // TODO: Implement PDF generation
        res.json({ 
            message: 'PDF generation not yet implemented',
            bill: bill
        });
    } catch (error) {
        console.error('Error generating bill PDF:', error);
        res.status(500).json({ message: 'Error generating bill PDF', error: error.message });
    }
};

// Get popular billing items (for quick selection)
exports.getPopularBillingItems = async (req, res) => {
    try {
        const { data, error } = await dbService.supabase
            .from('billing_items')
            .select('*')
            .eq('is_active', true)
            .in('name', [
                'General Consultation',
                'Complete Blood Count (CBC)',
                'Paracetamol 500mg',
                'X-Ray Chest',
                'Blood Glucose Test'
            ])
            .order('category', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching popular billing items:', error);
        res.status(500).json({ message: 'Error fetching popular billing items', error: error.message });
    }
}; 