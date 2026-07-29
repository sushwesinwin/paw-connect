import { ServiceUnavailableException } from '@nestjs/common';
import { ChatRole } from '@prisma/client';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const prisma = {
    chatSession: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
    },
    chatMessage: {
      create: jest.fn(),
    },
  };
  const knowledgeService = {
    searchForContext: jest.fn().mockResolvedValue([
      {
        title: 'Persian Cat Grooming',
        category: 'grooming',
        content: 'Persian cats usually need daily brushing.',
      },
    ]),
  };
  const service = new ChatService(prisma as never, knowledgeService as never);
  const originalApiKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Brush Persian cats daily.' } }],
      }),
    }) as jest.Mock;
  });

  afterAll(() => {
    process.env.OPENROUTER_API_KEY = originalApiKey;
  });

  it('answers with citations and saves chat messages', async () => {
    await expect(
      service.create({ message: 'How often should I groom a Persian cat?' }),
    ).resolves.toEqual({
      sessionId: 'session-1',
      answer: 'Brush Persian cats daily.',
      citations: [{ title: 'Persian Cat Grooming', category: 'grooming' }],
    });

    expect(prisma.chatMessage.create).toHaveBeenCalledWith({
      data: {
        sessionId: 'session-1',
        role: ChatRole.USER,
        content: 'How often should I groom a Persian cat?',
      },
    });
    expect(prisma.chatMessage.create).toHaveBeenCalledWith({
      data: {
        sessionId: 'session-1',
        role: ChatRole.ASSISTANT,
        content: 'Brush Persian cats daily.',
      },
    });
  });

  it('requires an OpenRouter API key', async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(service.create({ message: 'hello' })).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
