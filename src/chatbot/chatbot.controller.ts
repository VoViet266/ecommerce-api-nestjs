// src/chat/chat.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ChatBotService } from './chatbot.service';
import { Public } from 'src/decorator/customize';

@Controller('chat')
export class ChatBotController {
  constructor(private readonly chatService: ChatBotService) {}

  @Post()
  @Public()
  async sendMessage(@Body('message') message: string) {
    const reply = await this.chatService.sendMessage(message);
    return { reply };
  }
}
  