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
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    appointmentRequest: {
      create: jest.fn().mockResolvedValue({ id: 'appointment-1' }),
    },
    petListing: {
      create: jest.fn().mockResolvedValue({ id: 'listing-1' }),
    },
    staffMember: {
      findMany: jest.fn(),
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
    prisma.chatMessage.findMany.mockResolvedValue([]);
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

  it('asks for appointment details when the user requests grooming', async () => {
    await expect(
      service.create({ message: 'I want to book grooming for my cat' }),
    ).resolves.toEqual({
      sessionId: 'session-1',
      answer: expect.stringContaining('Please reply with'),
      citations: [],
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(prisma.appointmentRequest.create).not.toHaveBeenCalled();
  });

  it('creates an appointment when required chat details are provided', async () => {
    prisma.chatMessage.findMany.mockResolvedValue([
      {
        role: ChatRole.ASSISTANT,
        content:
          'I can create an appointment request. Please reply with: pet name.',
      },
    ]);

    await expect(
      service.create({
        sessionId: 'session-1',
        message:
          'service type: grooming\npet name: Milo\npet type: cat\npreferred date and time: 2026-08-02 10:00\ncontact name: Su\ncontact email: su@example.com',
      }),
    ).resolves.toEqual({
      sessionId: 'session-1',
      answer: 'Done. I created a grooming appointment request for Milo.',
      citations: [],
    });

    expect(prisma.appointmentRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        serviceType: 'GROOMING',
        petName: 'Milo',
        petType: 'cat',
        contactName: 'Su',
        contactEmail: 'su@example.com',
      }),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('answers staff availability from database records', async () => {
    prisma.staffMember.findMany.mockResolvedValue([
      {
        name: 'Dr. Maya Lee',
        role: 'VET',
        specialty: 'General check-up',
        availableDays: ['Monday', 'Friday'],
        startTime: '09:00',
        endTime: '13:00',
      },
    ]);

    await expect(
      service.create({ message: 'Who is available for vet service?' }),
    ).resolves.toEqual({
      sessionId: 'session-1',
      answer:
        'Available staff:\n- Dr. Maya Lee (Vet): General check-up. Available Monday, Friday from 09:00 to 13:00.',
      citations: [{ title: 'Staff availability', category: 'services' }],
    });

    expect(prisma.staffMember.findMany).toHaveBeenCalledWith({
      where: {
        role: 'VET',
        status: 'AVAILABLE',
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
