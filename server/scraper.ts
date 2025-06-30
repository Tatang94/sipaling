import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface ScrapedImage {
  url: string;
  alt?: string;
  source: string;
}

export class KosScraper {
  private browser: any = null;

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Scrape from Mamikos (primary source for Indonesian kos)
  async scrapeMamikos(query: string, location: string = 'tasikmalaya', limit: number = 5): Promise<ScrapedImage[]> {
    await this.init();
    const images: ScrapedImage[] = [];

    try {
      const page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const searchUrl = `https://mamikos.com/cari/kost-${location}?q=${encodeURIComponent(query)}`;
      console.log(`Scraping Mamikos: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for images to load
      await page.waitForSelector('img', { timeout: 10000 });
      
      // Extract image URLs
      const imageUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img[src*="mamikos"], img[src*="kost"], img[src*="property"]'));
        return imgs
          .map(img => ({
            url: (img as HTMLImageElement).src,
            alt: (img as HTMLImageElement).alt || ''
          }))
          .filter(item => 
            item.url && 
            !item.url.includes('logo') && 
            !item.url.includes('icon') &&
            (item.url.includes('kost') || item.url.includes('property') || item.url.includes('mamikos'))
          )
          .slice(0, limit);
      });

      images.push(...imageUrls.map(img => ({
        url: img.url,
        alt: img.alt,
        source: 'mamikos'
      })));

      await page.close();
    } catch (error) {
      console.error('Error scraping Mamikos:', error);
    }

    return images;
  }

  // Scrape from Rukita
  async scrapeRukita(query: string, limit: number = 3): Promise<ScrapedImage[]> {
    await this.init();
    const images: ScrapedImage[] = [];

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const searchUrl = `https://www.rukita.co/cari?q=${encodeURIComponent(query)}`;
      console.log(`Scraping Rukita: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector('img', { timeout: 10000 });
      
      const imageUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img[src*="rukita"], img[src*="property"]'));
        return imgs
          .map(img => ({
            url: (img as HTMLImageElement).src,
            alt: (img as HTMLImageElement).alt || ''
          }))
          .filter(item => 
            item.url && 
            !item.url.includes('logo') && 
            !item.url.includes('icon') &&
            item.url.includes('rukita')
          )
          .slice(0, limit);
      });

      images.push(...imageUrls.map(img => ({
        url: img.url,
        alt: img.alt,
        source: 'rukita'
      })));

      await page.close();
    } catch (error) {
      console.error('Error scraping Rukita:', error);
    }

    return images;
  }

  // Generic scraper for any kos-related images
  async scrapeGenericKos(kosName: string, city: string = 'tasikmalaya'): Promise<ScrapedImage[]> {
    const query = `${kosName} ${city} kost boarding house`;
    const images: ScrapedImage[] = [];

    try {
      // Try Mamikos first (most reliable for Indonesian kos)
      const mamikosImages = await this.scrapeMamikos(query, city, 4);
      images.push(...mamikosImages);

      // If we need more images, try Rukita
      if (images.length < 3) {
        const rukitaImages = await this.scrapeRukita(query, 3);
        images.push(...rukitaImages);
      }

      // Filter out duplicates and invalid URLs
      const uniqueImages = images.filter((img, index, self) => 
        index === self.findIndex(t => t.url === img.url) &&
        img.url.startsWith('http') &&
        !img.url.includes('data:image')
      );

      return uniqueImages.slice(0, 5); // Limit to 5 images per kos
    } catch (error) {
      console.error('Error in generic scraping:', error);
      return [];
    }
  }

  // Download and save images locally
  async downloadImage(imageUrl: string, filename: string): Promise<string | null> {
    try {
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const publicDir = join(process.cwd(), 'public', 'images', 'kos');
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }

      const imagePath = join(publicDir, filename);
      writeFileSync(imagePath, response.data);

      return `/images/kos/${filename}`;
    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error);
      return null;
    }
  }

  // Main function to scrape and process images for a kos
  async scrapeKosImages(kosName: string, city: string = 'tasikmalaya'): Promise<string[]> {
    try {
      console.log(`Scraping images for: ${kosName} in ${city}`);
      
      const scrapedImages = await this.scrapeGenericKos(kosName, city);
      const savedImages: string[] = [];

      for (let i = 0; i < scrapedImages.length && i < 5; i++) {
        const image = scrapedImages[i];
        const filename = `${kosName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.jpg`;
        
        const savedPath = await this.downloadImage(image.url, filename);
        if (savedPath) {
          savedImages.push(savedPath);
          console.log(`✓ Saved: ${filename} from ${image.source}`);
        }
      }

      return savedImages;
    } catch (error) {
      console.error(`Error scraping images for ${kosName}:`, error);
      return [];
    }
  }

  // Batch process all kos
  async scrapeAllKosImages(kosList: { name: string; city?: string }[]): Promise<{ [kosName: string]: string[] }> {
    const results: { [kosName: string]: string[] } = {};
    
    await this.init();
    
    for (const kos of kosList) {
      try {
        const images = await this.scrapeKosImages(kos.name, kos.city || 'tasikmalaya');
        results[kos.name] = images;
        
        // Add delay to avoid being blocked
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to scrape ${kos.name}:`, error);
        results[kos.name] = [];
      }
    }
    
    await this.close();
    return results;
  }
}

export const kosScraper = new KosScraper();