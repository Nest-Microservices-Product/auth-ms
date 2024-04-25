import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register.user' })
  registerUser(@Payload() registerUserReq: RegisterUserDto) {
    return registerUserReq;
  }
  @MessagePattern({ cmd: 'auth.login.user' })
  loginUser(@Payload() loginUserReq: LoginUserDto) {
    return loginUserReq;
  }
  @MessagePattern({ cmd: 'auth.verify.user' })
  verifyToken() {
    return 'verify token';
  }
}
