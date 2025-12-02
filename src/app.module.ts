import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import bunnyConfig from './config/bunny.config';
import { FilesModule } from './controller/files.module';
import { ChanelModule } from './chanel/chanel.module';
import { SubjectModule } from './subject/subject.module';
import { TestsModule } from './tests/tests.module';
import { CheatingModule } from './cheating/cheating.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  providers: [AppService, ],
  imports: [
    AuthModule,
    FilesModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, load: [bunnyConfig] }),
    ChanelModule,
    SubjectModule,
    TestsModule,
    CheatingModule,
    UsersModule,
  ],
})
export class AppModule {}
