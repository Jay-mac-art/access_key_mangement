import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entity/user.entity';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { ApplicationLogger } from '../../common/logging/ApplicationLogger';

@Injectable()
export class AuthService {
  private readonly logger = new ApplicationLogger();

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    this.logger.log(`Signing up user: ${createUserDto.email}`);
    const { email, password } = createUserDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: [{ email: normalizedEmail }],
    });
    if (existingUser) {
      this.logger.warn(`Signup conflict: ${normalizedEmail}`);
      throw new ConflictException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      role: createUserDto.role ?? 'USER',
      email: normalizedEmail,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    this.logger.log(`User registered: ${normalizedEmail}`);
    return { message: 'User successfully registered' };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; email: string; role: string }> {
    this.logger.log(`Login attempt: ${loginUserDto.email}`);
    const { email, password } = loginUserDto;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      this.logger.warn(`Invalid login (not found): ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid login (bad password): ${normalizedEmail}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(`Login successful: ${normalizedEmail}`);
    return { access_token, email: user.email, role: user.role };
  }
}
