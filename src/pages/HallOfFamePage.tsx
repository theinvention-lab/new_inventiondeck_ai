import { useMemo, useState } from 'react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useProjectStore } from '../store/projectStore';
import { useToast } from '../components/ui/Toast';

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

export function HallOfFamePage() {
  const projects = useProjectStore((s) => s.projects);
  const likeHallProject = useProjectStore((s) => s.likeHallProject);
  const toast = useToast();
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const shared = useMemo(
    () => projects.filter((p) => p.sharedToHall && !p.trashedAt).sort((a, b) => b.hallLikes - a.hallLikes),
    [projects],
  );

  const handleLike = (id: string) => {
    if (liked.has(id)) return;
    likeHallProject(id);
    setLiked((prev) => new Set(prev).add(id));
    toast.push('좋아요를 눌렀습니다.');
  };

  return (
    <div className="min-h-screen bg-canvas-sunken">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 text-center">
          <Badge tone="brand" className="mb-3">
            Hall of Fame
          </Badge>
          <h1 className="text-[26px] font-bold text-ink-strong">명예의 전당</h1>
          <p className="mt-2 text-[13.5px] text-ink-muted">다른 사용자들이 공유한 아이디어에서 영감을 받아보세요.</p>
        </div>

        {shared.length === 0 ? (
          <EmptyState
            title="아직 공유된 아이디어가 없어요"
            description="마이페이지에서 완성한 프로젝트를 '명예의전당'으로 공유해보세요."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map((p) => {
              const idea = p.generator.ideas.find((i) => i.id === p.generator.selectedIdeaId) ?? p.generator.ideas[0];
              return (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-hairline bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Badge tone="outline">{maskEmail(p.ownerEmail)}</Badge>
                    <span className="text-[11px] text-ink-faint">{p.stage === 'completed' ? '완료 프로젝트' : '진행중 공유'}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-ink-strong">{p.title}</h3>
                  {idea && <p className="text-[13px] leading-relaxed text-ink-muted line-clamp-3">{idea.oneLiner}</p>}
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full bg-canvas-sunken px-2 py-0.5 text-[11px] text-ink-faint">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleLike(p.id)}
                    className={`mt-1 flex items-center justify-center gap-1.5 rounded-full border py-1.5 text-[12.5px] font-semibold transition-colors ${
                      liked.has(p.id) ? 'border-brand bg-brand-soft text-brand-strong' : 'border-hairline-strong text-ink-muted hover:bg-canvas-sunken'
                    }`}
                  >
                    👍 좋아요 {p.hallLikes}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
