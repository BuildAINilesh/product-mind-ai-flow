
/**
 * Utility service for Firecrawl API integration
 */
export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';

  /**
   * Get the stored API key
   * @returns The Firecrawl API key or null if not set
   */
  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  /**
   * Save the API key
   * @param apiKey The Firecrawl API key to save
   */
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
  }

  /**
   * Clear the stored API key
   */
  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }

  /**
   * Test if the API key is valid
   * This is just a placeholder for now - in a real implementation, you might
   * want to make a simple API call to validate the key
   * @param apiKey The API key to test
   * @returns A promise that resolves to true if the key is valid
   */
  static async testApiKey(apiKey: string): Promise<boolean> {
    // Implement actual API validation logic here when the Firecrawl SDK is available
    console.log('Testing API key validity:', apiKey);
    return apiKey.length > 10; // Simple validation for demonstration
  }
}
