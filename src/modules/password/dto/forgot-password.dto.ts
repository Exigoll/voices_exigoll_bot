import { IsEmail, IsNotEmpty } from "class-validator";

import { IsNotEmptyField } from "@/common/error-messages";

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty({ message: IsNotEmptyField })
  email: string;
}
