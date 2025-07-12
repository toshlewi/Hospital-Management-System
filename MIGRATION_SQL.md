# Database Migration for Imaging Fields

Please run the following SQL commands in your Supabase dashboard SQL editor:

## Step 1: Add Imaging Fields to test_orders table

```sql
ALTER TABLE test_orders 
ADD COLUMN IF NOT EXISTS body_part VARCHAR(100),
ADD COLUMN IF NOT EXISTS differential_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS clinical_notes TEXT,
ADD COLUMN IF NOT EXISTS imaging_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
ADD COLUMN IF NOT EXISTS requesting_physician VARCHAR(100);
```

## Step 2: Add Indexes for Better Performance

```sql
CREATE INDEX IF NOT EXISTS idx_test_orders_status ON test_orders(status);
CREATE INDEX IF NOT EXISTS idx_test_orders_ordered_at ON test_orders(ordered_at);
```

## Step 3: Verify the Migration

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'test_orders' 
AND column_name IN ('body_part', 'differential_diagnosis', 'clinical_notes', 'imaging_type', 'priority', 'requesting_physician');
```

## After Running the Migration

1. Restart your backend server: `npm run server`
2. Test creating a new imaging order with differential diagnosis
3. Check that the differential diagnosis appears in the Imaging department

The migration will add the following fields to the test_orders table:
- `body_part`: Specifies which body part to image
- `differential_diagnosis`: Lists suspected conditions
- `clinical_notes`: Additional clinical information
- `imaging_type`: Specific imaging modality
- `priority`: Urgency level (routine, urgent, emergency)
- `requesting_physician`: Who ordered the test 