import MenubarComponent from '../Menubar/Menubar';
import Logo from '/text-editor-icon.png';
import Spinner from 'react-bootstrap/Spinner';
import CloudIcon from '/cloud-icon.png';
import { ChangeEvent } from 'react';
import { HeaderProps } from '../../types/types';

export default function Header({
  fileName,
  setFileName,
  isSaving,
  setIsSaving,
  socket,
  editor,
}: HeaderProps) {
  return (
    <div style={{ display: 'flex', marginLeft: '1rem' }}>
      <img
        src={Logo}
        style={{ width: '40px', height: '40px', marginTop: '25px' }}
      ></img>
      <div className="toolbar">
        <input
          type="text"
          className="filename-input"
          title="Rename"
          style={{ width: `${fileName.length * 11}px` }}
          value={fileName}
          onChange={(e: ChangeEvent<HTMLInputElement>): void => {
            setFileName(e.target.value);
            setIsSaving(true);
            socket?.emit(
              'changes-to-server',
              { fileName: e.target.value },
              (response: { status: string; _id: string }) => {
                if (response?.status === 'success') {
                  setTimeout(() => {
                    setIsSaving(false);
                  }, 500);
                }
              }
            );
          }}
        />
        {isSaving ? (
          <Spinner
            animation="border"
            role="status"
            size="sm"
            style={{ marginLeft: '10px' }}
          />
        ) : (
          <img
            src={CloudIcon}
            style={{ width: '20px', height: '20px', marginLeft: '10px' }}
          ></img>
        )}
        <MenubarComponent
          socket={socket}
          quill={editor?.quill}
          fileName={fileName}
        />
      </div>
    </div>
  );
}
