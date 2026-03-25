import {
  createPromptAction,
  searchPromptAction,
  deletePromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedSearchExecute })),
}));

jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedCreateExecute })),
}));

jest.mock('@/core/application/prompts/update-prompt.use-case', () => ({
  UpdatePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedUpdateExecute })),
}));

jest.mock('@/core/application/prompts/delete-prompt.use-case', () => ({
  DeletePromptUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: mockedDeleteExecute })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
    (revalidatePath as jest.Mock).mockReset();
  });

  describe('createPromptAction', () => {
    it('should create a prompt successfully', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);
      const data = {
        title: 'Title',
        content: 'Content',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso!');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it('should return a validation error when the fields are empty', async () => {
      const data = {
        title: '',
        content: '',
      };

      const result = await createPromptAction(data);

      // console.log(result?.errors);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('should return an error when PROMPT_ALREADY_EXISTS occurs', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));
      const data = {
        title: 'duplicado',
        content: 'duplicado',
      };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });

    it('should return a generic error when creation fails', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const data = {
        title: 'title',
        content: 'content',
      };

      const result = await createPromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao criar o prompt');
    });
  });

  describe('updatePromptAction', () => {
    it('should update successfully', async () => {
      mockedUpdateExecute.mockResolvedValue({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'title',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt atualizado com sucesso');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });
    it('should return a validation error when fields are missing', async () => {
      const data = {
        id: '',
        title: '',
        content: '',
      };

      const result = await updatePromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });
    it('should return an error when prompt does not exist', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'title',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Prompt não encontrado');
    });
    it('should return a generic error when update fails', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'title',
        content: 'content',
      };

      const result = await updatePromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao atualizar o prompt');
    });
  });

  describe('deletePromptAction', () => {
    it('should remove successfully', async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Prompt removido com sucesso');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it('should return an error when id is empty', async () => {
      const promptId = '';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Id do prompt é obrigatório');
    });

    it('should return an error when prompt does not exist', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should return a generic error when action fails', async () => {
      mockedDeleteExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao remover o prompt');
    });
  });

  describe('searchPromptAction', () => {
    it('should return success with non-empty search term', async () => {
      const input = [{ id: '1', title: 'AI Title', content: 'Content' }];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', 'AI');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return success and list all prompts when the term is empty', async () => {
      const input = [
        { id: '1', title: 'First', content: 'Content 01' },
        { id: '2', title: 'Second', content: 'Content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);
      const formData = new FormData();
      formData.append('q', '');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBeDefined();
      expect(result.prompts).toEqual(input);
    });

    it('should return a generic error when search fails', async () => {
      const error = new Error('UNKNOWN');
      mockedSearchExecute.mockResolvedValue(error);

      const formData = new FormData();
      formData.append('q', 'error');

      const result = await searchPromptAction({ success: true }, formData);

      expect(result.success).toBe(false);
      expect(result.prompts).toBe(undefined);
      expect(result.message).toBe('Falha ao buscar prompts.');
    });

    it('should trim spaces from term before executing', async () => {
      const input = [{ id: '1', title: 'title 01', content: 'content 01' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '   title 01  ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('title 01');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should treat missing query as empty term', async () => {
      const input = [
        { id: '1', title: 'first title', content: 'content 01' },
        { id: '2', title: 'second title', content: 'content 02' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
