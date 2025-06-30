import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface ScrapedImage {
  url: string;
  alt?: string;
  source: string;
}

export class LightweightKosScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  // Scrape from Google Images API (free tier)
  async scrapeGoogleImages(query: string, limit: number = 5): Promise<ScrapedImage[]> {
    const images: ScrapedImage[] = [];
    
    try {
      const searchQuery = encodeURIComponent(`${query} kost boarding house tasikmalaya`);
      const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=active`;
      
      console.log(`Scraping Google Images: ${searchUrl}`);
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Extract image URLs from Google Images
      $('img[src*="http"]').each((i, el) => {
        if (images.length >= limit) return false;
        
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        
        if (src && 
            !src.includes('logo') && 
            !src.includes('icon') &&
            !src.includes('google') &&
            src.startsWith('http') &&
            (src.includes('jpg') || src.includes('jpeg') || src.includes('png'))) {
          images.push({
            url: src,
            alt: alt,
            source: 'google-images'
          });
        }
      });

    } catch (error) {
      console.error('Error scraping Google Images:', error);
    }

    return images;
  }

  // Generate sample realistic kos images using placeholder services
  async generateSampleKosImages(kosName: string): Promise<ScrapedImage[]> {
    const images: ScrapedImage[] = [];
    const dimensions = ['800x600', '1024x768', '1200x800'];
    
    for (let i = 0; i < 3; i++) {
      const dimension = dimensions[i % dimensions.length];
      const imageUrl = `https://picsum.photos/${dimension}?random=${Date.now()}-${i}`;
      
      images.push({
        url: imageUrl,
        alt: `Foto ${kosName} ${i + 1}`,
        source: 'picsum'
      });
    }
    
    return images;
  }

  // Search for real kos images from Indonesian property sites
  async searchIndonesianPropertySites(kosName: string, city: string): Promise<ScrapedImage[]> {
    const images: ScrapedImage[] = [];
    
    try {
      // Search on Mamikos using simple HTTP request
      const searchQuery = encodeURIComponent(`${kosName} ${city}`);
      const mamikosUrl = `https://mamikos.com/cari/kost-${city}?q=${searchQuery}`;
      
      console.log(`Searching Mamikos: ${mamikosUrl}`);
      
      const response = await axios.get(mamikosUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Look for property images
      $('img[src*="mamikos"], img[src*="property"], img[src*="kost"]').each((i, el) => {
        if (images.length >= 4) return false;
        
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || `Foto ${kosName}`;
        
        if (src && 
            src.startsWith('http') &&
            !src.includes('logo') &&
            !src.includes('icon')) {
          images.push({
            url: src,
            alt: alt,
            source: 'mamikos'
          });
        }
      });

    } catch (error) {
      console.error('Error searching Indonesian property sites:', error);
    }

    return images;
  }

  // Download and save images locally
  async downloadImage(imageUrl: string, filename: string): Promise<string | null> {
    try {
      console.log(`Downloading image: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': 'https://www.google.com/'
        }
      });

      const publicDir = join(process.cwd(), 'public', 'images', 'kos');
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }

      const imagePath = join(publicDir, filename);
      writeFileSync(imagePath, response.data);

      console.log(`✓ Image saved: ${filename}`);
      return `/images/kos/${filename}`;
    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error);
      return null;
    }
  }

  // Main function to scrape images for a kos
  async scrapeKosImages(kosName: string, city: string = 'tasikmalaya'): Promise<string[]> {
    try {
      console.log(`Scraping images for: ${kosName} in ${city}`);
      
      let scrapedImages: ScrapedImage[] = [];
      
      // Try Indonesian property sites first
      const propertyImages = await this.searchIndonesianPropertySites(kosName, city);
      scrapedImages.push(...propertyImages);
      
      // If we need more images, try Google Images
      if (scrapedImages.length < 3) {
        const googleImages = await this.scrapeGoogleImages(kosName, 3);
        scrapedImages.push(...googleImages);
      }
      
      // If still not enough, generate sample images
      if (scrapedImages.length < 2) {
        const sampleImages = await this.generateSampleKosImages(kosName);
        scrapedImages.push(...sampleImages);
      }

      const savedImages: string[] = [];
      const maxImages = Math.min(scrapedImages.length, 4);

      for (let i = 0; i < maxImages; i++) {
        const image = scrapedImages[i];
        const extension = image.url.includes('.png') ? 'png' : 'jpg';
        const filename = `${kosName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${i + 1}.${extension}`;
        
        const savedPath = await this.downloadImage(image.url, filename);
        if (savedPath) {
          savedImages.push(savedPath);
          console.log(`✓ Saved: ${filename} from ${image.source}`);
        }
        
        // Add delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return savedImages;
    } catch (error) {
      console.error(`Error scraping images for ${kosName}:`, error);
      return [];
    }
  }

  // Batch process all kos with delay
  async scrapeAllKosImages(kosList: { name: string; city?: string }[]): Promise<{ [kosName: string]: string[] }> {
    const results: { [kosName: string]: string[] } = {};
    
    console.log(`Starting batch scraping for ${kosList.length} kos...`);
    
    for (let i = 0; i < kosList.length; i++) {
      const kos = kosList[i];
      try {
        console.log(`\n[${i + 1}/${kosList.length}] Processing: ${kos.name}`);
        
        const images = await this.scrapeKosImages(kos.name, kos.city || 'tasikmalaya');
        results[kos.name] = images;
        
        console.log(`✓ Completed ${kos.name}: ${images.length} images`);
        
        // Add delay between requests to avoid being blocked
        if (i < kosList.length - 1) {
          console.log('Waiting 3 seconds before next kos...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Failed to scrape ${kos.name}:`, error);
        results[kos.name] = [];
      }
    }
    
    return results;
  }
}

export const lightweightKosScraper = new LightweightKosScraper();