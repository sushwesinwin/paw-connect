import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

type ChatBody = {
  sessionId?: string;
  message: string;
};

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() body: ChatBody) {
    return this.chatService.create(body);
  }
}
