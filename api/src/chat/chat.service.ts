import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ChatRole, ListingType, ServiceType } from '@prisma/client';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { PrismaService } from '../prisma/prisma.service';

type ChatInput = {
  sessionId?: string;
  message: string;
};

type Source = {
  title: string;
  category: string;
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

type ChatHistory = Array<{ role: ChatRole; content: string }>;

type WorkflowResponse = {
  answer: string;
  citations: Array<{ title: string; category: string }>;
};

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async create(input: ChatInput) {
    const message = input.message?.trim();
    if (!message) {
      throw new BadRequestException('message is required');
    }

    const session = await this.getSession(input.sessionId);
    const history = await this.getHistory(session.id);

    await this.prisma.chatMessage.create({
      data: { sessionId: session.id, role: ChatRole.USER, content: message },
    });

    const workflow = await this.handleWorkflow(message, history);
    if (workflow) {
      await this.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: ChatRole.ASSISTANT,
          content: workflow.answer,
        },
      });

      return {
        sessionId: session.id,
        answer: workflow.answer,
        citations: workflow.citations,
      };
    }

    const sources = await this.knowledgeService.searchForContext(message);
    const answer = await this.askModel(message, sources);

    await this.prisma.chatMessage.create({
      data: { sessionId: session.id, role: ChatRole.ASSISTANT, content: answer },
    });

    return {
      sessionId: session.id,
      answer,
      citations: sources.map(({ title, category }) => ({ title, category })),
    };
  }

  private async getSession(sessionId?: string) {
    if (sessionId) {
      const existing = await this.prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.chatSession.create({ data: {} });
  }

  private getHistory(sessionId: string) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 12,
    });
  }

  private async handleWorkflow(
    message: string,
    history: ChatHistory,
  ): Promise<WorkflowResponse | undefined> {
    const text = message.toLowerCase();
    const previousAssistant = [...history]
      .reverse()
      .find((item) => item.role === ChatRole.ASSISTANT)?.content.toLowerCase();

    if (
      this.isAppointmentIntent(text) ||
      (previousAssistant?.includes('appointment') &&
        previousAssistant.includes('please reply with'))
    ) {
      return this.handleAppointment(message, history);
    }

    if (
      this.isListingIntent(text) ||
      (previousAssistant?.includes('pet listing') &&
        previousAssistant.includes('please reply with'))
    ) {
      return this.handleListing(message, history);
    }

    return undefined;
  }

  private async handleAppointment(
    message: string,
    history: ChatHistory,
  ): Promise<WorkflowResponse> {
    const fields = parseFields([...history.map((item) => item.content), message]);
    const serviceType = inferServiceType(
      `${message}\n${history.map((item) => item.content).join('\n')}`,
    );
    const preferredAt = parseDate(fields.preferredAt);
    const missing = [
      ['petName', 'pet name'],
      ['petType', 'pet type'],
      ['preferredAt', 'preferred date and time'],
      ['contactName', 'contact name'],
    ].filter(([key]) => !fields[key]);

    if (!fields.contactEmail && !fields.contactPhone) {
      missing.push(['contact', 'contact email or phone']);
    }

    if (!serviceType) {
      missing.push(['serviceType', 'service type: grooming or vet']);
    }

    if (fields.preferredAt && !preferredAt) {
      missing.push(['validDate', 'a valid date and time, like 2026-08-02 10:00']);
    }

    if (missing.length) {
      return {
        answer: `I can create an appointment request. Please reply with: ${missing
          .map(([, label]) => label)
          .join(', ')}.\n\nExample:\npet name: Milo\npet type: cat\npreferred date and time: 2026-08-02 10:00\ncontact name: Su\ncontact email: su@example.com`,
        citations: [],
      };
    }

    if (!serviceType || !preferredAt) {
      throw new BadRequestException('Appointment request is incomplete');
    }

    await this.prisma.appointmentRequest.create({
      data: {
        serviceType,
        petName: fields.petName,
        petType: fields.petType,
        preferredAt,
        contactName: fields.contactName,
        contactPhone: fields.contactPhone,
        contactEmail: fields.contactEmail,
        notes: fields.notes,
      },
    });

    return {
      answer: `Done. I created a ${serviceType.toLowerCase()} appointment request for ${fields.petName}.`,
      citations: [],
    };
  }

  private async handleListing(
    message: string,
    history: ChatHistory,
  ): Promise<WorkflowResponse> {
    const combined = `${message}\n${history.map((item) => item.content).join('\n')}`;
    const fields = parseFields([combined]);
    const type = inferListingType(combined);
    const missing = [
      ['petType', 'pet type'],
      ['location', 'location'],
      ['description', 'description'],
      ['contactName', 'contact name'],
    ].filter(([key]) => !fields[key]);

    if (!fields.contactEmail && !fields.contactPhone) {
      missing.push(['contact', 'contact email or phone']);
    }

    if (!type) {
      missing.push(['listingType', 'listing type: lost, found, or adoption']);
    }

    if (missing.length) {
      return {
        answer: `I can create a pet listing. Please reply with: ${missing
          .map(([, label]) => label)
          .join(', ')}.\n\nExample:\nlisting type: lost\npet name: Cookie\npet type: dog\nlocation: Bedok\ndescription: brown poodle last seen near the park\ncontact name: Su\ncontact email: su@example.com`,
        citations: [],
      };
    }

    if (!type) {
      throw new BadRequestException('Listing request is incomplete');
    }

    await this.prisma.petListing.create({
      data: {
        type,
        petName: fields.petName,
        petType: fields.petType,
        breed: fields.breed,
        age: fields.age,
        location: fields.location,
        description: fields.description,
        contactName: fields.contactName,
        contactPhone: fields.contactPhone,
        contactEmail: fields.contactEmail,
      },
    });

    return {
      answer: `Done. I posted the ${type.toLowerCase()} listing for ${fields.petName || fields.petType}.`,
      citations: [],
    };
  }

  private isAppointmentIntent(text: string) {
    if (/how often|how do i|should i groom|tips|advice/.test(text)) {
      return false;
    }

    return /appointment|book|schedule|request.*(groom|gromm|vet)|need.*(groom|gromm|vet)|vet visit|checkup/.test(
      text,
    );
  }

  private isListingIntent(text: string) {
    return /lost|found|adopt|adoption|listing|missing pet/.test(text);
  }

  private async askModel(message: string, sources: Source[]) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('OPENROUTER_API_KEY is not set');
    }

    const context = sources.length
      ? sources
          .map(
            (source) =>
              `[${source.title} | ${source.category}]\n${source.content}`,
          )
          .join('\n\n')
      : 'No matching knowledge documents were found.';

    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:
            process.env.OPENROUTER_MODEL ??
            'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'system',
              content:
                'You are Paw Connect AI, a helpful pet-care assistant. Use the provided knowledge context first. If the context is limited, say so. For urgent symptoms, tell the user to contact a vet immediately.',
            },
            {
              role: 'user',
              content: `Knowledge context:\n${context}\n\nUser question:\n${message}`,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException('AI request failed');
    }

    const data = (await response.json()) as OpenRouterResponse;
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      throw new BadGatewayException('AI response was empty');
    }

    return answer;
  }
}

