import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptsUseCase', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'First Prompt',
      content: 'Content of the first prompt',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Second Prompt',
      content: 'Content of the second prompt',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Third Prompt',
      content: 'Content of the third prompt',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const repository: PromptRepository = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByTitle: jest.fn(),
    findMany: async () => input,
    searchMany: async (term: string) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLowerCase())
      ),
  };

  it('should return all prompts when the search term is empty', async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const result = await useCase.execute('');

    expect(result).toHaveLength(3);
  });

  it('should filter the list of prompts by the searched term', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'Second';

    const result = await useCase.execute(query);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should apply trim to searches with whitespace-only terms and return the full list of prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '   ';

    const result = await useCase.execute(query);

    expect(result).toHaveLength(3);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('should search for a term containing whitespace, handling it with trim', async () => {
    const firstElement = input.splice(0, 1);
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '   First   ';

    const result = await useCase.execute(query);

    expect(result).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(query.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should handle undefined or null terms and return the complete list of prompts', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = undefined as unknown as string;

    const results = await useCase.execute(query);

    expect(results).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
