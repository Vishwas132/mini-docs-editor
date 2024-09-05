import MenubarComponent from '../Menubar/Menubar';
import Logo from '/text-editor-icon.png';
import Spinner from 'react-bootstrap/Spinner';
import CloudIcon from '/cloud-icon.png';
import { ChangeEvent, useState } from 'react';
import { HeaderProps } from '../../types/types';
import { Button, Toast } from 'react-bootstrap';
import './Header.css';

export default function Header({
  fileName,
  setFileName,
  isSaving,
  setIsSaving,
  socket,
  editor,
}: HeaderProps) {
  const [showToast, setShowToast] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <img
        src={Logo}
        style={{ marginLeft: '15px', width: '40px', height: '40px' }}
      ></img>
      <div className="toolbar">
        <div style={{ display: 'flex', flexDirection: 'row', height: '20px' }}>
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
              className="menubar-margin"
            />
          ) : (
            <img
              src={CloudIcon}
              className="menubar-margin"
              style={{ height: '20px' }}
            ></img>
          )}
        </div>
        <MenubarComponent
          socket={socket}
          quill={editor?.quill}
          fileName={fileName}
        />
      </div>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
      >
        <Toast.Body>
          Link copied! You can share the link with others to collaborate.
        </Toast.Body>
      </Toast>
      <Button
        size="sm"
        onClick={copyLink}
        title="Copy Link"
        className="menubar-margin"
        style={{ height: '30px', marginLeft: 'auto' }}
      >
        Collaborate
      </Button>
    </div>
  );
}
