const https = require('https');
const http  = require('http');
const cloudinary = require('../config/cloudinary');

/**
 * Fetch a book cover URL for the given ISBN, upload it to Cloudinary,
 * and return the resulting secure_url.  Returns null if no cover found.
 *
 * Sources tried in order:
 *  1. Open Library Books API  (checks cover_i field to avoid blank images)
 *  2. Google Books API         (uses volumeInfo.imageLinks.thumbnail)
 */
async function fetchAndStoreCover(isbn) {
  const remoteUrl = await findCoverUrl(isbn);
  if (!remoteUrl) return null;

  try {
    const result = await cloudinary.uploader.upload(remoteUrl, {
      folder:         'library-covers',
      public_id:      `isbn-${isbn}`,
      overwrite:      true,
      resource_type:  'image',
      transformation: [{ width: 400, height: 600, crop: 'fill', gravity: 'center' }],
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Cloudinary upload failed for ISBN ${isbn}:`, err.message);
    return null;
  }
}

/** Try Open Library then Google Books; return the best remote image URL or null. */
async function findCoverUrl(isbn) {
  // --- Open Library ---
  try {
    const olData = await getJson(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    const entry = olData[`ISBN:${isbn}`];
    if (entry && entry.cover && entry.cover.large) {
      return entry.cover.large;
    }
    if (entry && entry.cover && entry.cover.medium) {
      return entry.cover.medium;
    }
  } catch {
    // fall through to Google
  }

  // --- Google Books ---
  try {
    const gbData = await getJson(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
    );
    const thumbnail =
      gbData?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
      gbData?.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail;
    if (thumbnail) {
      // Google returns http; upgrade to https
      return thumbnail.replace(/^http:\/\//, 'https://');
    }
  } catch {
    // no cover found
  }

  return null;
}

/** Minimal JSON fetch that works without node-fetch / axios. */
function getJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'LibrarySystem/1.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

module.exports = { fetchAndStoreCover };
