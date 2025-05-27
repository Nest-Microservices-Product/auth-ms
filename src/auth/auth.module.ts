import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config/getEnvs';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '1h' },
    }),
    NatsModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
