const dbService = require('../services/database.js');

// Get all drugs in stock
exports.getAllDrugs = async (req, res) => {
    try {
        const drugs = await dbService.getPharmacyStock();
        res.send(drugs);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving drugs.' });
    }
};

// Add a new drug
exports.addDrug = async (req, res) => {
    try {
        const drugData = {
            name: req.body.name,
            description: req.body.description,
            quantity: req.body.quantity,
            unit: req.body.unit,
            price: req.body.price || 0.00
        };

        const result = await dbService.addPharmacyDrug(drugData);
        res.status(201).send({ message: 'Drug added', drug: result });
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error adding drug.' });
    }
};

// Restock a drug
exports.restockDrug = async (req, res) => {
    try {
        const { drug_id } = req.params;
        const { quantity_added } = req.body;
        
        if (dbService.useSupabase) {
            // Update stock using Supabase
            const { data, error } = await dbService.supabase
                .from('pharmacy_stock')
                .update({ 
                    quantity: dbService.supabase.raw(`quantity + ${quantity_added}`),
                    last_restocked: new Date().toISOString()
                })
                .eq('drug_id', drug_id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Log restock
            await dbService.supabase
                .from('pharmacy_stock_log')
                .insert([{
                    drug_id: drug_id,
                    quantity_added: quantity_added
                }]);
            
            res.send({ message: 'Drug restocked', drug: data });
        } else {
            // Use the generic query method for local PostgreSQL
            await dbService.query(
                'UPDATE pharmacy_stock SET quantity = quantity + $1, last_restocked = CURRENT_TIMESTAMP WHERE drug_id = $2',
                [quantity_added, drug_id]
            );
            
            await dbService.query(
                'INSERT INTO pharmacy_stock_log (drug_id, quantity_added) VALUES ($1, $2)',
                [drug_id, quantity_added]
            );
            
            res.send({ message: 'Drug restocked' });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error restocking drug.' });
    }
};

// Dispense a drug (decrement stock)
exports.dispenseDrug = async (req, res) => {
    try {
        const { drug_id } = req.params;
        const { quantity_dispensed, prescription_id } = req.body;
        
        // Defensive checks
        const qtyDisp = Number(quantity_dispensed);
        if (!Number.isInteger(qtyDisp) || qtyDisp <= 0) {
            return res.status(400).send({ message: 'Dispensed quantity must be a positive integer.' });
        }
        if (!prescription_id) {
            return res.status(400).send({ message: 'Prescription ID is required.' });
        }
        
        if (dbService.useSupabase) {
            // Get current stock
            const { data: currentStock, error: stockError } = await dbService.supabase
                .from('pharmacy_stock')
                .select('quantity')
                .eq('drug_id', drug_id)
                .single();
            
            if (stockError || !currentStock) {
                return res.status(400).send({ message: 'Drug not found.' });
            }
            
            if (currentStock.quantity < qtyDisp) {
                return res.status(400).send({ message: 'Not enough stock.' });
            }
            
            // Update stock
            const { error: updateError } = await dbService.supabase
                .from('pharmacy_stock')
                .update({ quantity: currentStock.quantity - qtyDisp })
                .eq('drug_id', drug_id);
            
            if (updateError) throw updateError;
            
            // Update prescription - handle missing dispensed_at column gracefully
            try {
                const { error: prescriptionError } = await dbService.supabase
                    .from('prescriptions')
                    .update({ 
                        status: 'completed', 
                        quantity: qtyDisp, 
                        dispensed_at: new Date().toISOString() 
                    })
                    .eq('prescription_id', prescription_id);
                
                if (prescriptionError) {
                    // If dispensed_at column doesn't exist, try without it
                    const { error: prescriptionError2 } = await dbService.supabase
                        .from('prescriptions')
                        .update({ 
                            status: 'completed', 
                            quantity: qtyDisp
                        })
                        .eq('prescription_id', prescription_id);
                    
                    if (prescriptionError2) throw prescriptionError2;
                }
            } catch (prescriptionUpdateError) {
                console.error('Error updating prescription:', prescriptionUpdateError);
                // Continue with dispensing even if prescription update fails
            }
            
            res.send({ message: 'Drug dispensed successfully.' });
        } else {
            // Use the generic query method for local PostgreSQL
            const result = await dbService.query(
                'UPDATE pharmacy_stock SET quantity = quantity - $1 WHERE drug_id = $2 AND quantity >= $1 RETURNING *',
                [qtyDisp, drug_id]
            );
            
            if (!result.length) {
                return res.status(400).send({ message: 'Not enough stock or drug not found.' });
            }
            
            try {
                await dbService.query(
                    "UPDATE prescriptions SET status = 'completed', quantity = $1, dispensed_at = CURRENT_TIMESTAMP WHERE prescription_id = $2",
                    [qtyDisp, prescription_id]
                );
            } catch (prescriptionError) {
                // If dispensed_at column doesn't exist, try without it
                await dbService.query(
                    "UPDATE prescriptions SET status = 'completed', quantity = $1 WHERE prescription_id = $2",
                    [qtyDisp, prescription_id]
                );
            }
            
            res.send({ message: 'Drug dispensed successfully.' });
        }
    } catch (err) {
        console.error('Dispense error:', err);
        res.status(500).send({ message: err.message || 'Error dispensing drug.' });
    }
};

// Get all active prescriptions (to be filled by pharmacy)
exports.getActivePrescriptions = async (req, res) => {
    try {
        const prescriptions = await dbService.getActivePrescriptions();
        res.send(prescriptions);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error retrieving active prescriptions.' });
    }
}; 