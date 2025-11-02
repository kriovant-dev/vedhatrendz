# Setup Custom Colors Table in Supabase

Follow these steps to set up the dynamic color management system:

## Step 1: Create the Table in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire content from: `database/custom_colors_table.sql`
6. Click **Run** to execute

The SQL script will:
- Create the `custom_colors` table
- Add indexes for performance
- Insert 12 default colors
- Enable Row Level Security (RLS)
- Create policies for admin/public access
- Set up automatic `updated_at` trigger

## Step 2: Verify Table Creation

In Supabase Dashboard:

1. Go to **Table Editor** (left sidebar)
2. You should see `custom_colors` in the table list
3. Click on it to verify it contains 12 default colors

Expected default colors:
- Red, Blue, Green, Yellow, Orange, Purple
- Pink, Black, White, Gray, Brown, Navy

## Step 3: Application Configuration

No additional configuration needed! The app will:

1. Automatically initialize colors on first use
2. Fetch all colors when admin opens Color Management tab
3. Cache colors for better performance
4. Sync in real-time when colors are added/deleted

## Step 4: Test the System

1. Start the application: `npm run dev`
2. Login to Admin Panel (`/admin`)
3. Click **Color Management** tab
4. You should see all 12 default colors
5. Try adding a new color:
   - Click "Add Color"
   - Enter name: "Test Color"
   - Enter hex: "#3498db"
   - Click "Add Color"
6. New color should appear immediately in the list

## Step 5: Use in Product Management

1. Go to Admin → Product Management
2. Create or edit a product
3. Scroll to "Product Colors" section
4. Click on colors - all colors (default + custom) should appear
5. Select your newly added test color
6. Save the product

## Troubleshooting

### Table Not Appearing

If the `custom_colors` table doesn't appear:

1. Copy just the CREATE TABLE part:
```sql
CREATE TABLE IF NOT EXISTS custom_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  hex_code VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Run it separately
3. Then run the INSERT statement for default colors

### Default Colors Not Inserting

If you get an error about duplicate keys, it's fine - the table already has the colors. Just verify they exist in the Table Editor.

### Permission Denied Error

The RLS policies might need adjustment:

1. Go to **Authentication** → **Policies**
2. Check that policies exist for `custom_colors` table
3. If missing, run the entire SQL script again or create policies manually

## API Usage in Application

Once table is set up, use colors in code:

```typescript
// Get all colors
const colors = await ColorService.getAllColors();

// Add new color
await ColorService.addCustomColor('Ocean Blue', '#1a7ba8');

// Delete custom color (not default)
await ColorService.deleteCustomColor(colorId);
```

## Database Schema Reference

```sql
Table: custom_colors

Columns:
- id (UUID): Primary key
- name (VARCHAR): Color name (unique, case-insensitive)
- hex_code (VARCHAR): Hex color code (e.g., #3b82f6)
- is_default (BOOLEAN): Whether it's a default color
- created_at (TIMESTAMP): When color was added
- updated_at (TIMESTAMP): Last update time

Indexes:
- PRIMARY KEY: id
- INDEX: is_default (for filtering default colors)
- INDEX: name (for finding colors by name)
```

## Next Steps

After setup:

1. ✅ Table created with default colors
2. ✅ Admin can add custom colors
3. ✅ Product selector uses dynamic colors
4. ✅ Colors persisted in database
5. Ready for production deployment!

## Files to Run

- **SQL**: `database/custom_colors_table.sql`
- **Admin Component**: Already in app at `/admin` → Color Management
- **Service**: `src/services/colorService.ts`

Done! Your dynamic color system is now ready. 🎨