import React from 'react';
import { FileText, FolderDown, GripVertical, Trash2, X } from 'lucide-react';
import { useIslandStore } from '../../store/useIslandStore';
import { ShelfFileItem } from '../../shared/types';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export const FileShelfWidget: React.FC = () => {
  const shelfFiles = useIslandStore((s) => s.shelfFiles);
  const addShelfFiles = useIslandStore((s) => s.addShelfFiles);
  const removeShelfFile = useIslandStore((s) => s.removeShelfFile);
  const clearShelfFiles = useIslandStore((s) => s.clearShelfFiles);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const mapped: ShelfFileItem[] = droppedFiles.map((f) => {
      const electronFile = f as File & { path?: string };
      const ext = f.name.includes('.') ? f.name.split('.').pop() || 'file' : 'file';
      return {
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        path: electronFile.path || f.name,
        sizeBytes: f.size,
        extension: ext.toUpperCase(),
        addedAt: Date.now(),
      };
    });

    addShelfFiles(mapped);
  };

  const handleDragStartOut = (e: React.DragEvent<HTMLDivElement>, file: ShelfFileItem) => {
    if (window.vnotchAPI && file.path) {
      e.preventDefault();
      window.vnotchAPI.startFileDrag(file.path);
    }
  };

  if (shelfFiles.length === 0) {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="h-full rounded-2xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition flex flex-col items-center justify-center p-3 text-center"
      >
        <FolderDown className="w-6 h-6 text-indigo-400 mb-1.5" />
        <p className="text-xs font-medium text-zinc-200">
          Drag & Drop File ke sini untuk Disimpan Sementara
        </p>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          Tarik file dari Explorer ke VNotch, lalu tarik keluar ke aplikasi tujuan
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col justify-between h-full gap-2"
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-zinc-400">
          {shelfFiles.length} file tersimpan (Tarik ikon untuk memindahkan)
        </span>
        <button
          onClick={clearShelfFiles}
          className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>Hapus Semua</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[96px]">
        {shelfFiles.map((file) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStartOut(e, file)}
            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.08] cursor-grab active:cursor-grabbing transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GripVertical className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{file.name}</p>
                <p className="text-[10px] text-zinc-400">
                  {file.extension} • {formatBytes(file.sizeBytes)}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeShelfFile(file.id)}
              className="p-1 rounded-full hover:bg-white/15 text-zinc-400 hover:text-white transition shrink-0"
              title="Hapus dari Shelf"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
