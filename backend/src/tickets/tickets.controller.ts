import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  QueryTicketDto,
  UpdateTicketDto,
} from './dto/ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  create(@Body() body: CreateTicketDto) {
    return this.service.create(body);
  }

  @Get()
  list(@Query() query: QueryTicketDto) {
    return this.service.list(query);
  }

  @Get(':id')
  read(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTicketDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
