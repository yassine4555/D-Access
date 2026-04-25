import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMarketplaceItemDto } from './dto/create-marketplace-item.dto';
import { ListMarketplaceItemsDto } from './dto/list-marketplace-items.dto';
import { UpdateMarketplaceItemDto } from './dto/update-marketplace-item.dto';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller()
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('marketplace')
  @ApiOperation({ summary: 'List marketplace items' })
  findAll(@Query() query: ListMarketplaceItemsDto) {
    return this.marketplaceService.findAll(query);
  }

  @Get('marketplace/:id')
  @ApiOperation({ summary: 'Get marketplace item details' })
  findOne(@Param('id') id: string) {
    return this.marketplaceService.findOne(id);
  }

  @Get('marketplace/:id/redirect')
  @Redirect('', 302)
  @ApiOperation({ summary: 'Redirect to marketplace item product URL' })
  async redirectToProduct(@Param('id') id: string) {
    const item = await this.marketplaceService.findOne(id);
    return { url: item.productUrl };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get('admin/marketplace')
  @ApiOperation({ summary: 'List marketplace items (admin/moderator)' })
  findAllAdmin(@Query() query: ListMarketplaceItemsDto) {
    return this.marketplaceService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post('admin/marketplace')
  @ApiOperation({ summary: 'Create marketplace item (admin/moderator)' })
  create(@Body() body: CreateMarketplaceItemDto) {
    return this.marketplaceService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch('admin/marketplace/:id')
  @ApiOperation({ summary: 'Update marketplace item (admin/moderator)' })
  update(@Param('id') id: string, @Body() body: UpdateMarketplaceItemDto) {
    return this.marketplaceService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Delete('admin/marketplace/:id')
  @ApiOperation({ summary: 'Delete marketplace item (admin/moderator)' })
  remove(@Param('id') id: string) {
    return this.marketplaceService.remove(id);
  }
}
