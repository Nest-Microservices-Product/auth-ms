import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import { RecoverPasswordDto } from './dto/recoverPassword.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.register.user' })
  registerUser(@Payload() registerUserReq: RegisterUserDto) {
    return this.authService.registerUser(registerUserReq);
  }
  @MessagePattern({ cmd: 'auth.login.user' })
  loginUser(@Payload() loginUserReq: LoginUserDto) {
    return this.authService.loginUser(loginUserReq);;
  }
  @MessagePattern({ cmd: 'auth.verify.user' })
  verifyToken(@Payload() token : string) {
    return this.authService.verifyToken(token);
  }
  @MessagePattern({ cmd: 'auth.get.password'})
  getTokenRecoverPassword(@Payload() email: string) {
    return this.authService.getTokenRecoverPassword(email);
  }
  @MessagePattern({ cmd: 'auth.recover.password'})
  recoverPassword(@Payload() recoverPassword: RecoverPasswordDto) {
    return this.authService.recoverPassword(recoverPassword);
  }

}
