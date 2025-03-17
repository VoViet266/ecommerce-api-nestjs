import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permission/permissions.module';
import { RolesModule } from './role/roles.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { MongooseConfigService } from './config/mongodb.config';
import { FileModule } from './file/file.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CloundinaryModule } from './cloundinary/cloundinary.module';
import { MailModule } from './mail/mail.module';
// import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development.local', '.env.production.local'],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        socket: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
        username: configService.get<string>('REDIS_USERNAME'),
        password: configService.get<string>('REDIS_PASSWORD'),
        ttl: 600 * 1000, // Thời gian sống của cache (tính bằng giây)
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
    ProductModule,
    CategoryModule,
    BrandModule,
    OrderModule,
    CartModule,
    FileModule,
    CloundinaryModule,
    MongooseModule.forRootAsync(MongooseConfigService),
    MailModule,
  ],
})
export class AppModule {}
