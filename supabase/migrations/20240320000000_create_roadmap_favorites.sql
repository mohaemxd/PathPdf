-- Create roadmap_favorites table
CREATE TABLE IF NOT EXISTS roadmap_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    favorite_node_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(roadmap_id)
);

-- Create index on roadmap_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roadmap_favorites_roadmap_id ON roadmap_favorites(roadmap_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_roadmap_favorites_updated_at
    BEFORE UPDATE ON roadmap_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE roadmap_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own roadmap favorites
CREATE POLICY "Users can view their own roadmap favorites"
    ON roadmap_favorites
    FOR SELECT
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps
            WHERE user_id = auth.uid()
        )
    );

-- Create policy to allow users to insert their own roadmap favorites
CREATE POLICY "Users can insert their own roadmap favorites"
    ON roadmap_favorites
    FOR INSERT
    WITH CHECK (
        roadmap_id IN (
            SELECT id FROM roadmaps
            WHERE user_id = auth.uid()
        )
    );

-- Create policy to allow users to update their own roadmap favorites
CREATE POLICY "Users can update their own roadmap favorites"
    ON roadmap_favorites
    FOR UPDATE
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps
            WHERE user_id = auth.uid()
        )
    );

-- Create policy to allow users to delete their own roadmap favorites
CREATE POLICY "Users can delete their own roadmap favorites"
    ON roadmap_favorites
    FOR DELETE
    USING (
        roadmap_id IN (
            SELECT id FROM roadmaps
            WHERE user_id = auth.uid()
        )
    ); 