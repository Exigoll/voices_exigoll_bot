import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";

import {
  IsNotEmptyField,
  MaxLengthMessage,
  MinLengthMessage
} from "@/common/error-messages";

export class RegisterDto {
  @ApiProperty({ example: "example@mail.com", required: true })
  @IsEmail({}, { message: "Неверный формат email" })
  @IsNotEmpty({ message: IsNotEmptyField })
  email: string;

  @ApiProperty({ example: "example", required: true })
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]*$/, {
    message: "Username может содержать только латинские буквы, и цифры"
  })
  @MinLength(5, { message: MinLengthMessage(5) })
  @MaxLength(30, { message: MaxLengthMessage(30) })
  @IsNotEmpty({ message: IsNotEmptyField })
  username: string;

  @ApiProperty({ example: "examplePassword123!@", required: true })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,30}$/,
    {
      message:
        "Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ."
    }
  )
  @MinLength(5, { message: MinLengthMessage(5) })
  @MaxLength(30, { message: MaxLengthMessage(30) })
  @IsNotEmpty({ message: IsNotEmptyField })
  password: string;
}
