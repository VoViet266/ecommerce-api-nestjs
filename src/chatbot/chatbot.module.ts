import { Module } from '@nestjs/common';
import { ChatBotService } from './chatbot.service';
import { ChatBotController } from './chatbot.controller';
import { ProductModule } from 'src/product/product.module';
import { ConfigModule } from '@nestjs/config';
import { Product, ProductSchema } from 'src/product/schemas/product.schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [ChatBotController],
  providers: [ChatBotService],
  exports: [ChatBotService],
  imports: [
    ProductModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development.local',
    }),
  ],
})
export class ChatbotModule {}
