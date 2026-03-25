import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PromptCard } from './prompt-card';
import { motion } from 'motion/react';

export type PromptListProps = {
  prompts: PromptSummary[];
};

export const PromptList = ({ prompts }: PromptListProps) => {
  return (
    <motion.ul
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      layout
    >
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </motion.ul>
  );
};
