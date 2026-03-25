import { CreatePromptUseCase } from '@/core/application/prompts/create-prompt.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

const makeRepository = (overrides: Partial<PromptRepository>) => {
  const base = {
    create: jest.fn(async () => undefined),
  };

  return { ...base, ...overrides } as PromptRepository;
};

describe('CreatePromptUseCase', () => {
  it('should create a prompt when there is no duplicate', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CreatePromptUseCase(repository);
    const input = {
      title: 'novo',
      content: 'content',
    };

    await expect(useCase.execute(input)).resolves.toBeUndefined();

    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('should fail with PROMPT_ALREADY_EXISTS when the title already exists', async () => {
    const repository = makeRepository({
      findByTitle: jest.fn().mockResolvedValue({
        id: 'id',
        title: 'novo',
        content: 'content',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    const useCase = new CreatePromptUseCase(repository);
    const input = {
      title: 'novo',
      content: 'content',
    };

    await expect(useCase.execute(input)).rejects.toThrow(
      'PROMPT_ALREADY_EXISTS'
    );
  });
});
