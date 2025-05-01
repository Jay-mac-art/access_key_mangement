import { Controller, Post, Body, Param, Delete, Patch, Get, UsePipes, ValidationPipe , UseGuards} from '@nestjs/common';
import { AccessKeyService } from './access_key.service';
import { CreateKeyDto , UpdateKeyDto} from './dto/access_key.dto';
import { JwtAdminAuthGuard } from 'src/common/guards/admin_auth.guard';


@Controller('access-key')
export class AccessKeyController {
  constructor(private readonly accessKeyService: AccessKeyService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post('generate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateKey(@Body() createKeyDto: CreateKeyDto) {
    const { rateLimit, expiration } = createKeyDto;
    return this.accessKeyService.generateKey(rateLimit, new Date(expiration));
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  async deleteKey(@Param('id') id: string) {
    await this.accessKeyService.deleteKey(id);
    return { message: 'Key deleted successfully' };
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateKey(
    @Param('id') id: string,
    @Body() dto: UpdateKeyDto,
  ) {
    const {
      rateLimit,
      expiration,
      currentUsage,
      threshold,
    } = dto;
    return this.accessKeyService.updateKey(
      id,
      rateLimit,
      expiration ? new Date(expiration) : undefined,
      currentUsage,
      threshold,
    );
  }

// Not auth for User
  @Get(':key')
  async getKeyDetails(@Param('key') key: string) {
    return this.accessKeyService.getKeyDetails(key);
  }


  @UseGuards(JwtAdminAuthGuard)
  @Post('disable/:key')
  async disableKey(@Param('key') key: string) {
    await this.accessKeyService.disableKey(key);
    return { message: 'Key disabled successfully' };
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get()
  async listKeys() {
    return this.accessKeyService.listKeys();
  }
}