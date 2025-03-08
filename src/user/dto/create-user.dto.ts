import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/constant/gender.enum';

export class CreateUserDto {
  name: string;

  @IsNotEmpty({
    message: 'Password không được để trống',
  })
  password: string;

  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;
  address: string;
  rolesID: string[];
  age: string;
}

export class RegisterUserDto {
  @IsNotEmpty({
    message: 'Name không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Password không được để trống',
  })
  password: string;

  avatar: string;

  @IsEmail()
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;
  address: string;
  rolesID: string[];
  @IsEnum(Gender, {
    message: 'Giới tính không hợp lệ',
  })
  gender: string;
  age: string;
}
