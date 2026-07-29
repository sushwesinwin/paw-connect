import { Controller, Get, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('search')
  search(@Query('q') q?: string) {
    return this.knowledgeService.search(q);
  }
}
