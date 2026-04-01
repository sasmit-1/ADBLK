import JSZip from 'jszip';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/sasmit-1/ADBLK/main';

const EXTENSION_FILES = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'rules/ads.json',
  'rules/trackers.json'
];

/**
 * Fetches the raw extension files from the github repository,
 * bundles them into a zip, and triggers a download.
 */
export async function downloadExtensionZip() {
  const zip = new JSZip();

  // Create an array of fetch promises for each file
  const fetchPromises = EXTENSION_FILES.map(async (filePath) => {
    try {
      // Fetch the file content as a blob
      const response = await fetch(`${GITHUB_RAW_BASE}/${filePath}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Add the file to the zip archive, preserving directory structure 
      // (JSZip automatically handles paths with slashes)
      zip.file(filePath, blob);
    } catch (error) {
      console.error(error);
      throw new Error(`Error bundling file: ${filePath}`);
    }
  });

  // Wait for all files to finish downloading
  await Promise.all(fetchPromises);

  // Generate the complete ZIP file blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = 'Ablck-Extension.zip';
  document.body.appendChild(link);
  
  // Trigger user download
  link.click();
  
  // Cleanup browser memory
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
