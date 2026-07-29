import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ChatRole } from '@prisma/client';
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
    const sources = await this.knowledgeService.searchForContext(message);

    await this.prisma.chatMessage.create({
      data: { sessionId: session.id, role: ChatRole.USER, content: message },
    });

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