function parseFields(messages: string[]) {
  const fields: Record<string, string> = {};
  const aliases: Record<string, string> = {
    'pet name': 'petName',
    pet: 'petName',
    'pet type': 'petType',
    type: 'listingType',
    breed: 'breed',
    age: 'age',
    location: 'location',
    description: 'description',
    details: 'description',
    'contact name': 'contactName',
    name: 'contactName',
    email: 'contactEmail',
    'contact email': 'contactEmail',
    phone: 'contactPhone',
    'contact phone': 'contactPhone',
    notes: 'notes',
    'preferred date and time': 'preferredAt',
    'preferred time': 'preferredAt',
    'preferred at': 'preferredAt',
    date: 'preferredAt',
    service: 'serviceType',
    'service type': 'serviceType',
    'listing type': 'listingType',
  };

  for (const message of messages) {
    for (const part of message.split(/\n|,/)) {
      const match = part.match(/^\s*([a-zA-Z ]{2,28})\s*[:=-]\s*(.+)\s*$/);
      if (!match) continue;

      const key = aliases[match[1].trim().toLowerCase()];
      const value = match[2].trim();
      if (key && value) fields[key] = value;
    }
  }

  return fields;
}

function parseDate(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function inferServiceType(text: string) {
  const lower = text.toLowerCase();
  if (/groom|gromm/.test(lower)) return ServiceType.GROOMING;
  if (/vet|checkup|vaccine/.test(lower)) return ServiceType.VET;
  return undefined;
}

function inferListingType(text: string) {
  const lower = text.toLowerCase();
  if (/lost|missing/.test(lower)) return ListingType.LOST;
  if (/found/.test(lower)) return ListingType.FOUND;
  if (/adopt|adoption/.test(lower)) return ListingType.ADOPTION;
  return undefined;
}
