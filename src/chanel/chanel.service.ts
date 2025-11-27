import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BunnyService } from '../common/bunny.service';
import { CreateChanelDto } from './dto/create-chanel.dto';
import { UpdateChanelDto } from './dto/update-chanel.dto';

@Injectable()
export class ChanelService {
  constructor(
    private prisma: PrismaService,
    private bunny: BunnyService,
  ) {}

  // CREATE CHANNEL
  async create(adminId: string, dto: CreateChanelDto, pfp?: Express.Multer.File, banner?: Express.Multer.File) {
    const adminHasChannel = await this.prisma.channel.findUnique({
      where: { adminId },
    });

    if (adminHasChannel) throw new BadRequestException("Admin allaqachon kanal yaratgan");

    let pfpUrl: string | undefined;
    let bannerUrl: string | undefined;

    if (pfp) pfpUrl = await this.bunny.uploadFile(pfp, "channel_pfp");
    if (banner) bannerUrl = await this.bunny.uploadFile(banner, "channel_banner");

    return this.prisma.channel.create({
      data: {
        id: crypto.randomUUID(),
        adminId,
        name: dto.name,
        bio: dto.bio,
        pfp: pfpUrl,
        banner: bannerUrl,
      },
    });
  }

  // GET ALL
  getAll() {
    return this.prisma.channel.findMany();
  }

  // GET ONE
  async getOne(id: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException("Kanal topilmadi");
    return channel;
  }

  // UPDATE
  async update(
    id: string,
    dto: UpdateChanelDto,
    pfp?: Express.Multer.File,
    banner?: Express.Multer.File
  ) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException("Kanal topilmadi");

    let newPfp = channel.pfp;
    let newBanner = channel.banner;

    // PFP update → eski pfp o‘chadi
    if (pfp) {
      if (channel.pfp) await this.bunny.deleteFile(channel.pfp);
      newPfp = await this.bunny.uploadFile(pfp, "channel_pfp");
    }

    // Banner update → eski banner o‘chadi
    if (banner) {
      if (channel.banner) await this.bunny.deleteFile(channel.banner);
      newBanner = await this.bunny.uploadFile(banner, "channel_banner");
    }

    return this.prisma.channel.update({
      where: { id },
      data: {
        name: dto.name ?? channel.name,
        bio: dto.bio ?? channel.bio,
        pfp: newPfp,
        banner: newBanner,
      },
    });
  }

  // DELETE CHANNEL (pfp + banner ham o‘chadi)
  async delete(id: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });
    if (!channel) throw new NotFoundException("Kanal topilmadi");

    if (channel.pfp) await this.bunny.deleteFile(channel.pfp);
    if (channel.banner) await this.bunny.deleteFile(channel.banner);

    return this.prisma.channel.delete({ where: { id } });
  }
}
