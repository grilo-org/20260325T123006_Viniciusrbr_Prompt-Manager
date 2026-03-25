import {
  SidebarContent,
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen, waitFor } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const pushMock = jest.fn();
const setQueryMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('nuqs', () => ({
  useQueryState: (key: string) => {
    const [value, setValue] = useState(mockSearchParams.get(key) ?? '');

    const setQuery = (nextValue: string) => {
      setQueryMock(nextValue);
      setValue(nextValue);
    };

    return [value, setQuery] as const;
  },
}));

const initialPrompts = [
  {
    id: '1',
    title: 'Prompt 1',
    content: 'Content 1',
  },
];

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  return render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('base', () => {
    it('should render a new prompt button', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeVisible(); // aside element

      expect(
        screen.getByRole('button', { name: 'Novo prompt' })
      ).toBeInTheDocument();
    });

    it('should render the prompt list', () => {
      const input = [
        { id: '1', title: 'Example 1', content: 'Content 1' },
        { id: '2', title: 'Example 2', content: 'Content 2' },
        { id: '3', title: 'Example 3', content: 'Content 3' },
      ];

      makeSut({ prompts: input });

      expect(screen.getByText(input[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
    });

    it('should update the search input value when typing', async () => {
      const text = 'AI';
      makeSut();
      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, text);

      expect(searchInput).toHaveValue(text);
    });
  });

  describe('SidebarContent - Mobile', () => {
    it('should open and close the mobile menu', async () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('translate-x-full');

      const openButton = screen.getByRole('button', { name: 'Abrir menu' });
      await user.click(openButton);
      expect(aside.className).toContain('translate-x-0');

      const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
      await user.click(closeButton);
      expect(aside.className).toContain('translate-x-full');
    });
  });

  describe('collapse / expand', () => {
    it('should start expanded and display the minimize button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      expect(collapseButton).toBeVisible();

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should expand again when clicking the expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir sidebar/i,
      });
      await user.click(expandButton);

      expect(
        screen.getByRole('button', {
          name: /minimizar sidebar/i,
        })
      ).toBeVisible();
      expect(
        screen.queryByRole('navigation', {
          name: 'Lista de prompts',
        })
      ).toBeVisible();
    });

    it('should contract and show the expand button.', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole('button', {
        name: /expandir sidebar/i,
      });

      expect(expandButton).toBeInTheDocument();
      expect(collapseButton).not.toBeInTheDocument();
    });

    it('should display the create new prompt button in the minimized sidebar', async () => {
      makeSut();
      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });

      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: 'Novo prompt',
      });
      expect(newPromptButton).toBeVisible();
    });

    it('should not display the prompts list in the minimized sidebar', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar sidebar/i,
      });
      await user.click(collapseButton);

      const nav = screen.queryByRole('navigation', {
        name: 'Lista de prompts',
      });
      expect(nav).not.toBeInTheDocument();
    });
  });

  describe('new prompt navigation', () => {
    it('should navigate to /new when clicking the new prompt button', async () => {
      makeSut();

      const newButton = screen.getByRole('button', { name: 'Novo prompt' });

      await user.click(newButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });

  describe('search', () => {
    it('should navigate with URL-encoded when typing and clearing', async () => {
      const text = 'A B';
      makeSut();

      const searchInput = screen.getByPlaceholderText('Buscar prompts...');
      await user.type(searchInput, text);

      expect(setQueryMock).toHaveBeenCalled();
      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(text);

      await user.clear(searchInput);
      const lastClearCall = setQueryMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('');
    });

    it('should submit the form by typing in the search input', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      makeSut();

      const searchInput = screen.getByPlaceholderText('Buscar prompts...');

      await user.type(searchInput, 'AI');

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });

    it('should automatically submit on component mount when a query exists', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      const text = 'text';
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });

  it('should start the search field with the search param', async () => {
    const text = 'inicial';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();

    const searchInput = screen.getByPlaceholderText('Buscar prompts...');

    await waitFor(() => expect(searchInput).toHaveValue(text));
  });
});
