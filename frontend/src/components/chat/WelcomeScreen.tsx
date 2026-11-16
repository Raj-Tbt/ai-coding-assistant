import { Code2, Bug, BookOpen, Zap } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '../../utils/constants';

const iconMap = { Code2, Bug, BookOpen, Zap };

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-y-auto">
      {/* Logo + heading */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
          <Code2 size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          How can I help you code today?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Generate, debug, explain, optimize, or review code across 13+ languages.
        </p>
      </div>

      {/* Suggested prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTED_PROMPTS.map((p) => {
          const Icon = iconMap[p.icon as keyof typeof iconMap] ?? Code2;
          return (
            <button
              key={p.title}
              onClick={() => onPromptSelect(p.prompt)}
              className="text-left p-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-150 group"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Icon size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
