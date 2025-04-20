import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        userId,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.event.findMany({
      where: { userId },
      include: {
        transactions: true,
      },
    });
  }

  findOne(userId: number, id: number) {
    return this.prisma.event.findFirst({
      where: { id, userId },
      include: {
        transactions: true,
      },
    });
  }

  update(userId: number, id: number, updateEventDto: UpdateEventDto) {
    const data: any = { ...updateEventDto };
    if (updateEventDto.startDate) {
      data.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      data.endDate = new Date(updateEventDto.endDate);
    }

    return this.prisma.event.update({
      where: { id, userId },
      data,
      include: {
        transactions: true,
      },
    });
  }

  remove(userId: number, id: number) {
    return this.prisma.event.delete({
      where: { id, userId },
    });
  }
}
