import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../guards/roles.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles (Admin only)' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a role (Admin only)' })
  create(@Body() body: { name: string; permissions: string[] }) {
    return this.rolesService.create(body.name, body.permissions);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update role permissions (Admin only)' })
  updatePermissions(@Param('id') id: string, @Body() body: { permissions: string[] }) {
    return this.rolesService.updatePermissions(id, body.permissions);
  }
}
