import { Schema, model } from 'mongoose';
import { IDocument } from '../types/types.d';

const DocumentModel = new Schema<IDocument>({
  _id: String,
  fileName: String,
  data: Object,
});

export default model<IDocument>('Document', DocumentModel);
