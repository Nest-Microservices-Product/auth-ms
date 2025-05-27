import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoginUserDto, RegisterUserDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadI } from './entities';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';
import { NATS_SERVICE } from 'src/shared/constants/NATS_SERVICE';
import { AUTH_SERVICES_NAMES } from 'src/shared/entities/AuthServicesNames';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Auth-service');
  constructor(private readonly jwtService: JwtService, @Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
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
        token: await this.signJwt(userRest),
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
        token: await this.signJwt(userRest),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async verifyToken(token: string) {
    try {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        iat: _,
        exp,
        ...userPayload
      } = await this.jwtService.decode(token);
      const currentDate = new Date();
      const expiresDate = new Date(exp);
      return {
        user: userPayload,
        isExpired: +expiresDate <= +currentDate / 1000,
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: error.message,
      });
    }
  }

  private async signJwt(payload: JwtPayloadI) {
    return this.jwtService.sign(payload);
  }

  async getTokenRecoverPassword(email: string) {
    try {

      const user = await this.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        throw new RpcException({
          status: HttpStatus.NOT_ACCEPTABLE,
          message: 'User not existed',
        });
      }

      const { password: _, ...userRest } = user;

      const token = await this.signJwt(userRest);

      return {
        token
      };

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async recoverPassword(recoverPassword: RecoverPasswordDto) {
    try {
      
      const decodePaylod = await this.verifyToken(recoverPassword.token);
      
      if(decodePaylod.isExpired) {
        throw new RpcException({
          status: HttpStatus.UNAUTHORIZED,
          message: "Token is expired"
        });
      }

      const updateUser = await this.user.update({
        where: {
          id: decodePaylod.user.id
        },
        data: {
          password: bcrypt.hashSync(recoverPassword.password, 10) || recoverPassword.password
        }
      });

      return {
        message: "User's password was updated successfully",
      };

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
