import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.services';
import {
  CredentialUserDto,
  newChangePasswordDto,
} from 'src/dto/credentialUserDto';
import { CreateUserDto } from 'src/dto/createUser.dto';
//import { AllowedUserIds } from "src/roles/roles.decorator";
import { AuthGuard } from 'src/Guards/auth.guard';
import { RolesGuard } from 'src/Guards/roles.guard';
import { Request, Response } from 'express';
import { CreateUserDtoByAuth0 } from 'src/dto/createUserByAuth0Dto';
import { ForgotPasswordDto } from 'src/dto/forgotPasswordDto';
import { ResetPasswordDto } from 'src/dto/resetPasswordDto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('sigIn')
  async sigIn(@Body() login: CredentialUserDto) {
    try {
      return await this.authservice.sigIn(login);
    } catch (error) {
      if (error instanceof NotFoundException) {
        const status = error.getStatus();
        return {
          statusCode: status,
          message: error.message,
        };
      } else if (error instanceof UnauthorizedException) {
        return {
          statusCode: 401,
          message: error.message,
        };
      } else if (error instanceof BadRequestException) {
        return {
          statusCode: 400,
          message: error.message,
        };
      } else {
        throw new HttpException('unexpected error', HttpStatus.CONFLICT);
      }
    }
  }

  @Post('newPasswordChange')
  async newPasswordUser(@Body() newCredential: newChangePasswordDto) {

    try {
      return await this.authservice.newPasswordLogin(newCredential);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          statusCode: 400,
          message: error.message,
        };
      } else if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
        };
      } else if (error instanceof UnauthorizedException) {
        return {
          statusCode: 401,
          message: error.message,
        };
      } else {
        throw new HttpException('Error inesperado', HttpStatus.CONFLICT);
      }
    }

  }

  @Post('sigUp')
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Optional parent ID to filter users',
  })
  async createUser(
    @Query('parentId') parentId: string,
    @Body() userRegister: CreateUserDto,
  ) {
    try {
      return this.authservice.sigUp(userRegister, parentId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const status = error.getStatus();
        return {
          statusCode: status,
          message: error.message,
        };
      } else {
        throw new HttpException('Error inesperado', HttpStatus.BAD_REQUEST);

      }
    }
  }

  @Post('forgot-password')
  async requestPasswordReset(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const response = await this.authservice.requestPasswordReset(email);
    return response; // Esto ya será un objeto JSON
  }
  
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, confirmPassword } = resetPasswordDto;
    if (newPassword !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
    }

    return await this.authservice.resetPassword(email, newPassword); 
}
}