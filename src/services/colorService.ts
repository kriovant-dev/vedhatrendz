import { firebase } from '@/integrations/firebase/client';

export interface CustomColor {
  id: string;
  name: string;
  hex_code: string;
  is_default: boolean;
  created_at: string;
}

export class ColorService {
  /**
   * Get all available colors (custom + default)
   */
  static async getAllColors(): Promise<CustomColor[]> {
    try {
      const { data, error } = await firebase
        .from('custom_colors')
        .select('*')
        .execute();

      if (error) throw error;
      return data as CustomColor[];
    } catch (error) {
      console.error('Error fetching colors:', error);
      // Return default colors if database fails
      return this.getDefaultColors();
    }
  }

  /**
   * Get default colors that should always be available
   */
  static getDefaultColors(): CustomColor[] {
    const defaultColors = [
      { name: 'Red', hex_code: '#ef4444' },
      { name: 'Blue', hex_code: '#3b82f6' },
      { name: 'Green', hex_code: '#22c55e' },
      { name: 'Yellow', hex_code: '#eab308' },
      { name: 'Orange', hex_code: '#f97316' },
      { name: 'Purple', hex_code: '#a855f7' },
      { name: 'Pink', hex_code: '#ec4899' },
      { name: 'Black', hex_code: '#000000' },
      { name: 'White', hex_code: '#ffffff' },
      { name: 'Gray', hex_code: '#6b7280' },
      { name: 'Brown', hex_code: '#a16207' },
      { name: 'Navy', hex_code: '#1e3a8a' },
    ];

    return defaultColors.map((color, index) => ({
      id: `default_${index}`,
      name: color.name,
      hex_code: color.hex_code,
      is_default: true,
      created_at: new Date().toISOString(),
    }));
  }

  /**
   * Initialize default colors in database if they don't exist
   */
  static async initializeDefaultColors(): Promise<void> {
    try {
      // Check if any default colors exist
      const { data: existingDefaults, error: checkError } = await firebase
        .from('custom_colors')
        .select('id')
        .eq('is_default', true)
        .execute();

      if (checkError) throw checkError;

      // If no default colors exist, create them
      if (!existingDefaults || existingDefaults.length === 0) {
        const defaultColors = this.getDefaultColors().map(color => ({
          name: color.name,
          hex_code: color.hex_code,
          is_default: color.is_default,
          created_at: color.created_at,
        }));

        const { error: insertError } = await firebase
          .from('custom_colors')
          .insert(defaultColors)
          .execute();

        if (insertError) throw insertError;
        console.log('Default colors initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing default colors:', error);
    }
  }

  /**
   * Add a new custom color
   */
  static async addCustomColor(name: string, hexCode: string): Promise<void> {
    const { error } = await firebase
      .from('custom_colors')
      .insert([
        {
          name: name.trim(),
          hex_code: hexCode.toLowerCase(),
          is_default: false,
          created_at: new Date().toISOString(),
        }
      ])
      .execute();

    if (error) throw error;
  }

  /**
   * Delete a custom color (cannot delete default colors)
   */
  static async deleteCustomColor(colorId: string): Promise<void> {
    // First check if color is not default
    const { data: colorToDelete } = await firebase
      .from('custom_colors')
      .select('is_default')
      .eq('id', colorId)
      .single();

    if (colorToDelete?.is_default) {
      throw new Error('Cannot delete default colors');
    }

    const { error } = await firebase
      .from('custom_colors')
      .delete()
      .eq('id', colorId)
      .execute();

    if (error) throw error;
  }

  /**
   * Get color hex code by name (for backwards compatibility)
   */
  static async getColorHexByName(colorName: string): Promise<string | null> {
    try {
      const colors = await this.getAllColors();
      const color = colors.find(c => 
        c.name.toLowerCase() === colorName.toLowerCase()
      );
      return color?.hex_code || null;
    } catch (error) {
      console.error('Error getting color hex:', error);
      return null;
    }
  }

  /**
   * Validate hex color format
   */
  static isValidHexColor(hex: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  }

  /**
   * Convert color name to hex if needed
   */
  static async normalizeColor(color: string): Promise<string> {
    // If it's already a hex color, return it
    if (this.isValidHexColor(color)) {
      return color;
    }

    // Try to find hex code by name
    const hexCode = await this.getColorHexByName(color);
    return hexCode || color; // Return original if not found
  }
}