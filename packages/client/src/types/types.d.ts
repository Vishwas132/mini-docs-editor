import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { Socket } from 'socket.io-client';

export interface MenubarProps {
  socket: Socket | undefined;
  quill: Quill | undefined;
  fileName: string;
}

export interface HeaderProps {
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket | undefined;
  editor: { quill: Quill; quillCursors: QuillCursors } | undefined;
}
