import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ListingType } from '@prisma/client';
import { ListingsService } from './listings.service';

type CreateListingBody = {
  type: ListingType;
  petName?: string;
  petType: string;
  breed?: string;
  age?: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  imageUrl?: string;
};

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(
    @Query('type') type?: ListingType,
    @Query('q') q?: string,
    @Query('location') location?: string,
  ) {
    return this.listingsService.findAll({ type, q, location });
  }

  @Post()
  create(@Body() body: CreateListingBody) {
    return this.listingsService.create(body);
  }
}
