import { Schema, model } from 'mongoose';

interface IDocument {
  _id: string;
  data: object;
}

const Document = new Schema<IDocument>({
  _id: String,
  data: Object,
});

export default model<IDocument>('Document', Document);
