import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('map_screenshot.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    let emptyPixels = 0;
    let totalPixels = this.width * this.height;
    
    // Check if the image is mostly white or transparent
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let idx = (this.width * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        let a = this.data[idx+3];
        
        // Count pixels that are perfectly white or very light gray/transparent
        if ((r > 240 && g > 240 && b > 240) || a < 10) {
          emptyPixels++;
        }
      }
    }
    
    console.log(`Dimensions: ${this.width}x${this.height}`);
    console.log(`Total pixels: ${totalPixels}`);
    console.log(`Empty/White pixels: ${emptyPixels}`);
    console.log(`Percentage empty: ${((emptyPixels/totalPixels)*100).toFixed(2)}%`);
  });
