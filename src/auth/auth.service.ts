import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Auth-service');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database initialized');
  }

  async loginUser(loginUserReq: LoginUserDto) {
    const { email, password } = loginUserReq;
    try {
      const user = await this.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_ACCEPTABLE,
          message: 'Invalid credentials',
        });
      }
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.NOT_ACCEPTABLE,
          message: 'Invalid credentials',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userRest } = user;
      return {
        user: userRest,
        token: 'token :)',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async registerUser(registerUserReq: RegisterUserDto) {
    const { email, password, name } = registerUserReq;
    try {
      const user = await this.user.findUnique({
        where: { email: email },
      });
      if (user) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'User already registered',
        });
      }
      const newUser = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userRest } = newUser;
      return {
        user: userRest,
        token: 'token :)',
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
