import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import bunnyConfig from './config/bunny.config';
import { FilesModule } from './controller/files.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    FilesModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, load: [bunnyConfig] }),
  ],
})
export class AppModule {}
