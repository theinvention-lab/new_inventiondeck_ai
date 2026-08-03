import { useState } from 'react';
import type { Folder } from '../../types';
import { Button } from '../ui/Button';

const FOLDER_COLORS = ['#03c75a', '#0c43b7', '#f5a524', '#e0343f', '#7c3aed', '#0891b2'];

export function FolderSidebar({
  folders,
  activeFolderId,
  onSelectFolder,
  counts,
  onCreateFolder,
  onDeleteFolder,
  onDropOnFolder,
}: {
  folders: Folder[];
  activeFolderId: string | 'all' | 'unfiled' | null;
  onSelectFolder: (id: string | 'all' | 'unfiled') => void;
  counts: { all: number; unfiled: number; byFolder: Record<string, number> };
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDropOnFolder: (folderId: string | null, projectId: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const handleDrop = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/project-id');
    if (projectId) onDropOnFolder(folderId, projectId);
  };

  return (
    <div className="flex w-full flex-col gap-1 sm:w-56 sm:shrink-0">
      <button
        onClick={() => onSelectFolder('all')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, null)}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
          activeFolderId === 'all' ? 'bg-ink-strong text-white' : 'text-ink-muted hover:bg-white'
        }`}
      >
        전체 프로젝트 <span className="text-[12px] opacity-70">{counts.all}</span>
      </button>
      <button
        onClick={() => onSelectFolder('unfiled')}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, null)}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
          activeFolderId === 'unfiled' ? 'bg-ink-strong text-white' : 'text-ink-muted hover:bg-white'
        }`}
      >
        미분류 <span className="text-[12px] opacity-70">{counts.unfiled}</span>
      </button>

      <div className="my-2 h-px bg-hairline" />

      {folders.map((f) => (
        <div
          key={f.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, f.id)}
          className="group flex items-center"
        >
          <button
            onClick={() => onSelectFolder(f.id)}
            className={`flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors ${
              activeFolderId === f.id ? 'bg-ink-strong text-white' : 'text-ink-muted hover:bg-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.name}
            </span>
            <span className="text-[12px] opacity-70">{counts.byFolder[f.id] ?? 0}</span>
          </button>
          <button
            onClick={() => onDeleteFolder(f.id)}
            className="ml-1 hidden shrink-0 px-1.5 text-[12px] text-ink-faint hover:text-danger group-hover:block"
            aria-label="폴더 삭제"
          >
            ✕
          </button>
        </div>
      ))}

      {creating ? (
        <div className="mt-1 flex items-center gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                onCreateFolder(name.trim());
                setName('');
                setCreating(false);
              }
              if (e.key === 'Escape') setCreating(false);
            }}
            placeholder="폴더 이름"
            className="h-8 flex-1 rounded-md border border-hairline-strong bg-white px-2 text-[12.5px] outline-none focus:border-brand"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (name.trim()) onCreateFolder(name.trim());
              setName('');
              setCreating(false);
            }}
          >
            추가
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-1 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-ink-faint hover:bg-white"
        >
          + 새 폴더
        </button>
      )}
      <p className="mt-1 hidden px-3 text-[10.5px] text-ink-faint sm:block">{FOLDER_COLORS.length > 0 ? '카드를 드래그해 폴더에 놓으세요' : ''}</p>
    </div>
  );
}
