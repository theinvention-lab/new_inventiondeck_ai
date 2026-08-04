import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { ChatModeButtons } from '../../components/home/ChatModeButtons';
import { HomeChatPanel } from '../../components/home/HomeChatPanel';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import type { ChatMessage, Project } from '../../types';
import type { ChatMode } from '../../ai/homeChatEngine';
import { openingMessage, replyFor } from '../../ai/homeChatEngine';
import { makeId } from '../../lib/id';

const VALID_MODES: ChatMode[] = ['generator', 'builder', 'planner'];

function isChatMode(value: string | null): value is ChatMode {
  return !!value && (VALID_MODES as string[]).includes(value);
}

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((s) => s.currentUser());
  const email = currentUser?.email ?? '';

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const updateGenerator = useProjectStore((s) => s.updateGenerator);
  const updateBuilder = useProjectStore((s) => s.updateBuilder);

  const paramMode = searchParams.get('mode');
  const [mode, setMode] = useState<ChatMode>(isChatMode(paramMode) ? paramMode : 'generator');

  useEffect(() => {
    if (isChatMode(paramMode) && paramMode !== mode) {
      setMode(paramMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramMode]);

  const [chats, setChats] = useState<Record<ChatMode, ChatMessage[]>>(() => ({
    generator: [openingMessage('generator')],
    builder: [openingMessage('builder')],
    planner: [openingMessage('planner')],
  }));
  const [thinking, setThinking] = useState(false);

  const selectMode = (next: ChatMode) => {
    setMode(next);
    setSearchParams({ mode: next }, { replace: true });
  };

  const sendChat = (targetMode: ChatMode, text: string) => {
    const userMsg: ChatMessage = { id: makeId('hmsg'), role: 'user', content: text, createdAt: new Date().toISOString() };
    setChats((prev) => ({ ...prev, [targetMode]: [...prev[targetMode], userMsg] }));
    setThinking(true);
    window.setTimeout(() => {
      setChats((prev) => {
        const turnIndex = prev[targetMode].filter((m) => m.role === 'user').length - 1;
        const reply = replyFor(targetMode, turnIndex);
        return { ...prev, [targetMode]: [...prev[targetMode], reply] };
      });
      setThinking(false);
    }, 700 + Math.random() * 400);
  };

  const resumeOrCreateProject = (): Project => {
    const active = projects
      .filter((p) => p.ownerEmail === email && !p.trashedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const inProgress = active.find((p) => p.stage !== 'completed');
    if (inProgress) return inProgress;
    if (active.length > 0) return active[0];
    return createProject(email, '새로운 아이디어');
  };

  const chatDigest = (targetMode: ChatMode) =>
    chats[targetMode]
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');

  const handleCta = (targetMode: ChatMode) => {
    const project = resumeOrCreateProject();
    const digest = chatDigest(targetMode);
    if (targetMode === 'generator') {
      if (!project.generator.interest && digest) {
        updateGenerator(project.id, { interest: digest });
      }
      navigate(`/project/${project.id}/generator`);
    } else if (targetMode === 'builder') {
      if (!project.builder.summary && digest) {
        updateBuilder(project.id, { summary: digest });
      }
      navigate(`/project/${project.id}/builder`);
    } else {
      navigate(`/project/${project.id}/planner`);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex h-screen max-w-4xl flex-col overflow-hidden px-5 py-10">
        <h1 className="shrink-0 text-center text-[24px] font-bold text-ink-strong">
          {currentUser?.name ?? '게스트'}님의 워크스페이스
        </h1>

        <div className="mt-6 shrink-0">
          <ChatModeButtons active={mode} onSelect={selectMode} />
        </div>

        <div className="mt-6 min-h-0 flex-1">
          <HomeChatPanel
            mode={mode}
            messages={chats[mode]}
            thinking={thinking}
            onSend={(text) => sendChat(mode, text)}
            onCta={() => handleCta(mode)}
          />
        </div>
      </div>
    </AppShell>
  );
}
