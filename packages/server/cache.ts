import NodeCache from 'node-cache';
import { Document } from './models/index.js';

export const cache = new NodeCache();

export async function refreshCache() {
  try {
    cache.flushAll();
    // Fetch all documents or use a query to fetch only what's needed
    const documents = await Document.find().lean();

    documents.forEach(doc => {
      cache.set(doc._id, doc);
    });

    console.log('Cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing cache:', error);
  }
}
