import { useState } from 'react';
import * as Menubar from '@radix-ui/react-menubar';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import './Menubar.css';
import Quill from 'quill';
import { v4 as uuidV4 } from 'uuid';

const CHECK_ITEMS = ['Always Show Bookmarks Bar', 'Always Show Full URLs'];

const MenubarComponent = ({
  quill,
  fileName,
}: {
  quill: Quill | undefined;
  fileName: string;
}) => {
  const [checkedSelection, setCheckedSelection] = useState([CHECK_ITEMS[1]]);

  const handleNew = () => {
    window.open(`http://localhost:5173/documents/${uuidV4()}`, '_blank');
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt, .html';
    input.onchange = (e: Event) => {
      const file = e?.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const contents = event?.target?.result?.toString();
          const data = quill?.clipboard.convert({ text: contents as string });
          const uuid = uuidV4();
          socket?.emit(
            'send-changes',
            { _id: uuid, fileName: file.name, data },
            (response: { status: string; _id: string }) => {
              if (response?.status === 'success') {
                window.open(
                  'http://localhost:5173/documents/' + response?._id,
                  '_blank'
                );
              }
            }
          );
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDownload = () => {
    if (quill) {
      const content = quill.getText();
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || '';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // const handleSaveAs = () => {
  //   if (quill) {
  //     const content = quill.root.innerHTML;
  //     const blob = new Blob([content]);
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'document.html';
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   }
  // };

  return (
    <Menubar.Root className="MenubarRoot">
      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="MenubarContent"
            align="start"
            sideOffset={5}
            alignOffset={-3}
          >
            <Menubar.Item className="MenubarItem" onClick={handleNew}>
              New<div className="RightSlot">⌘ T</div>
            </Menubar.Item>
            <Menubar.Item className="MenubarItem" onClick={handleOpen}>
              Open <div className="RightSlot">⌘ O</div>
            </Menubar.Item>
            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                Download
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>

              <Menubar.Portal>
                <Menubar.SubContent
                  className="MenubarSubContent"
                  alignOffset={-5}
                >
                  <Menubar.Item
                    className="MenubarItem"
                    onClick={handleDownload}
                  >
                    Plain Text (.txt)
                  </Menubar.Item>
                  {/* <Menubar.Item className="MenubarItem" onClick={handleSaveAs}>
                    HTML Document (.html)
                  </Menubar.Item>
                  <Menubar.Item className="MenubarItem" onClick={handleSave}>
                    Microsoft Word (.docx)
                  </Menubar.Item>
                  <Menubar.Item className="MenubarItem" onClick={handleSaveAs}>
                    PDF Document (.pdf)
                  </Menubar.Item>
                  <Menubar.Item className="MenubarItem" onClick={handleSaveAs}>
                    Markdown Document (.md)
                  </Menubar.Item>
                  <Menubar.Item className="MenubarItem" onClick={handleSaveAs}>
                    Rich Text (.rtf)
                  </Menubar.Item> */}
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem">
              Print… <div className="RightSlot">⌘ P</div>
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">Edit</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="MenubarContent"
            align="start"
            sideOffset={5}
            alignOffset={-3}
          >
            <Menubar.Item className="MenubarItem">
              Undo <div className="RightSlot">⌘ Z</div>
            </Menubar.Item>
            <Menubar.Item className="MenubarItem">
              Redo <div className="RightSlot">⇧ ⌘ Z</div>
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Sub>
              <Menubar.SubTrigger className="MenubarSubTrigger">
                Find
                <div className="RightSlot">
                  <ChevronRightIcon />
                </div>
              </Menubar.SubTrigger>

              <Menubar.Portal>
                <Menubar.SubContent
                  className="MenubarSubContent"
                  alignOffset={-5}
                >
                  <Menubar.Item className="MenubarItem">
                    Search the web…
                  </Menubar.Item>
                  <Menubar.Separator className="MenubarSeparator" />
                  <Menubar.Item className="MenubarItem">Find…</Menubar.Item>
                  <Menubar.Item className="MenubarItem">Find Next</Menubar.Item>
                  <Menubar.Item className="MenubarItem">
                    Find Previous
                  </Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem">Cut</Menubar.Item>
            <Menubar.Item className="MenubarItem">Copy</Menubar.Item>
            <Menubar.Item className="MenubarItem">Paste</Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>

      <Menubar.Menu>
        <Menubar.Trigger className="MenubarTrigger">View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className="MenubarContent"
            align="start"
            sideOffset={5}
            alignOffset={-14}
          >
            {CHECK_ITEMS.map(item => (
              <Menubar.CheckboxItem
                className="MenubarCheckboxItem inset"
                key={item}
                checked={checkedSelection.includes(item)}
                onCheckedChange={() =>
                  setCheckedSelection(current =>
                    current.includes(item)
                      ? current.filter(el => el !== item)
                      : current.concat(item)
                  )
                }
              >
                <Menubar.ItemIndicator className="MenubarItemIndicator">
                  <CheckIcon />
                </Menubar.ItemIndicator>
                {item}
              </Menubar.CheckboxItem>
            ))}
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">
              Reload <div className="RightSlot">⌘ R</div>
            </Menubar.Item>
            <Menubar.Item className="MenubarItem inset" disabled>
              Force Reload <div className="RightSlot">⇧ ⌘ R</div>
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">
              Toggle Fullscreen
            </Menubar.Item>
            <Menubar.Separator className="MenubarSeparator" />
            <Menubar.Item className="MenubarItem inset">
              Hide Sidebar
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default MenubarComponent;
