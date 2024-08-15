import { useCallback, useEffect, useState } from 'react';
import Quill from '../../quillConfig';
import 'quill/dist/quill.snow.css';
import { io, Socket } from 'socket.io-client';
import { Delta } from 'quill/core';
import { useParams } from 'react-router-dom';
import QuillCursors, { Cursor } from 'quill-cursors';
import IQuillRange from 'quill-cursors/dist/quill-cursors/i-range';
import MenubarDemo from '../Menubar/Menubar';
import './TextEditor.css';
import Logo from '../../../public/icon-text-editor.png';

const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ font: [] }, { size: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'super' }, { script: 'sub' }],
  [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }, { align: [] }],
  ['link', 'image', 'video', 'formula'],
  ['clean'],
];

export default function TextEditor() {
  const [socket, setSocket] = useState<Socket>();
  const [editor, setEditor] = useState<{
    quill: Quill;
    quillCursors: QuillCursors;
  }>();
  const [cursor, setCursor] = useState<Cursor>();
  const { id: documentId } = useParams();

  useEffect(() => {
    const s = io('http://localhost:3000');
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    const quill = editor?.quill;
    if (socket == null || quill == null) return;

    socket.once('load-document', (document: Delta) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', documentId);
  }, [socket, editor, documentId]);

  useEffect(() => {
    const quill = editor?.quill;
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, editor]);

  useEffect(() => {
    const quill = editor?.quill;
    if (socket == null || quill == null) return;

    const handler = (delta: Delta) => {
      quill.updateContents(delta);
    };
    socket.on('receive-changes', handler);

    return () => {
      socket.off('receive-changes', handler);
    };
  }, [socket, editor]);

  useEffect(() => {
    const quill = editor?.quill;
    if (socket == null || quill == null) return;

    const handler = (delta: Delta, _oldDelta: Delta, source: string) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };
    quill.on('text-change', handler);

    return () => {
      quill.off('text-change', handler);
    };
  }, [socket, editor]);

  useEffect(() => {
    const quill = editor?.quill;
    if (socket == null || quill == null) return;

    const handler = (range: IQuillRange | null) => {
      if (range) {
        socket.emit('cursor-move', {
          userId: cursor?.id,
          userName: cursor?.name,
          range,
        });
      }
    };

    quill.on('selection-change', handler);

    return () => {
      quill.off('selection-change', handler);
    };
  }, [socket, editor, cursor]);

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  useEffect(() => {
    const quill: Quill | undefined = editor?.quill;
    const quillCursors: QuillCursors | undefined = editor?.quillCursors;
    if (socket == null || quill == null) return;

    const handler = (data: {
      userId: string;
      userName: string;
      range: IQuillRange;
    }) => {
      const { userId: otherUserId, userName: otherUserName, range } = data;

      quillCursors?.createCursor(otherUserId, otherUserName, getRandomColor());
      quillCursors?.moveCursor(otherUserId, range);
    };

    socket.on('receive-cursor', handler);

    return () => {
      socket.off('receive-cursor', handler);
    };
  }, [socket, editor]);

  const wrapperRef = useCallback((wrapper: Element | null) => {
    if (wrapper === null) return;
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: true,
      },
    });
    const c = q.getModule('cursors') as QuillCursors;
    const userId = 'user' + Math.floor(Math.random() * 1000).toString();
    const userName = 'User ' + userId;
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    const cursor = c.createCursor(userId, userName, userColor);
    c.toggleFlag(userId, true);
    setCursor(cursor);
    q.disable();
    q.setText('Loading...');
    setEditor({ quill: q, quillCursors: c });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', marginLeft: '1rem' }}>
        <img
          src={Logo}
          style={{ width: '40px', height: '40px', marginTop: '15px' }}
        ></img>
        <div className="toolbar">
          <div style={{ padding: '15px 15px 0' }}>New Document</div>
          <MenubarDemo />
        </div>
      </div>
      <div className="container" ref={wrapperRef}></div>
    </div>
  );
}
