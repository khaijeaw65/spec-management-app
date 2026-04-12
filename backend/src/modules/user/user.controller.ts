import { Controller, Param, Get, Patch, Body, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import {
  zodToOpenapi,
  zodToOpenapiResponse,
} from '../../swagger/zod-to-openapi';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import {
  type UpdateUserDto,
  UpdateUserSchema,
  UserSchema,
} from '@spec-app/schemas';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ schema: zodToOpenapiResponse(UserSchema) })
  getById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: zodToOpenapi(UpdateUserSchema) })
  @ApiOkResponse({ schema: zodToOpenapiResponse(UserSchema) })
  updateById(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ schema: zodToOpenapiResponse(UserSchema) })
  deleteById(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
